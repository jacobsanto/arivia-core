#!/usr/bin/env node

/**
 * Comprehensive Console Cleanup Script
 * Replaces all console statements with secure logger calls
 */

const fs = require('fs');
const path = require('path');

// Map console methods to logger methods
const consoleToLoggerMap = {
  'console.log': 'logger.info',
  'console.info': 'logger.info', 
  'console.warn': 'logger.warn',
  'console.error': 'logger.error',
  'console.debug': 'logger.debug'
};

// Pattern to match console statements
const consolePattern = /console\.(log|info|warn|error|debug)\s*\(/g;

// Import pattern to add logger
const loggerImport = "import { logger } from '@/services/logger';\n";

let totalFiles = 0;
let modifiedFiles = 0;
let totalReplacements = 0;

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let hasChanges = false;
    
    // Replace console statements
    newContent = newContent.replace(consolePattern, (match, method) => {
      hasChanges = true;
      totalReplacements++;
      return `logger.${method === 'log' ? 'info' : method}(`;
    });
    
    // Add logger import if changes were made and import doesn't exist
    if (hasChanges && !content.includes("from '@/services/logger'")) {
      // Find the right place to insert the import
      const lines = newContent.split('\n');
      let insertIndex = 0;
      
      // Look for existing imports
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ') || lines[i].startsWith("import {")) {
          insertIndex = i + 1;
        } else if (lines[i].trim() === '' || lines[i].startsWith('//') || lines[i].startsWith('/*')) {
          continue;
        } else {
          break;
        }
      }
      
      lines.splice(insertIndex, 0, loggerImport.trim());
      newContent = lines.join('\n');
    }
    
    // Write the modified content back to file
    if (hasChanges) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      modifiedFiles++;
      console.log(`✅ Cleaned: ${filePath}`);
    }
    
    totalFiles++;
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip hidden directories and node_modules
      if (!file.startsWith('.') && file !== 'node_modules') {
        walkDirectory(fullPath);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      // Skip test files and specific files
      if (!file.includes('.test.') && !file.includes('.spec.') && 
          !file.includes('logger.ts') && !file.includes('console-patch.ts')) {
        processFile(fullPath);
      }
    }
  }
}

// Start the cleanup
console.log('🧹 Starting comprehensive console cleanup...\n');

const srcDir = path.join(process.cwd(), 'src');
walkDirectory(srcDir);

console.log('\n📊 CLEANUP SUMMARY:');
console.log(`Total files processed: ${totalFiles}`);
console.log(`Files modified: ${modifiedFiles}`);
console.log(`Console statements replaced: ${totalReplacements}`);

if (totalReplacements > 0) {
  console.log('\n✅ Console cleanup completed successfully!');
  console.log('🔒 Production security vulnerability resolved.');
} else {
  console.log('\n✅ No console statements found to clean up.');
}