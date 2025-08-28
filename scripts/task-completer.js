#!/usr/bin/env node

const fs = require("fs");
const { execSync } = require("child_process");

function completeTask() {
  try {
    // Read current task
    if (!fs.existsSync(".current-task")) {
      console.log("📋 No active task found");
      return;
    }

    const taskData = JSON.parse(fs.readFileSync(".current-task", "utf8"));
    const completedAt = new Date().toISOString();

    console.log(`📋 Completing task: ${taskData.task}`);
    console.log(`⏰ Started: ${taskData.started}`);
    console.log(`✅ Completed: ${completedAt}`);

    // Calculate duration
    const duration = new Date(completedAt) - new Date(taskData.started);
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

    console.log(`⏱️  Duration: ${hours}h ${minutes}m`);

    // Update task completion record
    const completedTask = {
      ...taskData,
      completed: completedAt,
      duration: `${hours}h ${minutes}m`,
    };

    // Archive completed task
    let completedTasks = [];
    if (fs.existsSync(".completed-tasks")) {
      completedTasks = JSON.parse(fs.readFileSync(".completed-tasks", "utf8"));
    }
    completedTasks.push(completedTask);
    fs.writeFileSync(
      ".completed-tasks",
      JSON.stringify(completedTasks, null, 2),
    );

    // Clean up current task
    fs.unlinkSync(".current-task");

    console.log("✅ Task marked as complete!");
    console.log("💡 Don't forget to:");
    console.log("   - Update TASKS.md with [x]");
    console.log("   - Commit your changes with proper emoji");
    console.log("   - Consider merging back to main branch");
  } catch (error) {
    console.error("❌ Error completing task:", error.message);
    process.exit(1);
  }
}

completeTask();
