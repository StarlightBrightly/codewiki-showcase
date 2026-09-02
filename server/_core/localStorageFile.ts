import fs from "node:fs";
import path from "node:path";

export function resolveLocalStorageFile(
  key: string,
  rootDir: string
): string | null {
  if (!key || key.includes("\0")) {
    return null;
  }

  const normalized = key.replace(/^\/+/, "").replace(/\\/g, "/");
  if (
    !normalized ||
    normalized.includes("%2e") ||
    normalized.includes("%2E") ||
    normalized.includes("%2f") ||
    normalized.includes("%2F") ||
    normalized.includes("%5c") ||
    normalized.includes("%5C")
  ) {
    return null;
  }

  const parts = normalized.split("/");
  if (parts.some(part => part === "" || part === "." || part === "..")) {
    return null;
  }

  const root = path.resolve(rootDir);
  const fullPath = path.resolve(root, ...parts);
  const relative = path.relative(root, fullPath);
  if (
    relative.startsWith("..") ||
    path.isAbsolute(relative) ||
    relative.includes("..")
  ) {
    return null;
  }

  try {
    if (!fs.statSync(fullPath).isFile()) {
      return null;
    }
  } catch {
    return null;
  }

  return fullPath;
}

export function defaultLocalStorageRoot(): string {
  return process.env.NODE_ENV === "production"
    ? path.resolve(import.meta.dirname, "public/manus-storage")
    : path.resolve(import.meta.dirname, "../../client/public/manus-storage");
}
