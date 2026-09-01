import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin, type ViteDevServer } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";

// =============================================================================
// Manus Debug Collector - Vite Plugin
// Writes browser logs directly to files, trimmed when exceeding size limit
// =============================================================================

const PROJECT_ROOT = import.meta.dirname;
const LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
const MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024; // 1MB per log file
const TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6); // Trim to 60% to avoid constant re-trimming

type LogSource = "browserConsole" | "networkRequests" | "sessionReplay";

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function trimLogFile(logPath: string, maxSize: number) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }

    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const keptLines: string[] = [];
    let keptBytes = 0;

    // Keep newest lines (from end) that fit within 60% of maxSize
    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}\n`, "utf-8");
      if (keptBytes + lineBytes > targetSize) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }

    fs.writeFileSync(logPath, keptLines.join("\n") + "\n");
  } catch (err) {
    console.error(`[Manus Debug] Failed to trim log file ${logPath}:`, err);
  }
}

function manusDebugCollector(): Plugin {
  return {
    name: "manus-debug-collector",
    configureServer(server: ViteDevServer) {
      ensureLogDir();

      server.middlewares.use("/__manus__/log", (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          return res.end();
        }

        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
        });
        req.on("end", () => {
          try {
            const { source, data } = JSON.parse(body) as { source: LogSource; data: any };
            const logPath = path.join(LOG_DIR, `${source}.log`);
            const timestamp = new Date().toISOString();
            const logLine = `[${timestamp}] ${JSON.stringify(data)}\n`;

            fs.appendFileSync(logPath, logLine);
            trimLogFile(logPath, MAX_LOG_SIZE_BYTES);

            res.statusCode = 200;
            res.end("ok");
          } catch (err) {
            res.statusCode = 400;
            res.end("invalid json");
          }
        });
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  root: "client",
  plugins: [
    react(),
    tailwindcss(),
    jsxLocPlugin(),
    vitePluginManusRuntime(),
    manusDebugCollector(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(PROJECT_ROOT, "client/src"),
      "@shared": path.resolve(PROJECT_ROOT, "shared"),
    },
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  server: {
    allowedHosts: true,
  },
});
