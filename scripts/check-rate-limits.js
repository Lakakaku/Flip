#!/usr/bin/env node

const fs = require('fs');

function checkRateLimits() {
  console.log('🕷️ Checking scraper rate limits...');

  try {
    const scrapersDir = 'lib/scrapers';

    if (!fs.existsSync(scrapersDir)) {
      console.log('⚠️  Scrapers directory not found');
      return;
    }

    const scraperFiles = fs
      .readdirSync(scrapersDir)
      .filter(file => file.endsWith('.js') || file.endsWith('.ts'));

    if (scraperFiles.length === 0) {
      console.log('📋 No scraper files found');
      return;
    }

    let issues = 0;

    scraperFiles.forEach(file => {
      const content = fs.readFileSync(`${scrapersDir}/${file}`, 'utf8');

      // Check for common rate limit patterns
      const checks = [
        {
          pattern: /delay|wait|sleep/i,
          message: 'Rate limiting delay found',
          required: true,
        },
        {
          pattern: /concurrent|parallel/i,
          message: 'Concurrent requests detected',
          required: false,
        },
        {
          pattern: /fetch|axios|request/i,
          message: 'HTTP requests found',
          required: false,
        },
      ];

      console.log(`\n📄 ${file}:`);

      let _hasDelay = false;
      checks.forEach(({ pattern, message, required }) => {
        const found = pattern.test(content);
        const icon = found ? '✅' : required ? '❌' : '⚠️';

        console.log(`   ${icon} ${message}: ${found ? 'Yes' : 'No'}`);

        if (required && found) _hasDelay = true;
        if (required && !found) issues++;
      });

      // Check for reasonable delay values
      const delayMatch = content.match(/(?:delay|wait|sleep)\s*\(?(\d+)/i);
      if (delayMatch) {
        const delayMs = parseInt(delayMatch[1]);
        if (delayMs < 1000) {
          console.log('   ⚠️  Delay might be too short (< 1000ms)');
          issues++;
        } else {
          console.log(`   ✅ Delay: ${delayMs}ms`);
        }
      }
    });

    console.log('\n🏁 Rate Limit Summary:');

    if (issues === 0) {
      console.log('✅ All scrapers appear to have appropriate rate limiting');
    } else {
      console.log(
        `❌ ${issues} potential rate limiting issue${issues > 1 ? 's' : ''} found`
      );
      console.log(
        '💡 Consider adding delays between requests to avoid being blocked'
      );
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error checking rate limits:', error.message);
    process.exit(1);
  }
}

checkRateLimits();
