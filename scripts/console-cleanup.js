#!/usr/bin/env node

/**
 * Console Cleanup Script - Phase 1 of Health Score Improvement
 * Automatically replaces console.log statements with secure logger calls
 */

const fs = require('fs');
const path = require('path');

const LOGGER_IMPORT = "import { logger } from '@/services/logger';";

// File processing patterns
const patterns = {
  'console.log': (match, args) => `logger.debug(${args})`,
  'console.info': (match, args) => `logger.info(${args})`,
  'console.warn': (match, args) => `logger.warn(${args})`,
  'console.error': (match, args) => `logger.error(${args})`,
  'console.debug': (match, args) => `logger.debug(${args})`
};

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    let hasLogger = content.includes("logger") || content.includes("@/services/logger");

    // Replace console statements
    Object.keys(patterns).forEach(consoleMethod => {
      const regex = new RegExp(`${consoleMethod.replace('.', '\\.')}\\(([^;]+)\\);?`, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, (match, args) => {
          hasChanges = true;
          return patterns[consoleMethod](match, args) + ';';
        });
      }
    });

    // Add logger import if needed
    if (hasChanges && !hasLogger) {
      const importRegex = /import.*from.*['"][^'"]*['"];?\s*\n/g;
      const imports = content.match(importRegex);
      
      if (imports && imports.length > 0) {
        const lastImport = imports[imports.length - 1];
        const lastImportIndex = content.lastIndexOf(lastImport);
        const insertIndex = lastImportIndex + lastImport.length;
        
        content = content.slice(0, insertIndex) + LOGGER_IMPORT + '\n' + content.slice(insertIndex);
      }
    }

    if (hasChanges) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Processed: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function walkDirectory(dir, fileCount = { processed: 0, total: 0 }) {
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      walkDirectory(fullPath, fileCount);
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      fileCount.total++;
      if (processFile(fullPath)) {
        fileCount.processed++;
      }
    }
  });
  
  return fileCount;
}

// Run cleanup
console.log('🚀 Starting console cleanup...');
const srcPath = path.join(process.cwd(), 'src');
const result = walkDirectory(srcPath);

console.log(`\n📊 Summary:`);
console.log(`   Total files scanned: ${result.total}`);
console.log(`   Files processed: ${result.processed}`);
console.log(`   Success rate: ${((result.processed / result.total) * 100).toFixed(1)}%`);
console.log('\n✨ Console cleanup complete!');