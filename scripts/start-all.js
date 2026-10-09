#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

console.log("\n=========================================================");
console.log("  🚀 EasyMyLearning Task Manager — Full Stack Launcher   ");
console.log("=========================================================");
console.log("  • Frontend: http://localhost:3000                      ");
console.log("  • Backend:  http://localhost:8080                      ");
console.log("  • Health:   http://localhost:8080/health               ");
console.log("  • Database: PostgreSQL (Embedded/External)             ");
console.log("=========================================================\n");

const rootDir = path.resolve(__dirname, "..");
const backendDir = path.resolve(rootDir, "backend");

// Check if backend executable exists, otherwise use 'go run ./cmd/api'
const exePath = path.join(backendDir, "api.exe");
let backendCmd, backendArgs;

if (fs.existsSync(exePath)) {
  backendCmd = exePath;
  backendArgs = [];
} else {
  backendCmd = "go";
  backendArgs = ["run", "./cmd/api"];
}

console.log(`[System] Starting Go Backend in ${backendDir}...`);
const backendProc = spawn(backendCmd, backendArgs, {
  cwd: backendDir,
  shell: true,
  stdio: "inherit",
  env: {
    ...process.env,
    PORT: "8080",
    APP_ENV: "development",
  },
});

console.log(`[System] Starting Next.js Frontend in ${rootDir}...`);
const frontendProc = spawn("npm.cmd", ["run", "dev"], {
  cwd: rootDir,
  shell: true,
  stdio: "inherit",
});

function cleanup() {
  console.log("\n[System] Gracefully shutting down full-stack application...");
  try {
    if (backendProc && !backendProc.killed) {
      backendProc.kill("SIGTERM");
    }
  } catch (_) {}
  try {
    if (frontendProc && !frontendProc.killed) {
      frontendProc.kill("SIGTERM");
    }
  } catch (_) {}
  process.exit(0);
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

backendProc.on("exit", (code) => {
  if (code !== 0 && code !== null) {
    console.error(`[Backend] Exited with code ${code}`);
  }
});

frontendProc.on("exit", (code) => {
  if (code !== 0 && code !== null) {
    console.error(`[Frontend] Exited with code ${code}`);
  }
});
