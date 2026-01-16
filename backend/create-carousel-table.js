const mysql = require('mysql2/promise');
require('dotenv').config();

async function createCarouselTable() {
  try {
    // Create database connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });

    console.log('Connected to database.');

    // Create carousel table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS carousels (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL COMMENT '轮播图标题',
        description TEXT COMMENT '轮播图描述',
        image VARCHAR(255) NOT NULL COMMENT '轮播图图片路径',
        button_text VARCHAR(50) COMMENT '按钮文本',
        button_link VARCHAR(255) COMMENT '按钮链接',
        sort_order INT NOT NULL DEFAULT 0 COMMENT '排序顺序，数值越小越靠前',
        is_active BOOLEAN NOT NULL DEFAULT true COMMENT '是否激活',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.execute(createTableQuery);
    console.log('Carousel table created or already exists.');

    // Check if all required columns exist
    const checkColumnsQuery = `
      SHOW COLUMNS FROM carousels;
    `;

    const [columns] = await connection.execute(checkColumnsQuery);
    const columnNames = columns.map(col => col.Field);

    console.log('Existing columns:', columnNames);

    // Close connection
    await connection.end();
    console.log('Database connection closed.');

  } catch (error) {
    console.error('Error creating carousel table:', error);
  }
}

createCarouselTable();