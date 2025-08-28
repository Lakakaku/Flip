#!/usr/bin/env node

const fs = require("fs");

function validatePhaseRequirements() {
  try {
    if (!fs.existsSync("TASKS.md")) {
      console.log("⚠️  TASKS.md not found");
      return;
    }

    const tasksContent = fs.readFileSync("TASKS.md", "utf8");
    const phaseMatch = tasksContent.match(/Phase (\d+)/);

    if (!phaseMatch) {
      console.log("📋 No phase information found in TASKS.md");
      return;
    }

    const currentPhase = parseInt(phaseMatch[1]);
    console.log(`📋 Current Phase: ${currentPhase}`);

    const requirements = {
      1: ["package.json", ".gitignore"],
      2: ["lib/", "components/", ".env.example"],
      3: ["lib/scrapers/", "lib/database/"],
      4: ["tests/", "lib/scrapers/", "lib/database/"],
    };

    const phaseReqs = requirements[currentPhase] || [];
    const missing = phaseReqs.filter((req) => {
      const exists = req.endsWith("/")
        ? fs.existsSync(req) && fs.statSync(req).isDirectory()
        : fs.existsSync(req);
      return !exists;
    });

    if (missing.length === 0) {
      console.log(`✅ All Phase ${currentPhase} requirements met`);
    } else {
      console.log(`⚠️  Missing Phase ${currentPhase} requirements:`);
      missing.forEach((req) => console.log(`   - ${req}`));
    }

    // Check database requirements for Phase 2+
    if (currentPhase >= 2) {
      if (!process.env.DATABASE_URL) {
        console.log("⚠️  DATABASE_URL not configured for Phase 2+");
      }
    }
  } catch (error) {
    console.error("❌ Error validating phase requirements:", error.message);
    process.exit(1);
  }
}

validatePhaseRequirements();
