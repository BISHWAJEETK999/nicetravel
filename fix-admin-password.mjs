import 'dotenv/config';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function updatePassword() {
  try {
    console.log('Updating admin password to 8709612003...');
    
    const result = await pool.query(
      "UPDATE users SET password = '8709612003' WHERE username = 'admin'"
    );
    
    console.log('Password updated successfully!');
    console.log('Rows affected:', result.rowCount);
    
    // Verify the update
    const checkResult = await pool.query(
      "SELECT username, password FROM users WHERE username = 'admin'"
    );
    
    console.log('Current admin user:', checkResult.rows[0]);
    console.log('\nYou can now login with:');
    console.log('Username: admin');
    console.log('Password: 8709612003');
    
  } catch (error) {
    console.error('Error updating password:', error);
  } finally {
    await pool.end();
  }
}

updatePassword();