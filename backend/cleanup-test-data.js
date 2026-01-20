const mysql = require('mysql2/promise');
require('dotenv').config();

async function cleanupTestData() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('Cleaning up test data...\n');
    
    const [result] = await connection.execute(
      'DELETE FROM company_info WHERE title IN (?, ?)',
      ['Test Company Info', 'Test Full Record']
    );
    
    console.log(`✓ Deleted ${result.affectedRows} test records`);
    
    await connection.end();
    console.log('\n✓ Cleanup completed!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

cleanupTestData();
