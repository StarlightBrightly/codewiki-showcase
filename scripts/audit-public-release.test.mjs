import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import * as audit from "./audit-public-release.mjs";

const temporaryDirectories = [];

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
    Object.entries(files).map(([name, content]) =>
      writeFile(path.join(directory, name), content)
    )
  );
  return directory;
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
