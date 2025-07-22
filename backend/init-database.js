const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeDatabase() {
    try {
        console.log('🔄 Connecting to MySQL...');
        
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD
        });

        console.log('✅ Connected to MySQL');

        // Create database
        await connection.execute('CREATE DATABASE IF NOT EXISTS SimpleLibrary');
        console.log('✅ Database created');

        await connection.execute('USE SimpleLibrary');
        console.log('✅ Using SimpleLibrary database');

        // Create tables with basic syntax only
        console.log('🔄 Creating tables...');

        await connection.execute('CREATE TABLE IF NOT EXISTS Categories (CategoryID INT AUTO_INCREMENT PRIMARY KEY, CategoryName VARCHAR(100) NOT NULL UNIQUE)');
        console.log('✅ Categories table created');

        await connection.execute('CREATE TABLE IF NOT EXISTS Authors (AuthorID INT AUTO_INCREMENT PRIMARY KEY, FirstName VARCHAR(100), LastName VARCHAR(100) NOT NULL)');
        console.log('✅ Authors table created');

        await connection.execute('CREATE TABLE IF NOT EXISTS Books (BookID INT AUTO_INCREMENT PRIMARY KEY, ISBN CHAR(13) UNIQUE, Title VARCHAR(255) NOT NULL, CopiesOwned INT UNSIGNED NOT NULL DEFAULT 1, CopiesAvailable INT UNSIGNED NOT NULL DEFAULT 1, CategoryID INT)');
        console.log('✅ Books table created');

        await connection.execute('CREATE TABLE IF NOT EXISTS Members (MemberID INT AUTO_INCREMENT PRIMARY KEY, FirstName VARCHAR(100), LastName VARCHAR(100), Email VARCHAR(150) UNIQUE, Password VARCHAR(255), JoinDate DATE, IsActive BOOLEAN DEFAULT TRUE)');
        console.log('✅ Members table created');

        await connection.execute('CREATE TABLE IF NOT EXISTS Loans (LoanID INT AUTO_INCREMENT PRIMARY KEY, BookID INT, MemberID INT, DateOut DATE, DateDue DATE, DateReturned DATE)');
        console.log('✅ Loans table created');

        await connection.execute('CREATE TABLE IF NOT EXISTS BookAuthors (BookID INT, AuthorID INT, PRIMARY KEY (BookID, AuthorID))');
        console.log('✅ BookAuthors table created');

        // Insert sample data
        console.log('🔄 Inserting sample data...');
        
        await connection.execute("INSERT IGNORE INTO Categories (CategoryName) VALUES ('Fiction'), ('Science'), ('Technology')");
        await connection.execute("INSERT IGNORE INTO Authors (FirstName, LastName) VALUES ('Isaac', 'Asimov'), ('Mary', 'Shelley'), ('Robert', 'Martin')");
        
        // Insert books with direct category references
        await connection.execute("INSERT IGNORE INTO Books (ISBN, Title, CopiesOwned, CopiesAvailable, CategoryID) VALUES ('9780553293357', 'Foundation', 3, 3, 2), ('9780141439471', 'Frankenstein', 2, 2, 1), ('9780132350884', 'Clean Code', 1, 1, 3)");
        
        // Link first book to first author, second book to second author, etc.
        await connection.execute("INSERT IGNORE INTO BookAuthors (BookID, AuthorID) VALUES (1, 1), (2, 2), (3, 3)");

        console.log('✅ Sample data inserted');

        // Show what was created
        const [bookCount] = await connection.execute('SELECT COUNT(*) as count FROM Books');
        const [authorCount] = await connection.execute('SELECT COUNT(*) as count FROM Authors');
        const [categoryCount] = await connection.execute('SELECT COUNT(*) as count FROM Categories');
        
        console.log('\n📊 Database Summary:');
        console.log(`   📚 Books: ${bookCount[0].count}`);
        console.log(`   👥 Authors: ${authorCount[0].count}`);
        console.log(`   📂 Categories: ${categoryCount[0].count}`);
        
        await connection.end();
        console.log('🎉 Database initialization completed successfully!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('💡 Check your MySQL username and password in .env file');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('💡 Make sure MySQL server is running');
        }
        process.exit(1);
    }
}

initializeDatabase();
