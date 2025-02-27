#!/usr/bin/env node

/**
 * System Prompt Helper for Memory Box MCP Server
 * 
 * This script helps users view and manage the system prompt used for memory formatting.
 * 
 * Usage:
 *   npm run prompt-helper -- view     # View the current system prompt
 *   npm run prompt-helper -- reset    # Reset to the default system prompt
 *   npm run prompt-helper -- validate # Validate the current system prompt
 */

import fs from 'fs';
import path from 'path';
import { DEFAULT_SYSTEM_PROMPT, validateSystemPrompt } from './system-prompt.js';

// Get the Cline MCP settings file path
const CLINE_SETTINGS_PATH = process.env.CLINE_SETTINGS_PATH || path.join(
  process.env.HOME || '~',
  'Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json'
);

// Get the Claude Desktop settings file path (if available)
const CLAUDE_SETTINGS_PATH = process.env.CLAUDE_SETTINGS_PATH || path.join(
  process.env.HOME || '~',
  'Library/Application Support/Claude/claude_desktop_config.json'
);

/**
 * Read the current system prompt from the settings file
 */
function getCurrentPrompt(): string | null {
  try {
    // Try to read from Cline settings
    if (fs.existsSync(CLINE_SETTINGS_PATH)) {
      const settings = JSON.parse(fs.readFileSync(CLINE_SETTINGS_PATH, 'utf8'));
      const memoryBoxSettings = settings.mcpServers?.['memory-box-mcp'];
      return memoryBoxSettings?.env?.SYSTEM_PROMPT || null;
    }
    
    // Try to read from Claude Desktop settings
    if (fs.existsSync(CLAUDE_SETTINGS_PATH)) {
      const settings = JSON.parse(fs.readFileSync(CLAUDE_SETTINGS_PATH, 'utf8'));
      const memoryBoxSettings = settings.mcpServers?.['memory-box-mcp'];
      return memoryBoxSettings?.env?.SYSTEM_PROMPT || null;
    }
    
    return null;
  } catch (error) {
    console.error('Error reading settings file:', error);
    return null;
  }
}

/**
 * View the current system prompt
 */
function viewPrompt(): void {
  const currentPrompt = getCurrentPrompt();
  
  console.log('\n=== MEMORY BOX SYSTEM PROMPT ===\n');
  
  if (currentPrompt) {
    console.log('Custom system prompt is configured:');
    console.log(currentPrompt);
  } else {
    console.log('Using default system prompt:');
    console.log(DEFAULT_SYSTEM_PROMPT);
  }
  
  console.log('\n================================\n');
}

/**
 * Reset to the default system prompt
 */
function resetPrompt(): void {
  try {
    // Update Cline settings if they exist
    if (fs.existsSync(CLINE_SETTINGS_PATH)) {
      const settings = JSON.parse(fs.readFileSync(CLINE_SETTINGS_PATH, 'utf8'));
      
      if (settings.mcpServers?.['memory-box-mcp']?.env) {
        // Remove the SYSTEM_PROMPT from the env object
        delete settings.mcpServers['memory-box-mcp'].env.SYSTEM_PROMPT;
        
        // Write the updated settings back to the file
        fs.writeFileSync(CLINE_SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf8');
        console.log('Reset to default system prompt in Cline settings.');
      }
    }
    
    // Update Claude Desktop settings if they exist
    if (fs.existsSync(CLAUDE_SETTINGS_PATH)) {
      const settings = JSON.parse(fs.readFileSync(CLAUDE_SETTINGS_PATH, 'utf8'));
      
      if (settings.mcpServers?.['memory-box-mcp']?.env) {
        // Remove the SYSTEM_PROMPT from the env object
        delete settings.mcpServers['memory-box-mcp'].env.SYSTEM_PROMPT;
        
        // Write the updated settings back to the file
        fs.writeFileSync(CLAUDE_SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf8');
        console.log('Reset to default system prompt in Claude Desktop settings.');
      }
    }
    
    console.log('System prompt has been reset to the default.');
  } catch (error) {
    console.error('Error resetting system prompt:', error);
  }
}

/**
 * Validate the current system prompt
 */
function validatePrompt(): void {
  const currentPrompt = getCurrentPrompt() || DEFAULT_SYSTEM_PROMPT;
  
  console.log('\n=== VALIDATING SYSTEM PROMPT ===\n');
  
  const isValid = validateSystemPrompt(currentPrompt);
  
  if (isValid) {
    console.log('✅ System prompt is valid and contains all required elements.');
  } else {
    console.log('⚠️ System prompt may be missing required elements.');
    console.log('Required elements: TECHNICAL, DECISION, SOLUTION, CONCEPT, REFERENCE, APPLICATION, YYYY-MM-DD');
  }
  
  console.log('\n================================\n');
}

/**
 * Main function
 */
function main(): void {
  const command = process.argv[2];
  
  switch (command) {
    case 'view':
      viewPrompt();
      break;
    case 'reset':
      resetPrompt();
      break;
    case 'validate':
      validatePrompt();
      break;
    default:
      console.log('Usage:');
      console.log('  npm run prompt-helper -- view     # View the current system prompt');
      console.log('  npm run prompt-helper -- reset    # Reset to the default system prompt');
      console.log('  npm run prompt-helper -- validate # Validate the current system prompt');
      break;
  }
}

main();
