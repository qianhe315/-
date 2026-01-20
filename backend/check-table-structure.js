const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkTableStructure() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('Checking company_info table structure...\n');
    
    const [columns] = await connection.execute('SHOW COLUMNS FROM company_info;');
    console.log('Current columns in company_info table:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });
    
    console.log('\nChecking if image_url column exists...');
    const hasImageUrl = columns.some(col => col.Field === 'image_url');
    console.log(`image_url column exists: ${hasImageUrl}`);
    
    if (!hasImageUrl) {
      console.log('\n⚠️  WARNING: image_url column is missing from the table!');
      console.log('This will cause errors when trying to save company info with images.');
      console.log('The Sequelize model expects an image_url field, but the database table does not have it.');
    }
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkTableStructure();
