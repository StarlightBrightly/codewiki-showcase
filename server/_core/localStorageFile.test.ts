import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { resolveLocalStorageFile } from "./localStorageFile";

const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

describe("resolveLocalStorageFile", () => {
  const roots: string[] = [];

  afterEach(() => {
    for (const root of roots.splice(0)) {
      rmSync(root, { recursive: true, force: true });
    }
  });

  function createRoot() {
    const root = mkdtempSync(path.join(tmpdir(), "manus-storage-"));
    roots.push(root);
    return root;
  }

  it("returns the file path when the key exists under the root", () => {
    const root = createRoot();
    const filePath = path.join(root, "codewiki-mark_myu2b3hi.png");
    writeFileSync(filePath, PNG_1X1);

    expect(resolveLocalStorageFile("codewiki-mark_myu2b3hi.png", root)).toBe(
      filePath
    );
  });

  it("returns null when the file is missing", () => {
    const root = createRoot();
    expect(resolveLocalStorageFile("missing.png", root)).toBeNull();
  });

  it("rejects empty keys and path traversal", () => {
    const root = createRoot();
    writeFileSync(path.join(root, "safe.png"), PNG_1X1);

    expect(resolveLocalStorageFile("", root)).toBeNull();
    expect(resolveLocalStorageFile("../safe.png", root)).toBeNull();
    expect(resolveLocalStorageFile("..%2Fsafe.png", root)).toBeNull();
    expect(resolveLocalStorageFile("/etc/passwd", root)).toBeNull();
  });
});
