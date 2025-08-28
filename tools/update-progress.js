#!/usr/bin/env node

const fs = require("fs");
const { execSync } = require("child_process");

function updateProgress() {
  try {
    if (!fs.existsSync("TASKS.md")) {
      console.log("📋 TASKS.md not found, skipping progress update");
      return;
    }

    const tasksContent = fs.readFileSync("TASKS.md", "utf8");
    let updated = false;

    // Get current branch
    let currentBranch;
    try {
      currentBranch = execSync("git branch --show-current", {
        encoding: "utf8",
      }).trim();
    } catch {
      currentBranch = "unknown";
    }

    // Get current task if exists
    let currentTaskData = null;
    if (fs.existsSync(".current-task")) {
      currentTaskData = JSON.parse(fs.readFileSync(".current-task", "utf8"));
    }

    // Update timestamp and branch info
    let newContent = tasksContent;

    // Add progress header if it doesn't exist
    if (!tasksContent.includes("## Progress")) {
      const timestamp = new Date().toISOString();
      const progressSection = `\n## Progress\n- Last updated: ${timestamp}\n- Current branch: ${currentBranch}\n${currentTaskData ? `- Active task: ${currentTaskData.task}\n` : ""}`;
      newContent = newContent + progressSection;
      updated = true;
    } else {
      // Update existing progress section
      const timestamp = new Date().toISOString();
      newContent = newContent.replace(
        /- Last updated: .*/,
        `- Last updated: ${timestamp}`,
      );
      newContent = newContent.replace(
        /- Current branch: .*/,
        `- Current branch: ${currentBranch}`,
      );

      if (currentTaskData) {
        if (newContent.includes("- Active task:")) {
          newContent = newContent.replace(
            /- Active task: .*/,
            `- Active task: ${currentTaskData.task}`,
          );
        } else {
          newContent = newContent.replace(
            /- Current branch: .*/,
            `- Current branch: ${currentBranch}\n- Active task: ${currentTaskData.task}`,
          );
        }
      }
      updated = true;
    }

    if (updated) {
      fs.writeFileSync("TASKS.md", newContent);
      console.log("📋 TASKS.md progress updated");
    } else {
      console.log("📋 TASKS.md already up to date");
    }
  } catch (error) {
    console.error("❌ Error updating progress:", error.message);
    // Don't exit with error as this shouldn't block commits
  }
}

updateProgress();
