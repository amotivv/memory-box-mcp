#!/usr/bin/env node

/**
 * Flat structure build script for creating Memory Box Desktop Extension (.dxt)
 * Matches the structure of working extensions like Limitless
 * 
 * This script:
 * 1. Compiles TypeScript
 * 2. Creates a flat structure with package.json at root
 * 3. Installs dependencies at root level
 * 4. Creates a .dxt archive
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import archiver from 'archiver';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT_DIR = path.join(__dirname, '..');
const BUILD_DIR = path.join(ROOT_DIR, 'build');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const STAGING_DIR = path.join(ROOT_DIR, '.staging-flat');
const SERVER_DIR = path.join(STAGING_DIR, 'server');

// Ensure directories exist
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Clean staging directory
function cleanStaging() {
  if (fs.existsSync(STAGING_DIR)) {
    fs.rmSync(STAGING_DIR, { recursive: true, force: true });
  }
}

// Copy file
function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

// Build the extension
async function build() {
  console.log('🔨 Building Memory Box Desktop Extension (Flat Structure)...\n');
  
  try {
    // Step 1: Clean up
    console.log('1. Cleaning up...');
    cleanStaging();
    ensureDir(DIST_DIR);
    
    // Step 2: Compile TypeScript
    console.log('2. Compiling TypeScript...');
    execSync('npm run build', { cwd: ROOT_DIR, stdio: 'inherit' });
    
    // Step 3: Create staging directory
    console.log('3. Creating staging directory...');
    ensureDir(STAGING_DIR);
    ensureDir(SERVER_DIR);
    
    // Step 4: Copy server files to server/ subdirectory
    console.log('4. Copying server files...');
    copyFile(path.join(BUILD_DIR, 'index.js'), path.join(SERVER_DIR, 'index.js'));
    
    // Step 5: Copy manifest and icon to root
    console.log('5. Copying manifest and assets...');
    copyFile(
      path.join(ROOT_DIR, 'desktop-extension', 'manifest.json'),
      path.join(STAGING_DIR, 'manifest.json')
    );
    
    // Copy icon if it exists
    const iconPath = path.join(ROOT_DIR, 'desktop-extension', 'memory-box-icon.png');
    if (fs.existsSync(iconPath)) {
      copyFile(iconPath, path.join(STAGING_DIR, 'memory-box-icon.png'));
    }
    
    // Step 6: Create package.json at ROOT level (not in server/)
    console.log('6. Creating root package.json...');
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8'));
    
    const rootPkg = {
      name: pkg.name,
      version: pkg.version,
      description: pkg.description,
      type: "module",
      main: "server/index.js",
      dependencies: {
        "@modelcontextprotocol/sdk": pkg.dependencies["@modelcontextprotocol/sdk"],
        "axios": pkg.dependencies["axios"]
      }
    };
    
    fs.writeFileSync(
      path.join(STAGING_DIR, 'package.json'),
      JSON.stringify(rootPkg, null, 2)
    );
    
    // Step 7: Install production dependencies at ROOT level
    console.log('7. Installing production dependencies...');
    execSync('npm install --production --no-optional', { cwd: STAGING_DIR, stdio: 'inherit' });
    
    // Step 8: Clean up node_modules
    console.log('8. Cleaning up node_modules...');
    const nodeModulesPath = path.join(STAGING_DIR, 'node_modules');
    
    // Remove unnecessary files
    const filesToRemove = [
      '**/*.map',
      '**/*.ts',
      '**/*.flow',
      '**/test',
      '**/tests',
      '**/__tests__',
      '**/docs',
      '**/example',
      '**/examples',
      '**/.github',
      '**/.idea',
      '**/src',
      '**/*.md',
      '!**/LICENSE*'
    ];
    
    // Use find command to remove files
    for (const pattern of filesToRemove) {
      if (pattern.startsWith('!')) continue;
      
      try {
        if (pattern.includes('*')) {
          execSync(`find "${nodeModulesPath}" -name "${pattern}" -type f -delete 2>/dev/null || true`, { stdio: 'ignore' });
        } else {
          execSync(`find "${nodeModulesPath}" -name "${pattern}" -type d -exec rm -rf {} + 2>/dev/null || true`, { stdio: 'ignore' });
        }
      } catch (e) {
        // Ignore errors
      }
    }
    
    // Remove only CDN files and browser builds that we definitely don't need
    try {
      // Remove CDN files (for browser) - we're running in Node.js
      execSync(`find "${nodeModulesPath}" -name "cdn.js" -type f -delete 2>/dev/null || true`, { stdio: 'ignore' });
      execSync(`find "${nodeModulesPath}" -name "cdn.min.js" -type f -delete 2>/dev/null || true`, { stdio: 'ignore' });
      execSync(`find "${nodeModulesPath}" -name "cdn.js.map" -type f -delete 2>/dev/null || true`, { stdio: 'ignore' });
      execSync(`find "${nodeModulesPath}" -name "cdn.min.js.map" -type f -delete 2>/dev/null || true`, { stdio: 'ignore' });
      
      // Remove axios browser builds - we use Node.js version
      execSync(`rm -rf "${nodeModulesPath}/axios/dist/browser" 2>/dev/null || true`, { stdio: 'ignore' });
    } catch (e) {
      // Ignore errors
    }
    
    // Step 9: Create .dxt archive
    console.log('9. Creating .dxt archive...');
    const outputPath = path.join(DIST_DIR, 'memory-box.dxt');
    
    await new Promise((resolve, reject) => {
      const output = fs.createWriteStream(outputPath);
      const archive = archiver('zip', {
        zlib: { level: 9 } // Maximum compression
      });
      
      output.on('close', () => {
        console.log(`   ✅ Created ${(archive.pointer() / 1024 / 1024).toFixed(2)}MB archive`);
        resolve();
      });
      
      archive.on('error', reject);
      
      archive.pipe(output);
      archive.directory(STAGING_DIR, false);
      archive.finalize();
    });
    
    // Step 10: Clean up staging
    console.log('10. Cleaning up staging directory...');
    cleanStaging();
    
    console.log('\n✅ Build complete!');
    console.log(`📦 Extension package: ${outputPath}`);
    console.log('\nTo install in Claude Desktop:');
    console.log('1. Open Claude Desktop');
    console.log('2. Go to Settings > Extensions');
    console.log('3. Click "Install from file"');
    console.log(`4. Select: ${outputPath}`);
    
  } catch (error) {
    console.error('\n❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Run build
build();
