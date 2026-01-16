const mysql = require('mysql2/promise');
require('dotenv').config({
  path: './backend/.env'
});

async function checkTables() {
  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('Connected to database successfully!');

    // Check all tables in the database
    const [tables] = await connection.execute(
      'SHOW TABLES;'
    );

    console.log('\nTables in database:');
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${Object.values(table)[0]}`);
    });

    // Check carousel/carousels table specifically
    const tableNames = tables.map(table => Object.values(table)[0]);
    if (tableNames.includes('carousel')) {
      console.log('\nFound table: carousel');
      // Get columns of carousel table
      const [columns] = await connection.execute(
        'SHOW COLUMNS FROM carousel;'
      );
      console.log('Columns in carousel table:');
      columns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
      });
      
      // Get data from carousel table
      const [data] = await connection.execute(
        'SELECT * FROM carousel;'
      );
      console.log(`\nData in carousel table (${data.length} rows):`);
      data.forEach(row => {
        console.log('  -', row);
      });
    }

    if (tableNames.includes('carousels')) {
      console.log('\nFound table: carousels');
      // Get columns of carousels table
      const [columns] = await connection.execute(
        'SHOW COLUMNS FROM carousels;'
      );
      console.log('Columns in carousels table:');
      columns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
      });
      
      // Get data from carousels table
      const [data] = await connection.execute(
        'SELECT * FROM carousels;'
      );
      console.log(`\nData in carousels table (${data.length} rows):`);
      data.forEach(row => {
        console.log('  -', row);
      });
    }

    // Close connection
    await connection.end();
    console.log('\nConnection closed.');
  } catch (error) {
    console.error('Error:', error);
  }
}

checkTables();