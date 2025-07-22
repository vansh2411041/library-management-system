CREATE DATABASE IF NOT EXISTS SimpleLibrary;
USE SimpleLibrary;

CREATE TABLE Categories (
    CategoryID INT AUTO_INCREMENT PRIMARY KEY,
    CategoryName VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE Books (
    BookID INT AUTO_INCREMENT PRIMARY KEY,
    ISBN CHAR(13) UNIQUE,
    Title VARCHAR(255) NOT NULL,
    CopiesOwned INT UNSIGNED NOT NULL DEFAULT 1,
    CopiesAvailable INT UNSIGNED NOT NULL DEFAULT 1,
    CategoryID INT
);

CREATE TABLE Authors (
    AuthorID INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(100),
    LastName VARCHAR(100) NOT NULL
);

CREATE TABLE Members (
    MemberID INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(100),
    LastName VARCHAR(100),
    Email VARCHAR(150) UNIQUE,
    Password VARCHAR(255),
    JoinDate DATE,
    IsActive BOOLEAN DEFAULT TRUE
);

CREATE TABLE Loans (
    LoanID INT AUTO_INCREMENT PRIMARY KEY,
    BookID INT,
    MemberID INT,
    DateOut DATE,
    DateDue DATE,
    DateReturned DATE
);

CREATE TABLE BookAuthors (
    BookID INT,
    AuthorID INT,
    PRIMARY KEY (BookID, AuthorID)
);

-- Insert sample data
INSERT INTO Categories (CategoryName) VALUES ('Fiction'), ('Science'), ('Technology');
INSERT INTO Authors (FirstName, LastName) VALUES ('Isaac', 'Asimov'), ('Mary', 'Shelley'), ('Robert', 'Martin');