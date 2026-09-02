import { spawn } from "node:child_process";
import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SECRET_PATTERN = [
  "AKIA[0-9A-Z]{16}",
  "ASIA[0-9A-Z]{16}",
  "gh[pousr]_[A-Za-z0-9_]{20,}",
  "github_pat_[A-Za-z0-9_]{20,}",
  "sk-(proj-)?[A-Za-z0-9_-]{20,}",
  "xox[baprs]-[A-Za-z0-9-]{20,}",
  "npm_[A-Za-z0-9]{20,}",
  "AIza[0-9A-Za-z_-]{30,}",
  "-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----",
  "(mysql|mysql2|postgres|postgresql|mongodb|mongodb\\+srv|redis)://[^[:space:]/]*:[^[:space:]@]+@",
].join("|");

const SENSITIVE_PATH_PATTERN =
  /(^|\/)(?:\.env(?:$|\..*)|.*(?:private|secret|credential|password|passwd|token|apikey|api-key).*|id_rsa(?:$|\.)|.*\.(?:pem|p12|pfx|key|crt|cer))$/i;

const REMOVED_SCREENSHOTS = [
  "client/public/manus-storage/grok-wiki-official-demo_ehbhr5hr.png",
  "client/public/manus-storage/deepwiki-official-ui_pa7wq5ja.png",
  "client/public/manus-storage/codewiki-docs-interface_zj7hgx6c.png",
];

const CURRENT_SCAN_ARGS = [
  "--no-ignore",
  "--hidden",
  "-I",
  "-l",
  "--null",
  "--no-messages",
  "--glob",
  "!node_modules/**",
  "--glob",
  "!dist/**",
  "--glob",
  "!.git/**",
  "--glob",
  "!.superpowers/**",
  "--glob",
  "!.audit-public-release/**",
  "--glob",
  "!client/public/manus-storage/**",
  "--glob",
  "!**/*.{png,jpg,jpeg,gif,webp,ico,avif,bmp,tiff,woff,woff2,ttf,otf,pdf,zip,tar,gz,mp4,webm,mp3,wav}",
  "-e",
  SECRET_PATTERN,
  ".",
];

class AuditToolError extends Error {
  constructor(command, exitCode, detail = "") {
    super(
      `${command} failed with exit code ${exitCode}${detail ? `: ${detail}` : ""}`
    );
    this.name = "AuditToolError";
    this.command = command;
    this.exitCode = exitCode;
  }
}

function commandLabel(command, args) {
  return [command, ...args].join(" ");
}

function parseNullSeparatedPaths(output) {
  return output
    .split("\0")
    .filter(value => value.length > 0)
    .map(value => (value.startsWith("./") ? value.slice(2) : value));
}

function parseLineSeparatedPaths(output) {
  return output
    .split("\n")
    .map(value => value.trim())
    .filter(Boolean)
    .map(value => value.replace(/^\.\//, ""));
}

function parseGitGrepPaths(output, commit) {
  const prefix = `${commit}:`;
  return parseNullSeparatedPaths(output).map(filePath =>
    filePath.startsWith(prefix) ? filePath.slice(prefix.length) : filePath
  );
}

function unique(values) {
  return [...new Set(values)];
}

export function findUnmappedAssetFiles(assetFiles, mappingTargets) {
  const mappedFiles = new Set(
    mappingTargets.map(target => `client/public${target}`)
  );
  return assetFiles.filter(filePath => !mappedFiles.has(filePath));
}

export function isSensitivePath(filePath) {
  return SENSITIVE_PATH_PATTERN.test(filePath);
}

export function findUnnotedAssets(assetNames, sources, notices) {
  return assetNames.filter(
    name => !sources.includes(`\`${name}\``) || !notices.includes(`\`${name}\``)
  );
}

export function isCliEntry(moduleUrl, argvPath) {
  return (
    Boolean(argvPath) && fileURLToPath(moduleUrl) === path.resolve(argvPath)
  );
}

export function runCommand(command, args, options = {}) {
  return new Promise(resolve => {
    const child = spawn(command, args, {
      cwd: options.cwd,
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
    child.on("error", error => {
      resolve({ exitCode: 2, stdout, stderr: error.message });
    });
    child.on("close", exitCode => {
      resolve({ exitCode: exitCode ?? 2, stdout, stderr });
    });
  });
}

async function executeOrThrow(
  execute,
  command,
  args,
  cwd,
  allowedExitCodes = [0],
  errorCommand = command
) {
  const result = await execute(command, args, { cwd });
  if (!allowedExitCodes.includes(result.exitCode)) {
    throw new AuditToolError(errorCommand, result.exitCode, result.stderr);
  }
  return result;
}

export async function scanCurrentTree({
  rootDir = process.cwd(),
  execute = runCommand,
} = {}) {
  const result = await executeOrThrow(
    execute,
    "rg",
    CURRENT_SCAN_ARGS,
    rootDir,
    [0, 1]
  );

  return {
    command: commandLabel("rg", CURRENT_SCAN_ARGS),
    rgExitCode: result.exitCode,
    matchedPaths: parseNullSeparatedPaths(result.stdout),
  };
}

async function runGit(execute, rootDir, args) {
  return executeOrThrow(execute, "git", args, rootDir);
}

function parseRefs(output) {
  return output
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const separator = line.indexOf(" ");
      return {
        name: separator === -1 ? line : line.slice(0, separator),
        object: separator === -1 ? "" : line.slice(separator + 1),
      };
    });
}

export async function scanGitHistory({
  rootDir = process.cwd(),
  execute = runCommand,
} = {}) {
  const refsResult = await runGit(execute, rootDir, [
    "for-each-ref",
    "--format=%(refname) %(objectname)",
  ]);
  const refs = parseRefs(refsResult.stdout);

  const commitsResult = await runGit(execute, rootDir, ["rev-list", "--all"]);
  const commits = parseLineSeparatedPaths(commitsResult.stdout);
  const commitResults = [];

  for (const commit of commits) {
    const contentResult = await executeOrThrow(
      execute,
      "git",
      ["grep", "-I", "-l", "-z", "-E", SECRET_PATTERN, commit, "--"],
      rootDir,
      [0, 1],
      "git grep"
    );

    const pathResult = await runGit(execute, rootDir, [
      "ls-tree",
      "-r",
      "-z",
      "--name-only",
      commit,
      "--",
    ]);
    const sensitivePaths = parseNullSeparatedPaths(pathResult.stdout).filter(
      filePath => isSensitivePath(filePath)
    );

    commitResults.push({
      commit,
      contentScan: {
        exitCode: contentResult.exitCode,
        matchedPathCount: parseGitGrepPaths(contentResult.stdout, commit)
          .length,
        matchedPaths: parseGitGrepPaths(contentResult.stdout, commit),
      },
      sensitivePathScan: {
        exitCode: pathResult.exitCode,
        matchedPathCount: sensitivePaths.length,
        matchedPaths: sensitivePaths,
      },
    });
  }

  return {
    refs,
    refCount: refs.length,
    commitCount: commits.length,
    commits: commitResults,
  };
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

async function listAssetFiles(rootDir) {
  const assetDirectory = path.join(rootDir, "client/public/manus-storage");
  async function walk(directory, relativeDirectory) {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch (error) {
      if (error?.code === "ENOENT") {
        return { files: [], symlinkAssetFiles: [] };
      }
      throw error;
    }

    const files = [];
    const symlinkAssetFiles = [];
    for (const entry of entries) {
      const entryPath = path.join(directory, entry.name);
      const relativePath = path.posix.join(relativeDirectory, entry.name);
      if (entry.isDirectory()) {
        const child = await walk(entryPath, relativePath);
        files.push(...child.files);
        symlinkAssetFiles.push(...child.symlinkAssetFiles);
      } else if (entry.isFile()) {
        files.push(relativePath);
      } else if (entry.isSymbolicLink()) {
        symlinkAssetFiles.push(relativePath);
      }
    }
    return { files, symlinkAssetFiles };
  }

  const result = await walk(assetDirectory, "client/public/manus-storage");
  return {
    files: result.files.sort(),
    symlinkAssetFiles: result.symlinkAssetFiles.sort(),
  };
}

export async function validateAssetClosure({
  rootDir = process.cwd(),
  execute = runCommand,
} = {}) {
  const mapping = await readJson(path.join(rootDir, "asset-mapping.json"));
  const sources = await readFile(
    path.join(rootDir, "asset_sources.md"),
    "utf8"
  );
  const notices = await readFile(
    path.join(rootDir, "THIRD_PARTY_NOTICES.md"),
    "utf8"
  );
  const home = await readFile(
    path.join(rootDir, "client/src/pages/Home.tsx"),
    "utf8"
  );
  const mappingEntries = Object.entries(mapping);
  const mappingTargets = mappingEntries.map(([, target]) => target);
  const missing = [];
  const { files: assetFiles, symlinkAssetFiles } =
    await listAssetFiles(rootDir);

  for (const target of mappingTargets) {
    const relativeTarget = target.replace(/^\//, "");
    const filePath = path.join(rootDir, "client/public", relativeTarget);
    if (!(await fileExists(filePath))) missing.push(target);
  }

  const homeRefs = unique(
    [...home.matchAll(/\/manus-storage\/[^'"`\s)]+/g)].map(match => match[0])
  );
  const unmapped = homeRefs.filter(ref => !mappingTargets.includes(ref));
  const unnoted = findUnnotedAssets(
    mappingEntries.map(([name]) => name),
    sources,
    notices
  );
  const unmappedAssetFiles = findUnmappedAssetFiles(assetFiles, mappingTargets);
  const removedAssetFiles = [];
  for (const filePath of REMOVED_SCREENSHOTS) {
    if (await fileExists(path.join(rootDir, filePath))) {
      removedAssetFiles.push(filePath);
    }
  }
  const oldCodeRefs = REMOVED_SCREENSHOTS.filter(filePath =>
    home.includes(filePath.replace("client/public", ""))
  );
  const historyObjects = await runGit(execute, rootDir, [
    "rev-list",
    "--objects",
    "--all",
  ]);
  const historicalScreenshotBlobs = unique(
    parseLineSeparatedPaths(historyObjects.stdout)
      .map(line => line.replace(/^[^ ]+ /, ""))
      .filter(filePath => REMOVED_SCREENSHOTS.includes(filePath))
  );

  return {
    mappingEntries: mappingEntries.length,
    missing,
    unmappedAssetFiles,
    symlinkAssetFiles,
    homeReferenceCount: homeRefs.length,
    unmapped,
    unnoted,
    removedAssetFiles,
    oldCodeRefs,
    thirdPartyMitBoundary: notices.includes("不受本项目 MIT 许可证覆盖"),
    historicalScreenshotBlobs,
  };
}

export async function validateLicense(rootDir) {
  const licenseFirstLine = (
    await readFile(path.join(rootDir, "LICENSE"), "utf8")
  ).split("\n", 1)[0];
  const packageJson = await readJson(path.join(rootDir, "package.json"));
  return {
    licenseFirstLine: licenseFirstLine === "MIT License" ? "expected" : "other",
    packageLicense: packageJson.license === "MIT" ? "expected" : "other",
    passed: licenseFirstLine === "MIT License" && packageJson.license === "MIT",
  };
}

function collectFindings(current, history, assets, license) {
  const findings = [];
  if (current.matchedPaths.length > 0) findings.push("current-secret-match");
  if (history.commits.some(result => result.contentScan.matchedPathCount > 0)) {
    findings.push("history-secret-match");
  }
  if (
    history.commits.some(
      result => result.sensitivePathScan.matchedPathCount > 0
    )
  ) {
    findings.push("history-sensitive-path-match");
  }
  if (assets.missing.length > 0) findings.push("missing-asset");
  if (assets.symlinkAssetFiles.length > 0) findings.push("symlink-asset-file");
  if (assets.unmappedAssetFiles.length > 0)
    findings.push("unmapped-asset-file");
  if (assets.unmapped.length > 0) findings.push("unmapped-asset-reference");
  if (assets.unnoted.length > 0) findings.push("unnoted-asset");
  if (assets.oldCodeRefs.length > 0)
    findings.push("removed-asset-code-reference");
  if (assets.removedAssetFiles.length > 0)
    findings.push("removed-asset-present");
  if (!assets.thirdPartyMitBoundary)
    findings.push("missing-third-party-license-boundary");
  if (!license.passed) findings.push("license-metadata-mismatch");
  return findings;
}

export async function runAudit({
  rootDir = process.cwd(),
  execute = runCommand,
} = {}) {
  const current = await scanCurrentTree({ rootDir, execute });
  const history = await scanGitHistory({ rootDir, execute });
  const assets = await validateAssetClosure({ rootDir, execute });
  const license = await validateLicense(rootDir);
  const findings = collectFindings(current, history, assets, license);

  return {
    audit: "public-release",
    rootDir,
    exitCode: findings.length === 0 ? 0 : 1,
    current,
    history,
    assets,
    license,
    findings,
  };
}

export async function main() {
  try {
    const result = await runAudit();
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    process.exitCode = result.exitCode;
  } catch (error) {
    const toolError = error instanceof AuditToolError ? error : null;
    process.stdout.write(
      `${JSON.stringify(
        {
          audit: "public-release",
          exitCode: 2,
          error: {
            type: toolError ? "tool-error" : "audit-error",
            command: toolError?.command,
            commandExitCode: toolError?.exitCode,
          },
        },
        null,
        2
      )}\n`
    );
    process.exitCode = 2;
  }
}

if (isCliEntry(import.meta.url, process.argv[1])) {
  await main();
}
