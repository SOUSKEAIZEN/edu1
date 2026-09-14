import * as argon2 from 'argon2';
import { query } from './index';

async function createTempUser() {
  try {
    const email = '123@gmail.com';
    const plainPassword = '123';
    
    const passwordHash = await argon2.hash(plainPassword);
    
    const userRes = await query(`
      INSERT INTO users (email, password_hash, role, is_active)
      VALUES ($1, $2, 'STUDENT', true)
      ON CONFLICT (email) DO UPDATE SET password_hash = $2
      RETURNING id, role
    `, [email, passwordHash]);
    
    const userId = userRes.rows[0].id;
    
    await query(`
      INSERT INTO student_profiles (user_id, full_name, enrollment_date)
      VALUES ($1, 'Test Student', CURRENT_DATE)
      ON CONFLICT (user_id) DO NOTHING
    `, [userId]);

    console.log(`✅ Success! Temporary user created.`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${plainPassword}`);
    console.log(`Role: STUDENT`);
    process.exit(0);
  } catch (err) {
    console.error('Error creating user:', err);
    process.exit(1);
  }
}

createTempUser();
