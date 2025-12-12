import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function createAdminUser() {
  try {
    console.log('🔐 Creating admin user...');

    const email = 'admin@gmail.com';
    const password = 'admin1234';
    const firstName = 'Admin';
    const lastName = 'User';

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    
    if (existingUser.rows.length > 0) {
      // Update existing user to admin
      const password_hash = await bcrypt.hash(password, 10);
      await pool.query(
        'UPDATE users SET password_hash = $1, role = $2, first_name = $3, last_name = $4 WHERE email = $5',
        [password_hash, 'admin', firstName, lastName, email]
      );
      console.log('✅ Admin user updated successfully!');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
      console.log(`   Role: admin`);
    } else {
      // Create new admin user
      const password_hash = await bcrypt.hash(password, 10);
      const result = await pool.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         RETURNING id, email, first_name, last_name, role`,
        [email, password_hash, firstName, lastName, 'admin']
      );
      console.log('✅ Admin user created successfully!');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
      console.log(`   Role: admin`);
      console.log(`   User ID: ${result.rows[0].id}`);
    }

    console.log('\n🎉 Admin account ready!');
    console.log('   You can now login at: http://localhost:3001/admin/login');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

createAdminUser();

