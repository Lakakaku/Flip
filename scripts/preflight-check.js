#!/usr/bin/env node

const fs = require("fs");
const { execSync } = require("child_process");

function preflightCheck() {
  console.log("🛫 Running preflight checks...");

  const checks = [
    {
      name: "Git repository status",
      check: () => {
        try {
          const status = execSync("git status --porcelain", {
            encoding: "utf8",
          });
          if (status.trim()) {
            console.log("⚠️  Uncommitted changes detected");
            return { status: "warning", message: "Uncommitted changes" };
          }
          return { status: "ok", message: "Clean working tree" };
        } catch {
          return { status: "error", message: "Not a git repository" };
        }
      },
    },
    {
      name: "Database connection",
      check: () => {
        if (!process.env.DATABASE_URL) {
          return { status: "warning", message: "DATABASE_URL not set" };
        }
        return { status: "ok", message: "Database URL configured" };
      },
    },
    {
      name: "Required directories",
      check: () => {
        const required = ["lib", "pages", "components"];
        const missing = required.filter((dir) => !fs.existsSync(dir));
        if (missing.length) {
          return {
            status: "warning",
            message: `Missing: ${missing.join(", ")}`,
          };
        }
        return { status: "ok", message: "All directories present" };
      },
    },
    {
      name: "Environment files",
      check: () => {
        if (!fs.existsSync(".env.local") && !fs.existsSync(".env")) {
          return { status: "warning", message: "No environment file found" };
        }
        return { status: "ok", message: "Environment configured" };
      },
    },
  ];

  let errors = 0;
  let warnings = 0;

  checks.forEach(({ name, check }) => {
    const result = check();
    const icon =
      result.status === "ok" ? "✅" : result.status === "warning" ? "⚠️" : "❌";

    console.log(`${icon} ${name}: ${result.message}`);

    if (result.status === "error") errors++;
    if (result.status === "warning") warnings++;
  });

  console.log("");

  if (errors > 0) {
    console.log(`❌ ${errors} critical issue${errors > 1 ? "s" : ""} found`);
    process.exit(1);
  }

  if (warnings > 0) {
    console.log(`⚠️  ${warnings} warning${warnings > 1 ? "s" : ""} found`);
  }

  console.log("✅ Preflight checks complete");
}

preflightCheck();
