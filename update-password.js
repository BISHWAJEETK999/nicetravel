const fs = require('fs');

// Read the .env file manually
const envContent = fs.readFileSync('.env', 'utf8');
const envLines = envContent.split('\n');

let DATABASE_URL = '';
for (const line of envLines) {
  if (line.startsWith('DATABASE_URL=')) {
    DATABASE_URL = line.split('=')[1];
    break;
  }
}

console.log('Found DATABASE_URL, connecting to update password...');

// Use a simple approach with pg
const { Client } = require('pg');

async function updatePassword() {
  const client = new Client({
    connectionString: DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database');
    
    const result = await client.query(
      "UPDATE users SET password = '8709612003' WHERE username = 'admin'"
    );
    
    console.log('Password updated successfully!');
    console.log('Rows affected:', result.rowCount);
    
    // Verify the update
    const checkResult = await client.query(
      "SELECT username, password FROM users WHERE username = 'admin'"
    );
    
    console.log('Current admin user:', checkResult.rows[0]);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

updatePassword();