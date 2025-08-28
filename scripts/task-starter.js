#!/usr/bin/env node

// Runs when starting a new task
const readline = require('readline');
const fs = require('fs');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function checkTaskDependencies(task) {
  // Simple dependency checker - can be expanded
  const met = [];
  const unmet = [];

  // Check if required files exist
  if (task.includes('database') && !fs.existsSync('schema.sql')) {
    unmet.push('schema.sql file missing');
  }

  if (task.includes('scraper') && !fs.existsSync('lib/scrapers')) {
    unmet.push('scrapers directory missing');
  }

  return { met, unmet };
}

function createBranchName(task) {
  // Convert task to branch name
  return task
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .substring(0, 50); // Limit length
}

rl.question('Which task are you starting? (paste from TASKS.md): ', task => {
  try {
    // Check dependencies
    const deps = checkTaskDependencies(task);

    if (deps.unmet.length > 0) {
      console.error('⛔ Unmet dependencies:', deps.unmet);
      process.exit(1);
    }

    // Create branch
    const branchName = createBranchName(task);
    console.log(`Creating branch: ${branchName}`);

    try {
      execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });
    } catch {
      console.log('Branch may already exist, switching to it...');
      execSync(`git checkout ${branchName}`, { stdio: 'inherit' });
    }

    // Set up task context
    fs.writeFileSync(
      '.current-task',
      JSON.stringify(
        {
          task,
          branch: branchName,
          started: new Date().toISOString(),
          dependencies: deps.met,
        },
        null,
        2
      )
    );

    console.log('✅ Task initialized. Good luck!');
    console.log(`📋 Task: ${task}`);
    console.log(`🌿 Branch: ${branchName}`);
  } catch (error) {
    console.error('❌ Error initializing task:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
});
