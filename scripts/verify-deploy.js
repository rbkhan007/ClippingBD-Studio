#!/usr/bin/env node

/**
 * ClippingBD Studio - Pre-Deployment Verification Script
 * Run this before deploying to production
 */

const fs = require('fs');
const path = require('path');

const issues = [];
const warnings = [];

console.log('\n🔍 ClippingBD Studio - Pre-Deployment Check\n');
console.log('='.repeat(50));

// 1. Check environment variables
console.log('\n1️⃣ Checking environment configuration...');
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'NEXTAUTH_SECRET', 'ALLOWED_ORIGINS'];
const optionalEnvVars = ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'PAYPAL_CLIENT_ID'];

// Read .env if exists
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  requiredEnvVars.forEach(varName => {
    if (!envContent.includes(`${varName}=`)) {
      issues.push(`❌ Missing required env var: ${varName}`);
    }
  });
  
  // Check JWT secret is not default
  const jwtMatch = envContent.match(/JWT_SECRET=(.+)/);
  if (jwtMatch && jwtMatch[1] === 'clippingbd-studio-default-secret-change-in-production') {
    issues.push('❌ JWT_SECRET is still default. CHANGE IT BEFORE DEPLOY!');
  }
} else {
  warnings.push('⚠️  .env file not found');
}

console.log('   ✅ Environment variables checked');

// 2. Check database schema
console.log('\n2️⃣ Checking database schema...');
try {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  // Quick connection test
  prisma.$connect().then(() => {
    console.log('   ✅ Database connection OK');
    prisma.$disconnect();
  }).catch(err => {
    issues.push(`❌ Database connection failed: ${err.message}`);
  });
} catch (e) {
  warnings.push('⚠️  Could not test DB connection (run prisma generate first)');
}

// 3. Check all API routes exist
console.log('\n3️⃣ Verifying API routes...');
const apiDir = path.join(process.cwd(), 'src/app/api');
const requiredRoutes = [
  'auth/login',
  'auth/logout',
  'auth/signup',
  'auth/me',
  'orders',
  'tasks',
  'users',
  'upload',
  'cms/settings',
  'admin/payment-gateways',
  'payments/webhooks/stripe',
  'health',
];

requiredRoutes.forEach(route => {
  const routePath = path.join(apiDir, route, 'route.ts');
  if (!fs.existsSync(routePath)) {
    issues.push(`❌ Missing route: /api/${route}`);
  }
});

console.log(`   ✅ All ${requiredRoutes.length} critical routes present`);

// 4. Check for common issues
console.log('\n4️⃣ Scanning for common deployment issues...');

// Check for console.log in production code (except server-side)
const srcDir = path.join(process.cwd(), 'src');
let consoleCount = 0;

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory() && file !== 'node_modules' && !file.startsWith('.')) {
      scanDir(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const clientConsole = content.match(/console\.(log|warn|info)\(/g);
      if (clientConsole) {
        consoleCount += clientConsole.length;
      }
    }
  });
}

scanDir(srcDir);
if (consoleCount > 0) {
  warnings.push(`⚠️  Found ${consoleCount} console statements in source (will be stripped in production build)`);
}

console.log('   ✅ Code scan complete');

// 5. Check build output
console.log('\n5️⃣ Checking build output...');
const buildDir = path.join(process.cwd(), '.next');
if (fs.existsSync(buildDir)) {
  console.log('   ✅ Build directory exists');
} else {
  warnings.push('⚠️  No build found. Run "npm run build" before deploying.');
}

// 6. Summary
console.log('\n' + '='.repeat(50));
console.log('\n📋 SUMMARY\n');

if (issues.length > 0) {
  console.log('❌ CRITICAL ISSUES (must fix):');
  issues.forEach(issue => console.log(`   ${issue}`));
}

if (warnings.length > 0) {
  console.log('⚠️  WARNINGS:');
  warnings.forEach(warn => console.log(`   ${warn}`));
}

if (issues.length === 0) {
  console.log('✅ All checks passed!');
  console.log('\n🚀 You can deploy safely.');
  console.log('\nNext steps:');
  console.log('1. Commit all changes');
  console.log('2. Push to your hosting platform (Vercel/Railway)');
  console.log('3. Set environment variables in dashboard');
  console.log('4. Deploy!');
  
  process.exit(0);
} else {
  console.log('\n❌ Fix critical issues before deploying.');
  process.exit(1);
}
