#!/usr/bin/env ts-node

/**
 * Script to identify and provide replacement suggestions for console statements
 * Run this to get a list of files that need console.* replacements
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

interface ConsoleMatch {
  file: string;
  line: number;
  original: string;
  replacement: string;
}

const consolePattern = /console\.(log|info|warn|error|debug)\s*\(/g;

function findConsoleStatements(dir: string): ConsoleMatch[] {
  const matches: ConsoleMatch[] = [];
  
  function walkDirectory(currentDir: string) {
    const files = readdirSync(currentDir);
    
    for (const file of files) {
      const fullPath = join(currentDir, file);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!file.startsWith('.') && file !== 'node_modules') {
          walkDirectory(fullPath);
        }
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        if (!file.includes('.test.') && !file.includes('.spec.') && 
            !file.includes('logger.ts') && !file.includes('console-replacement.ts')) {
          processFile(fullPath);
        }
      }
    }
  }
  
  function processFile(filePath: string) {
    try {
      const content = readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        const consoleMatches = [...line.matchAll(consolePattern)];
        consoleMatches.forEach(match => {
          const method = match[1];
          const replacement = method === 'log' ? 'logger.info(' : `logger.${method}(`;
          matches.push({
            file: filePath.replace(process.cwd() + '/', ''),
            line: index + 1,
            original: match[0],
            replacement
          });
        });
      });
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error);
    }
  }
  
  walkDirectory(dir);
  return matches;
}

if (require.main === module) {
  const srcDir = join(process.cwd(), 'src');
  const matches = findConsoleStatements(srcDir);
  
  console.log(`Found ${matches.length} console statements to replace:`);
  console.log('\nFiles that need logger import:');
  
  const filesNeedingImport = new Set<string>();
  matches.forEach(match => {
    filesNeedingImport.add(match.file);
  });
  
  Array.from(filesNeedingImport).forEach(file => {
    console.log(`- ${file}`);
  });
}

export { findConsoleStatements };