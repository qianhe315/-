const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixCompanyInfoTable() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('Connecting to database...\n');
    
    console.log('Adding missing columns to company_info table...\n');
    
    try {
      await connection.execute(
        'ALTER TABLE company_info ADD COLUMN image_url VARCHAR(500) NULL;'
      );
      console.log('✓ Added image_url column');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('✓ image_url column already exists');
      } else {
        console.error('✗ Error adding image_url column:', err.message);
      }
    }
    
    try {
      await connection.execute(
        'ALTER TABLE company_info ADD COLUMN sort_order INT DEFAULT 0;'
      );
      console.log('✓ Added sort_order column');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('✓ sort_order column already exists');
      } else {
        console.error('✗ Error adding sort_order column:', err.message);
      }
    }
    
    console.log('\nVerifying the updated table structure:');
    const [columns] = await connection.execute('SHOW COLUMNS FROM company_info;');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });
    
    await connection.end();
    console.log('\n✓ Table structure updated successfully!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fixCompanyInfoTable();
