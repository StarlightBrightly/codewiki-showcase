import express from "express";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { createServer } from "node:http";
import { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { registerStorageProxy } from "./storageProxy";

const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

async function listen(app: express.Express) {
  const server = createServer(app);
  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;
  return {
    url: `http://127.0.0.1:${port}`,
    close: () =>
      new Promise<void>((resolve, reject) =>
        server.close(error => (error ? reject(error) : resolve()))
      ),
  };
}

describe("storage proxy local files", () => {
  const roots: string[] = [];

  afterEach(() => {
    for (const root of roots.splice(0)) {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("serves a local file when Forge storage is not configured", async () => {
    const root = mkdtempSync(path.join(tmpdir(), "manus-storage-"));
    roots.push(root);
    writeFileSync(path.join(root, "codewiki-mark_myu2b3hi.png"), PNG_1X1);

    const app = express();
    registerStorageProxy(app, { localRoot: root });
    const server = await listen(app);

    try {
      const response = await fetch(
        `${server.url}/manus-storage/codewiki-mark_myu2b3hi.png`
      );
      const body = Buffer.from(await response.arrayBuffer());

      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toMatch(/image\/png/);
      expect(body.equals(PNG_1X1)).toBe(true);
    } finally {
      await server.close();
    }
  });
});
