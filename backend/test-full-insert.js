const mysql = require('mysql2/promise');
require('dotenv').config();

async function testFullInsert() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('Testing full company info insert with all fields...\n');
    
    const testRecord = {
      title: 'Test Full Record',
      content: 'This is a test content with all fields',
      type: 'brand_story',
      is_active: 1,
      image_url: 'http://example.com/test-image.jpg',
      sort_order: 10
    };
    
    console.log('Inserting record:', JSON.stringify(testRecord, null, 2));
    
    const [result] = await connection.execute(
      'INSERT INTO company_info (title, content, type, is_active, image_url, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
      [testRecord.title, testRecord.content, testRecord.type, testRecord.is_active, testRecord.image_url, testRecord.sort_order]
    );
    
    console.log(`\n✓ Inserted record with ID: ${result.insertId}`);
    
    const [newRecord] = await connection.execute('SELECT * FROM company_info WHERE id = ?', [result.insertId]);
    console.log('\nRetrieved record:', JSON.stringify(newRecord[0], null, 2));
    
    await connection.end();
    console.log('\n✓ Full insert test passed!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testFullInsert();
