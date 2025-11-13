#!/usr/bin/env node

/**
 * Script to create the first admin user
 * Usage: node scripts/createAdmin.js
 */

require('dotenv').config();
const Admin = require('../src/models/firestore/Admin');
const Settings = require('../src/models/firestore/Settings');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin() {
  try {
    console.log('\n🔐 ClarityVid AI - Admin Setup\n');
    console.log('This script will create your first admin account.\n');

    // Check if admin already exists
    const existingAdmin = await Admin.findByUsername('admin');
    if (existingAdmin) {
      console.log('❌ An admin user already exists.');
      console.log('   Username: admin');
      console.log('\nIf you forgot your password, you can reset it by:');
      console.log('1. Deleting the admin document from Firestore');
      console.log('2. Running this script again\n');
      rl.close();
      process.exit(0);
    }

    // Get admin details
    const username = await question('Enter admin username (default: admin): ') || 'admin';
    const email = await question('Enter admin email: ');

    let password;
    let confirmPassword;

    do {
      password = await question('Enter admin password (min 8 characters): ');

      if (password.length < 8) {
        console.log('❌ Password must be at least 8 characters long.\n');
        continue;
      }

      confirmPassword = await question('Confirm password: ');

      if (password !== confirmPassword) {
        console.log('❌ Passwords do not match. Try again.\n');
      }
    } while (password !== confirmPassword || password.length < 8);

    console.log('\n⏳ Creating admin account...');

    // Create admin
    const admin = await Admin.create({
      username,
      email,
      password,
      role: 'super_admin',
      permissions: ['all'],
    });

    console.log('✅ Admin account created successfully!\n');
    console.log('📋 Admin Details:');
    console.log(`   Username: ${admin.username}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   ID: ${admin.id}\n`);

    // Create default settings
    console.log('⏳ Creating default settings...');
    await Settings.createDefaultSettings();
    console.log('✅ Default settings created!\n');

    console.log('🎉 Setup complete! You can now login to the admin panel.\n');
    console.log('Admin Panel URL: http://localhost:3000/admin');
    console.log('Or in production: https://your-domain.com/admin\n');

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message);
    rl.close();
    process.exit(1);
  }
}

// Run the script
createAdmin();
