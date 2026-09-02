import { execFile, spawn } from "node:child_process";
import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";

import * as audit from "./audit-public-release.mjs";

const temporaryDirectories = [];
const execFileAsync = promisify(execFile);

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map(directory => rm(directory, { recursive: true, force: true }))
  );
});

async function createTemporaryTree(files) {
  const directory = await mkdtemp(
    path.join(os.tmpdir(), "audit-public-release-")
  );
  temporaryDirectories.push(directory);
  await Promise.all(
    Object.entries(files).map(async ([name, content]) => {
      const filePath = path.join(directory, name);
      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(filePath, content);
    })
  );
  return directory;
}

async function createGitFixture({ unmappedAsset = false, secret } = {}) {
  const directory = await createTemporaryTree({
    ".gitignore": ".env\n",
    LICENSE: "MIT License\n",
    "package.json": '{"license":"MIT"}\n',
    "asset-mapping.json":
      '{"registered.png":"/manus-storage/registered.png"}\n',
    "asset_sources.md": "`registered.png`\n",
    "THIRD_PARTY_NOTICES.md": "不受本项目 MIT 许可证覆盖\n`registered.png`\n",
    "client/src/pages/Home.tsx":
      'export const image = "/manus-storage/registered.png";\n',
    "client/public/manus-storage/registered.png": "fixture\n",
    ...(unmappedAsset
      ? { "client/public/manus-storage/nested/unmapped.txt": "fixture\n" }
      : {}),
    ...(secret ? { ".env": `OPENAI_API_KEY=${secret}\n` } : {}),
  });

  for (const args of [
    ["init", "--quiet"],
    ["config", "user.name", "Audit Fixture"],
    ["config", "user.email", "audit-fixture@example.invalid"],
    ["add", "."],
    ["commit", "--quiet", "-m", "fixture"],
  ]) {
    await execFileAsync("git", args, { cwd: directory });
  }
  return directory;
}

function runCli(cwd) {
  const scriptPath = fileURLToPath(
    new URL("./audit-public-release.mjs", import.meta.url)
  );
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath], {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", chunk => {
      stdout += chunk;
    });
    child.stderr.on("data", chunk => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", exitCode => resolve({ exitCode, stdout, stderr }));
  });
}

describe("scanCurrentTree", () => {
  it("scans an ignored .env file and recognizes an sk-proj- key without exposing its value", async () => {
    const secret = ["sk", "proj", "abcdefghijklmnopqrstuvwxyz1234567890"].join(
      "-"
    );
    const directory = await createTemporaryTree({
      ".gitignore": ".env\n",
      ".env": `OPENAI_API_KEY=${secret}\n`,
    });

    const result = await audit.scanCurrentTree({ rootDir: directory });

    assert.equal(result.rgExitCode, 0);
    assert.deepEqual(result.matchedPaths, [".env"]);
    assert.equal(JSON.stringify(result).includes(secret), false);
  });

  it("returns a clean result when the current tree has no credential match", async () => {
    const directory = await createTemporaryTree({
      ".gitignore": ".env\n",
      "README.md": "This file contains no credentials.\n",
    });

    const result = await audit.scanCurrentTree({ rootDir: directory });

    assert.equal(result.rgExitCode, 1);
    assert.deepEqual(result.matchedPaths, []);
  });

  it("rejects when rg cannot scan the requested tree instead of returning a clean result", async () => {
    const missingDirectory = path.join(
      os.tmpdir(),
      `audit-public-release-missing-${process.pid}-${Date.now()}`
    );

    await assert.rejects(
      audit.scanCurrentTree({ rootDir: missingDirectory }),
      /rg.*(exit code 2|failed)/i
    );
  });

  it("finds a direct asset file that is absent from the mapping", () => {
    assert.deepEqual(
      audit.findUnmappedAssetFiles(
        [
          "client/public/manus-storage/registered.png",
          "client/public/manus-storage/unmapped.png",
        ],
        ["/manus-storage/registered.png"]
      ),
      ["client/public/manus-storage/unmapped.png"]
    );
  });

  it("recursively finds an unmapped asset file in a nested directory", async () => {
    const directory = await createTemporaryTree({
      "asset-mapping.json":
        '{"registered.png":"/manus-storage/registered.png"}\n',
      "asset_sources.md": "`registered.png`\n",
      "THIRD_PARTY_NOTICES.md": "不受本项目 MIT 许可证覆盖\n`registered.png`\n",
      "client/src/pages/Home.tsx":
        'export const image = "/manus-storage/registered.png";\n',
      "client/public/manus-storage/registered.png": "fixture\n",
      "client/public/manus-storage/nested/unmapped.txt": "fixture\n",
    });

    const result = await audit.validateAssetClosure({
      rootDir: directory,
      execute: async () => ({ exitCode: 0, stdout: "", stderr: "" }),
    });

    assert.deepEqual(result.unmappedAssetFiles, [
      "client/public/manus-storage/nested/unmapped.txt",
    ]);
  });

  it("treats .env.local and .env.production.local as sensitive paths", () => {
    assert.equal(audit.isSensitivePath("config/.env"), true);
    assert.equal(audit.isSensitivePath("config/.env.local"), true);
    assert.equal(audit.isSensitivePath("config/.env.production.local"), true);
  });

  it("recognizes the CLI entry when the script path contains spaces", () => {
    const scriptPath = path.join(
      os.tmpdir(),
      "audit public release",
      "audit.mjs"
    );

    assert.equal(
      audit.isCliEntry(pathToFileURL(scriptPath).href, scriptPath),
      true
    );
  });

  it("reports an asset as unnoted when either source list omits it", () => {
    assert.deepEqual(
      audit.findUnnotedAssets(
        ["registered.png", "missing-notice.png"],
        "`registered.png`",
        "`registered.png`"
      ),
      ["missing-notice.png"]
    );
  });
});

describe("CLI", () => {
  it("exits 0 and emits a clean JSON result for a clean Git fixture", async () => {
    const directory = await createGitFixture();

    const result = await runCli(directory);

    assert.equal(result.exitCode, 0);
    assert.equal(JSON.parse(result.stdout).exitCode, 0);
  });

  it("exits 1 and reports a nested unmapped asset finding", async () => {
    const directory = await createGitFixture({ unmappedAsset: true });

    const result = await runCli(directory);
    const output = JSON.parse(result.stdout);

    assert.equal(result.exitCode, 1);
    assert.deepEqual(output.assets.unmappedAssetFiles, [
      "client/public/manus-storage/nested/unmapped.txt",
    ]);
    assert.deepEqual(output.findings, ["unmapped-asset-file"]);
  });

  it("exits 2 and emits a tool error when Git history cannot be scanned", async () => {
    const directory = await createTemporaryTree({
      "README.md": "fixture\n",
    });

    const result = await runCli(directory);
    const output = JSON.parse(result.stdout);

    assert.equal(result.exitCode, 2);
    assert.equal(output.exitCode, 2);
    assert.equal(output.error.type, "tool-error");
  });

  it("does not include a detected secret value in CLI stdout", async () => {
    const secret = ["sk", "proj", "abcdefghijklmnopqrstuvwxyz1234567890"].join(
      "-"
    );
    const directory = await createGitFixture({ secret });

    const result = await runCli(directory);

    assert.equal(result.exitCode, 1);
    assert.equal(result.stdout.includes(secret), false);
  });
});
