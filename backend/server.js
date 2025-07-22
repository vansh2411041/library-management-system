require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
    origin: 'http://localhost:3000',  // Correct frontend port
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Database connection
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Auth middleware
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

// Auth routes
app.post('/api/auth/register', [
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('firstName').notEmpty(),
    body('lastName').notEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, firstName, lastName } = req.body;
        
        // Check if user exists
        const [existingUsers] = await pool.execute(
            'SELECT * FROM Members WHERE Email = ?',
            [email]
        );
        
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert user
        const [result] = await pool.execute(
            'INSERT INTO Members (FirstName, LastName, Email, Password) VALUES (?, ?, ?, ?)',
            [firstName, lastName, email, hashedPassword]
        );

        // Generate token
        const token = jwt.sign(
            { userId: result.insertId, email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: { id: result.insertId, email, firstName, lastName }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    let user = null;
    let userType = 'user';
    
    // Check Admins table first
    const [admins] = await pool.execute(
      'SELECT * FROM Admins WHERE Email = ? AND IsActive = TRUE',
      [email]
    );
    
    if (admins.length > 0) {
      user = {
        MemberID: admins[0].AdminID,
        FirstName: admins[0].FirstName,
        LastName: admins[0].LastName,
        Email: admins[0].Email,
        Password: admins[0].Password
      };
      userType = 'admin';
    } else {
      // Check Members table
      const [members] = await pool.execute(
        'SELECT * FROM Members WHERE Email = ? AND IsActive = TRUE',
        [email]
      );
      
      if (members.length > 0) {
        user = members[0];
        userType = 'user';
      }
    }
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Handle both hashed and plain text passwords
    let isValidPassword = false;
    
    if (user.Password.startsWith('$2a$') || user.Password.startsWith('$2b$')) {
      // Password is hashed
      isValidPassword = await bcrypt.compare(password, user.Password);
    } else {
      // Password is plain text (fallback)
      isValidPassword = (password === user.Password);
      
      // Hash the plain text password for future use
      const hashedPassword = await bcrypt.hash(password, 10);
      if (userType === 'admin') {
        await pool.execute(
          'UPDATE Admins SET Password = ? WHERE AdminID = ?',
          [hashedPassword, user.MemberID]
        );
      }
    }
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign(
      { userId: user.MemberID, email: user.Email, role: userType },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.MemberID,
        email: user.Email,
        firstName: user.FirstName,
        lastName: user.LastName,
        role: userType
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/loans', authenticateToken, async (req, res) => {
  try {
    const { bookId, memberId } = req.body;
    
    // Check if book exists and is available
    const [books] = await pool.execute(
      'SELECT BookID, Title, CopiesAvailable FROM Books WHERE BookID = ?',
      [bookId]
    );
    
    if (books.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    if (books[0].CopiesAvailable <= 0) {
      return res.status(400).json({ message: 'Book not available for borrowing' });
    }
    
    // Calculate due date (2 weeks from now)
    const dateOut = new Date();
    const dateDue = new Date();
    dateDue.setDate(dateDue.getDate() + 14);
    
    // Create loan record
    const [result] = await pool.execute(
      'INSERT INTO Loans (BookID, MemberID, DateOut, DateDue) VALUES (?, ?, ?, ?)',
      [bookId, memberId, dateOut.toISOString().split('T')[0], dateDue.toISOString().split('T')[0]]
    );
    
    // Update book availability
    await pool.execute(
      'UPDATE Books SET CopiesAvailable = CopiesAvailable - 1 WHERE BookID = ?',
      [bookId]
    );
    
    console.log(`✅ Loan created: BookID ${bookId}, MemberID ${memberId}`);
    
    res.status(201).json({ 
      message: 'Book borrowed successfully',
      loanId: result.insertId,
      dueDate: dateDue.toISOString().split('T')[0]
    });
  } catch (error) {
    console.error('❌ Borrow book error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/register-admin', async (req, res) => {
  try {
    const { name, email, password, secretCode } = req.body;
    
    // Validate input
    if (!name || !email || !password || !secretCode) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Validate secret code
    if (secretCode !== process.env.ADMIN_SECRET_CODE) {
      return res.status(400).json({ message: 'Invalid secret code' });
    }
    
    // Check if admin already exists
    const [existingAdmin] = await pool.execute(
      'SELECT Email FROM Admins WHERE Email = ?',
      [email]
    );
    
    if (existingAdmin.length > 0) {
      return res.status(400).json({ message: 'Admin with this email already exists' });
    }
    
    // Additional validation
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    
    // Split name into first and last name
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || lastName || 'Admin';
    
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new admin with encrypted password
    const [result] = await pool.execute(
      'INSERT INTO Admins (FirstName, LastName, Email, Password, IsActive) VALUES (?, ?, ?, ?, TRUE)',
      [firstName, lastName, email, hashedPassword]
    );
    
    // Generate token for immediate login
    const token = jwt.sign(
      { userId: result.insertId, email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log(`✅ New admin registered: ${email} (Password encrypted automatically)`);
    
    res.status(201).json({
      message: 'Admin registered successfully',
      token,
      user: {
        id: result.insertId,
        email,
        firstName,
        lastName,
        role: 'admin'
      }
    });
    
  } catch (error) {
    console.error('❌ Admin registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// In your backend/server.js - add more detailed logging
app.post('/api/loans', authenticateToken, async (req, res) => {
  try {
    console.log('📥 Loan creation request received:', req.body);
    console.log('👤 User from token:', req.user);
    
    const { bookId, memberId } = req.body;
    
    if (!bookId || !memberId) {
      console.log('❌ Missing required fields:', { bookId, memberId });
      return res.status(400).json({ message: 'BookID and MemberID are required' });
    }
    
    // Rest of your endpoint code...
  } catch (error) {
    console.error('❌ Loan creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Books routes - FIXED
app.get('/api/books', async (req, res) => {
    try {
        const [books] = await pool.execute(`
            SELECT b.*, c.CategoryName,
                   GROUP_CONCAT(CONCAT(a.FirstName, ' ', a.LastName)) as Authors
            FROM Books b
            LEFT JOIN Categories c ON b.CategoryID = c.CategoryID
            LEFT JOIN BookAuthors ba ON b.BookID = ba.BookID
            LEFT JOIN Authors a ON ba.AuthorID = a.AuthorID
            GROUP BY b.BookID
        `);
        
        res.json(books);
    } catch (error) {
        console.error('Books fetch error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update your password reset endpoint
app.put('/api/admin/users/:id/reset-password', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const [adminCheck] = await pool.execute(
      'SELECT Role FROM Admins WHERE AdminID = ?',
      [req.user.userId]
    );
    
    if (adminCheck.length === 0) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const memberId = req.params.id;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.execute(
      'UPDATE Members SET Password = ? WHERE MemberID = ?',
      [hashedPassword, memberId] // Store hashed password instead of plain text
    );

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/books', authenticateToken, [
    body('title').notEmpty(),
    body('isbn').notEmpty(),
    body('copiesOwned').isInt({ min: 1 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, isbn, copiesOwned, categoryId, authors } = req.body;
        
        const [result] = await pool.execute(
            'INSERT INTO Books (Title, ISBN, CopiesOwned, CopiesAvailable, CategoryID) VALUES (?, ?, ?, ?, ?)',
            [title, isbn, copiesOwned, copiesOwned, categoryId || null]
        );

        res.status(201).json({ 
            message: 'Book added successfully', 
            bookId: result.insertId 
        });
    } catch (error) {
        console.error('Book creation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Loans routes
app.get('/api/loans', authenticateToken, async (req, res) => {
  try {
    const [loans] = await pool.execute(`
      SELECT 
        l.LoanID,
        l.BookID,
        l.MemberID,
        l.DateOut,
        l.DateDue,
        l.DateReturned,
        b.Title,
        b.ISBN,
        m.FirstName,
        m.LastName,
        m.Email
      FROM Loans l
      JOIN Books b ON l.BookID = b.BookID
      JOIN Members m ON l.MemberID = m.MemberID
      ORDER BY l.DateOut DESC
    `);
    
    console.log('Loans retrieved:', loans.length); // Debug log
    res.json(loans);
  } catch (error) {
    console.error('Loans fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.post('/api/loans', authenticateToken, async (req, res) => {
  try {
    const { bookId, memberId } = req.body;
    
    // Check if book is available
    const [books] = await pool.execute(
      'SELECT CopiesAvailable FROM Books WHERE BookID = ?',
      [bookId]
    );
    
    if (books.length === 0 || books[0].CopiesAvailable <= 0) {
      return res.status(400).json({ message: 'Book not available' });
    }
    
    // Calculate due date (2 weeks from now)
    const dateOut = new Date();
    const dateDue = new Date();
    dateDue.setDate(dateDue.getDate() + 14);
    
    // Create loan record
    const [result] = await pool.execute(
      'INSERT INTO Loans (BookID, MemberID, DateOut, DateDue) VALUES (?, ?, ?, ?)',
      [bookId, memberId, dateOut.toISOString().split('T')[0], dateDue.toISOString().split('T')[0]]
    );
    
    // Update book availability
    await pool.execute(
      'UPDATE Books SET CopiesAvailable = CopiesAvailable - 1 WHERE BookID = ?',
      [bookId]
    );
    
    res.status(201).json({ 
      message: 'Book borrowed successfully',
      loanId: result.insertId 
    });
  } catch (error) {
    console.error('Borrow book error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/loans', authenticateToken, [
    body('bookId').isInt(),
    body('memberId').isInt()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { bookId, memberId } = req.body;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14); // 2 weeks loan period
        
        // Check if book is available
        const [books] = await pool.execute(
            'SELECT CopiesAvailable FROM Books WHERE BookID = ?',
            [bookId]
        );
        
        if (books.length === 0 || books[0].CopiesAvailable <= 0) {
            return res.status(400).json({ message: 'Book not available' });
        }

        // Create loan
        const [result] = await pool.execute(
            'INSERT INTO Loans (BookID, MemberID, DateDue) VALUES (?, ?, ?)',
            [bookId, memberId, dueDate]
        );

        res.status(201).json({ 
            message: 'Book borrowed successfully', 
            loanId: result.insertId 
        });
    } catch (error) {
        console.error('Loan creation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Members routes
app.get('/api/members', authenticateToken, async (req, res) => {
    try {
        const [members] = await pool.execute(
            'SELECT MemberID, FirstName, LastName, Email, JoinDate, IsActive FROM Members WHERE IsActive = TRUE'
        );
        
        res.json(members);
    } catch (error) {
        console.error('Members fetch error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});

app.get('/api/admin/list', authenticateToken, async (req, res) => {
    try {
        // Verify user is admin
        const [adminCheck] = await pool.execute(
            'SELECT Role FROM Admins WHERE AdminID = ?',
            [req.user.userId]
        );
        
        if (adminCheck.length === 0) {
            return res.status(403).json({ message: 'Admin access required' });
        }
        
        const [admins] = await pool.execute(
            'SELECT AdminID, FirstName, LastName, Email, Role, CreatedDate, IsActive, LastLoginDate FROM Admins ORDER BY CreatedDate DESC'
        );
        
        res.json(admins);
    } catch (error) {
        console.error('Admin list error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin only: reset a member’s password
// Update your password reset endpoint
app.put('/api/admin/users/:id/reset-password', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const [adminCheck] = await pool.execute(
      'SELECT Role FROM Admins WHERE AdminID = ?',
      [req.user.userId]
    );
    
    if (adminCheck.length === 0) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const memberId = req.params.id;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.execute(
      'UPDATE Members SET Password = ? WHERE MemberID = ?',
      [hashedPassword, memberId] // Store hashed password instead of plain text
    );

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get system statistics (admin-only)
app.get('/api/admin/stats', authenticateToken, async (req, res) => {
    try {
        // Verify user is admin
        const [adminCheck] = await pool.execute(
            'SELECT Role FROM Admins WHERE AdminID = ?',
            [req.user.userId]
        );
        
        if (adminCheck.length === 0) {
            return res.status(403).json({ message: 'Admin access required' });
        }
        
        // Get comprehensive statistics
        const [bookStats] = await pool.execute('SELECT COUNT(*) as totalBooks, SUM(CopiesOwned) as totalCopies, SUM(CopiesAvailable) as availableCopies FROM Books');
        const [memberStats] = await pool.execute('SELECT COUNT(*) as totalMembers FROM Members WHERE IsActive = TRUE');
        const [loanStats] = await pool.execute('SELECT COUNT(*) as activeLoans FROM Loans WHERE DateReturned IS NULL');
        const [adminStats] = await pool.execute('SELECT COUNT(*) as totalAdmins FROM Admins WHERE IsActive = TRUE');
        
        res.json({
            books: bookStats[0],
            members: memberStats[0],
            loans: loanStats[0],
            admins: adminStats[0]
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = app;
