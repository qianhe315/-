const mysql = require('mysql2/promise');
require('dotenv').config();

async function testCompanyInfoAPI() {
  try {
    console.log('Testing Company Info API directly...\n');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('1. Testing SELECT query (equivalent to GET /company-info)');
    const [rows] = await connection.execute('SELECT * FROM company_info ORDER BY created_at DESC');
    console.log('Results:', JSON.stringify(rows, null, 2));
    console.log(`Found ${rows.length} records\n`);
    
    console.log('2. Testing INSERT query (equivalent to POST /company-info)');
    const testRecord = {
      title: 'Test Company Info',
      content: 'This is a test content',
      type: 'brand_story',
      is_active: 1
    };
    const [result] = await connection.execute(
      'INSERT INTO company_info (title, content, type, is_active) VALUES (?, ?, ?, ?)',
      [testRecord.title, testRecord.content, testRecord.type, testRecord.is_active]
    );
    console.log(`Inserted record with ID: ${result.insertId}\n`);
    
    console.log('3. Verifying the inserted record');
    const [newRecord] = await connection.execute('SELECT * FROM company_info WHERE id = ?', [result.insertId]);
    console.log('New record:', JSON.stringify(newRecord[0], null, 2));
    
    await connection.end();
    console.log('\nAll database tests passed!');
  } catch (error) {
    console.error('Error occurred:', error.message);
    console.error('Error details:', error);
  }
}

testCompanyInfoAPI();
