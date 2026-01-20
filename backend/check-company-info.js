const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkCompanyInfoTable() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('Connected to database successfully!');

    const [tables] = await connection.execute('SHOW TABLES;');
    console.log('\nTables in database:');
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${Object.values(table)[0]}`);
    });

    const tableNames = tables.map(table => Object.values(table)[0]);
    
    if (tableNames.includes('company_info')) {
      console.log('\nFound table: company_info');
      
      const [columns] = await connection.execute('SHOW COLUMNS FROM company_info;');
      console.log('Columns in company_info table:');
      columns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
      });
      
      const [data] = await connection.execute('SELECT * FROM company_info;');
      console.log(`\nData in company_info table (${data.length} rows):`);
      if (data.length === 0) {
        console.log('  - No data found (table is empty)');
      } else {
        data.forEach(row => {
          console.log('  -', row);
        });
      }
    } else {
      console.log('\nTable company_info does NOT exist in the database!');
      console.log('This is likely the cause of the problem.');
    }

    await connection.end();
    console.log('\nConnection closed.');
  } catch (error) {
    console.error('Error:', error);
  }
}

checkCompanyInfoTable();
