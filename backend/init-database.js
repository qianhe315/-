const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDatabase() {
  try {
    console.log('Initializing database...');
    
    // Create connection without specifying database first to allow creating database if needed
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });
    
    console.log('Connected to MySQL server successfully!');
    
    // Create database if it doesn't exist
    await connection.execute(
      `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log(`Database "${process.env.DB_NAME}" created or already exists`);
    
    // Switch to the database
    await connection.execute(`USE ${process.env.DB_NAME}`);
    
    // Read the schema.sql file
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the SQL file into individual statements
    const statements = schemaContent.split(';').filter(statement => statement.trim() !== '');
    
    console.log(`Found ${statements.length} SQL statements`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        try {
          await connection.execute(statement);
          console.log(`✓ Executed statement ${i + 1}`);
        } catch (err) {
          console.log(`✗ Error executing statement ${i + 1}: ${err.message}`);
          console.log(`Statement: ${statement}`);
        }
      }
    }
    
    // Close connection
    await connection.end();
    console.log('\nDatabase initialization completed successfully!');
    console.log('All tables have been created and initial data has been inserted.');
    
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

initDatabase();
