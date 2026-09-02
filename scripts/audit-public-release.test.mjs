import { execFile, spawn } from "node:child_process";
import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtemp,
  mkdir,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";

import * as audit from "./audit-public-release.mjs";

const temporaryDirectories = [];
const execFileAsync = promisify(execFile);
const REMOVED_SCREENSHOTS = [
  "client/public/manus-storage/grok-wiki-official-demo_ehbhr5hr.png",
  "client/public/manus-storage/deepwiki-official-ui_pa7wq5ja.png",
  "client/public/manus-storage/codewiki-docs-interface_zj7hgx6c.png",
];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map(directory => rm(directory, { recursive: true, force: true }))
  );
});

async function createTemporaryTree(
  files,
  directoryPrefix = "audit-public-release-"
) {
  const directory = await mkdtemp(path.join(os.tmpdir(), directoryPrefix));
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

function credentialUri(scheme, username = "audit-user") {
  return [
    scheme,
    "://",
    username,
    ":",
    ["synthetic", "password"].join("-"),
    "@db.example.invalid",
  ].join("");
}

async function createGitFixture({
  databaseUris = false,
  licenseSecret,
  unmappedAsset = false,
  removedAssets = false,
  secret,
  symlinkAsset = false,
  symlinkAssetRoot = false,
  unicodeSensitivePath = false,
  assetDatabaseUris,
  directoryPrefix,
} = {}) {
  const mapping = {
    "registered.png": "/manus-storage/registered.png",
  };
  const notedAssets = ["registered.png"];
  if (assetDatabaseUris) {
    mapping["asset-metadata.txt"] = "/manus-storage/asset-metadata.txt";
    notedAssets.push("asset-metadata.txt");
  }
  const assetRoot = symlinkAssetRoot
    ? "client/public/manus-storage-target"
    : "client/public/manus-storage";
  const fixtureFiles = {
    ".gitignore": ".env\n",
    LICENSE: `${licenseSecret ?? "MIT License"}\n`,
    "package.json": JSON.stringify({ license: licenseSecret ?? "MIT" }) + "\n",
    "client/src/pages/Home.tsx":
      'export const image = "/manus-storage/registered.png";\n',
    [`${assetRoot}/registered.png`]: "fixture\n",
    ...(assetDatabaseUris
      ? {
          [`${assetRoot}/asset-metadata.txt`]: `${assetDatabaseUris}\n`,
        }
      : {}),
    ...(unmappedAsset
      ? { "client/public/manus-storage/nested/unmapped.txt": "fixture\n" }
      : {}),
    ...(secret ? { ".env": `OPENAI_API_KEY=${secret}\n` } : {}),
    ...(databaseUris
      ? {
          "config/database.txt": `${databaseUris}\n`,
        }
      : {}),
    ...(unicodeSensitivePath ? { "client/资料/.env": "fixture\n" } : {}),
  };

  if (removedAssets) {
    for (const filePath of REMOVED_SCREENSHOTS) {
      const fileName = path.posix.basename(filePath);
      mapping[fileName] = filePath.slice("client/public".length);
      notedAssets.push(fileName);
      fixtureFiles[filePath] = "fixture\n";
    }
  }

  fixtureFiles["asset-mapping.json"] = `${JSON.stringify(mapping)}\n`;
  fixtureFiles["asset_sources.md"] =
    notedAssets.map(name => `\`${name}\``).join("\n") + "\n";
  fixtureFiles["THIRD_PARTY_NOTICES.md"] =
    `不受本项目 MIT 许可证覆盖\n${notedAssets.map(name => `\`${name}\``).join("\n")}\n`;

  if (symlinkAsset) fixtureFiles["outside.txt"] = "fixture\n";

  const directory = await createTemporaryTree(fixtureFiles, directoryPrefix);

  if (symlinkAssetRoot) {
    await symlink(
      "manus-storage-target",
      path.join(directory, "client/public/manus-storage")
    );
  }
  if (symlinkAsset) {
    await symlink(
      "../../../outside.txt",
      path.join(directory, "client/public/manus-storage/linked.txt")
    );
  }

  for (const args of [
    ["init", "--quiet"],
    ["config", "user.name", "Audit Fixture"],
    ["config", "user.email", "audit-fixture@example.invalid"],
    ["config", "core.quotePath", "true"],
    ["add", "."],
    ["commit", "--quiet", "-m", "fixture"],
  ]) {
    await execFileAsync("git", args, { cwd: directory });
  }
  if (unicodeSensitivePath) {
    await execFileAsync("git", ["add", "-f", "client/资料/.env"], {
      cwd: directory,
    });
    await execFileAsync("git", ["commit", "--quiet", "-m", "sensitive path"], {
      cwd: directory,
    });
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
  it("recognizes credentialed database URI schemes", async () => {
    const schemes = [
      "mysql",
      "mysql2",
      "postgres",
      "postgresql",
      "mongodb",
      "mongodb+srv",
      "redis",
    ];
    const databaseUris = schemes
      .map(scheme =>
        [
          scheme,
          "://audit-user",
          ":",
          ["synthetic", "password"].join("-"),
          "@db.example.invalid",
        ].join("")
      )
      .join("\n");
    const directory = await createTemporaryTree({
      "config/database.txt": databaseUris,
    });

    const result = await audit.scanCurrentTree({ rootDir: directory });

    assert.deepEqual(result.matchedPaths, ["config/database.txt"]);
  });

  it("recognizes a credentialed Redis URI with an omitted username", async () => {
    const directory = await createTemporaryTree({
      "config/redis.txt": [
        "redis://:",
        ["synthetic", "password"].join("-"),
        "@cache.example.invalid\n",
      ].join(""),
    });

    const result = await audit.scanCurrentTree({ rootDir: directory });

    assert.deepEqual(result.matchedPaths, ["config/redis.txt"]);
  });

  it("scans credentialed database URIs in text files under the asset directory", async () => {
    const directory = await createTemporaryTree({
      "client/public/manus-storage/metadata.txt": [
        credentialUri("mysql"),
        credentialUri("redis", ""),
      ].join("\n"),
    });

    const result = await audit.scanCurrentTree({ rootDir: directory });

    assert.deepEqual(result.matchedPaths, [
      "client/public/manus-storage/metadata.txt",
    ]);
  });

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

  it("excludes local transcripts and nested worktrees from the current scan", async () => {
    const secret = credentialUri("postgres");
    const directory = await createTemporaryTree({
      ".specstory/history/session.md": `${secret}\n`,
      ".worktrees/feature/config/database.txt": `${secret}\n`,
      "README.md": "This file contains no credentials.\n",
    });

    const result = await audit.scanCurrentTree({ rootDir: directory });

    assert.equal(result.rgExitCode, 1);
    assert.deepEqual(result.matchedPaths, []);
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

  it("rejects an asset mapping target that is a directory", async () => {
    const directory = await createTemporaryTree({
      "asset-mapping.json":
        '{"registered.png":"/manus-storage/registered.png","directory-target":"/manus-storage/directory-target"}\n',
      "asset_sources.md": "`registered.png`\n`directory-target`\n",
      "THIRD_PARTY_NOTICES.md":
        "不受本项目 MIT 许可证覆盖\n`registered.png`\n`directory-target`\n",
      "client/src/pages/Home.tsx":
        'export const image = "/manus-storage/registered.png";\n',
      "client/public/manus-storage/registered.png": "fixture\n",
      "client/public/manus-storage/directory-target/.keep": "fixture\n",
    });

    const result = await audit.validateAssetClosure({
      rootDir: directory,
      execute: async () => ({ exitCode: 0, stdout: "", stderr: "" }),
    });

    assert.deepEqual(result.missing, ["/manus-storage/directory-target"]);
  });

  it("detects asset symlinks instead of treating them as ordinary files", async () => {
    const directory = await createTemporaryTree({
      "asset-mapping.json":
        '{"registered.png":"/manus-storage/registered.png"}\n',
      "asset_sources.md": "`registered.png`\n",
      "THIRD_PARTY_NOTICES.md": "不受本项目 MIT 许可证覆盖\n`registered.png`\n",
      "client/src/pages/Home.tsx":
        'export const image = "/manus-storage/registered.png";\n',
      "client/public/manus-storage/registered.png": "fixture\n",
      "outside.txt": "fixture\n",
    });
    await symlink(
      "../../../outside.txt",
      path.join(directory, "client/public/manus-storage/linked.txt")
    );

    const result = await audit.validateAssetClosure({
      rootDir: directory,
      execute: async () => ({ exitCode: 0, stdout: "", stderr: "" }),
    });

    assert.deepEqual(result.symlinkAssetFiles, [
      "client/public/manus-storage/linked.txt",
    ]);
  });

  it("checks removed screenshots independently of homepage references", async () => {
    const mapping = Object.fromEntries(
      REMOVED_SCREENSHOTS.map(filePath => [
        path.posix.basename(filePath),
        filePath.slice("client/public".length),
      ])
    );
    const assetNames = Object.keys(mapping);
    const directory = await createTemporaryTree({
      "asset-mapping.json": `${JSON.stringify(mapping)}\n`,
      "asset_sources.md": assetNames.map(name => `\`${name}\``).join("\n"),
      "THIRD_PARTY_NOTICES.md": `不受本项目 MIT 许可证覆盖\n${assetNames.map(name => `\`${name}\``).join("\n")}\n`,
      "client/src/pages/Home.tsx": "export const image = null;\n",
      ...Object.fromEntries(
        REMOVED_SCREENSHOTS.map(filePath => [filePath, "fixture\n"])
      ),
    });

    const result = await audit.validateAssetClosure({
      rootDir: directory,
      execute: async () => ({ exitCode: 0, stdout: "", stderr: "" }),
    });

    assert.deepEqual(result.oldCodeRefs, []);
    assert.deepEqual(result.removedAssetFiles, REMOVED_SCREENSHOTS);
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
  it("finds all supported database credentials in Git history", async () => {
    const schemes = [
      "mysql",
      "mysql2",
      "postgres",
      "postgresql",
      "mongodb",
      "mongodb+srv",
      "redis",
    ];
    const databaseUris = schemes
      .map(scheme =>
        [
          scheme,
          "://audit-user",
          ":",
          ["synthetic", "password"].join("-"),
          "@db.example.invalid",
        ].join("")
      )
      .join("\n");
    const directory = await createGitFixture({ databaseUris });

    const result = await audit.scanGitHistory({ rootDir: directory });

    assert.equal(result.commits.length, 1);
    assert.deepEqual(result.commits[0].contentScan.matchedPaths, [
      "config/database.txt",
    ]);
  });

  it("preserves a Unicode sensitive path from git ls-tree", async () => {
    const directory = await createGitFixture({ unicodeSensitivePath: true });

    const result = await audit.scanGitHistory({ rootDir: directory });

    assert.deepEqual(result.commits[0].sensitivePathScan.matchedPaths, [
      "client/资料/.env",
    ]);
  });

  it("uses NUL-delimited output for historical tree paths", async () => {
    const calls = [];
    await audit.scanGitHistory({
      rootDir: "/fixture",
      execute: async (command, args) => {
        calls.push({ command, args });
        if (command === "git" && args[0] === "for-each-ref") {
          return { exitCode: 0, stdout: "refs/heads/main abc\n", stderr: "" };
        }
        if (command === "git" && args[0] === "rev-list") {
          return { exitCode: 0, stdout: "abc\n", stderr: "" };
        }
        if (command === "git" && args[0] === "grep") {
          return { exitCode: 1, stdout: "", stderr: "" };
        }
        return {
          exitCode: 0,
          stdout: "目录/文件.env\0",
          stderr: "",
        };
      },
    });

    const lsTreeCall = calls.find(call => call.args[0] === "ls-tree");
    assert.ok(lsTreeCall.args.includes("-z"));
  });

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

  it("exits 1 for asset symlinks", async () => {
    const directory = await createGitFixture({ symlinkAsset: true });

    const result = await runCli(directory);
    const output = JSON.parse(result.stdout);

    assert.equal(result.exitCode, 1);
    assert.deepEqual(output.assets.symlinkAssetFiles, [
      "client/public/manus-storage/linked.txt",
    ]);
    assert.deepEqual(output.findings, ["symlink-asset-file"]);
  });

  it("exits 1 when the asset root is a symlink", async () => {
    const directory = await createGitFixture({ symlinkAssetRoot: true });

    const result = await runCli(directory);
    const output = JSON.parse(result.stdout);

    assert.equal(result.exitCode, 1);
    assert.deepEqual(output.assets.symlinkAssetDirectories, [
      "client/public/manus-storage",
    ]);
    assert.deepEqual(output.findings, ["symlink-asset-directory"]);
  });

  it("reports removed screenshots even when manifests omit homepage references", async () => {
    const directory = await createGitFixture({ removedAssets: true });

    const result = await runCli(directory);
    const output = JSON.parse(result.stdout);

    assert.equal(result.exitCode, 1);
    assert.deepEqual(output.assets.oldCodeRefs, []);
    assert.deepEqual(output.assets.removedAssetFiles, REMOVED_SCREENSHOTS);
    assert.deepEqual(output.findings, ["removed-asset-present"]);
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
    assert.equal(result.stderr.includes(secret), false);
  });

  it("does not echo synthetic license values in validateLicense, runAudit, or CLI JSON", async () => {
    const secret = [
      "sk",
      "proj",
      "license-value-abcdefghijklmnopqrstuvwxyz1234567890",
    ].join("-");
    const directory = await createGitFixture({ licenseSecret: secret });

    const license = await audit.validateLicense(directory);
    const runResult = await audit.runAudit({ rootDir: directory });
    const cliResult = await runCli(directory);

    assert.deepEqual(license, {
      licenseFirstLine: "other",
      packageLicense: "other",
      passed: false,
    });
    assert.equal(JSON.stringify(runResult).includes(secret), false);
    assert.equal(cliResult.exitCode, 1);
    assert.equal(cliResult.stdout.includes(secret), false);
    assert.equal(cliResult.stderr.includes(secret), false);
    assert.deepEqual(JSON.parse(cliResult.stdout).license, {
      licenseFirstLine: "other",
      packageLicense: "other",
      passed: false,
    });
  });

  it("does not expose an asset-directory credential through runAudit", async () => {
    const databaseUris = [
      credentialUri("mysql"),
      credentialUri("redis", ""),
    ].join("\n");
    const directory = await createGitFixture({
      assetDatabaseUris: databaseUris,
    });

    const result = await audit.runAudit({ rootDir: directory });

    assert.deepEqual(result.current.matchedPaths, [
      "client/public/manus-storage/asset-metadata.txt",
    ]);
    assert.ok(result.findings.includes("current-secret-match"));
  });

  it("does not expose the raw synthetic-secret root directory in CLI output", async () => {
    const rootDirMarker = ["synthetic", "root", "secret"].join("-");
    const directory = await createGitFixture({
      directoryPrefix: `audit-public-release-${rootDirMarker}-`,
    });

    const result = await runCli(directory);

    assert.equal(result.stdout.includes(rootDirMarker), false);
    assert.equal(result.stderr.includes(rootDirMarker), false);
    assert.equal("rootDir" in JSON.parse(result.stdout), false);
  });

  it("runs the audit regression suite as an independent CI step", async () => {
    const workflow = await readFile(
      path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        "../.github/workflows/ci.yml"
      ),
      "utf8"
    );

    assert.match(
      workflow,
      /run: node --test scripts\/audit-public-release\.test\.mjs/
    );
  });

  it("uses package.json as the sole pnpm version source in CI", async () => {
    const workflow = await readFile(
      path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        "../.github/workflows/ci.yml"
      ),
      "utf8"
    );
    const packageJson = await readFile(
      path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        "../package.json"
      ),
      "utf8"
    );
    const pnpmSetupBlock = workflow
      .split("uses: pnpm/action-setup@v4")[1]
      .split("\n      - name:")[0];

    assert.doesNotMatch(pnpmSetupBlock, /\n\s+version:/);
    assert.match(packageJson, /"packageManager":\s*"pnpm@/);
  });
});
