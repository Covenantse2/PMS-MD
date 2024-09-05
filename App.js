require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const authRoutes = require('./routes/auth');
const companyRoutes = require('./routes/companyRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const customerRoutes = require('./routes/customerRoutes');
const groupRouter = require('./routes/groupRoutes');
const customerDoc = require('./routes/customerDocRoutes');
const masterdataRoutes = require('./routes/masterdataRoutes');
const executiveRoute = require('./routes/executiveRoutes');
const addTaskRoute = require('./routes/taskRoutes');
const taskRoutes = require('./routes/extaskRoutes');
const productRoutes = require('./routes/products');
const chatRoute = require('./routes/chatRoute');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');
const db = require('./models/db');

const app = express();
const PORT = process.env.PORT || 4000;

// Test Database Connection
// db.getConnection()
//     .then(conn => {
//         console.log('Database connected successfully');
//         conn.release(); // Release connection back to the pool
//     })
//     .catch(err => {
//         console.error('Error connecting to the database:', err);
//     });
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Session middleware
// MySQL session store configuration (optional)
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Session middleware setup
app.use(session({
  secret: 'your-secret-key',  // Replace with your own secret key
  resave: false,
  saveUninitialized: false,  // Only save session when it's modified
  store: sessionStore,  // Use MySQL store to persist sessions
  cookie: { 
      maxAge: 1000 * 60 * 60 * 24,  // 1 day session
      secure: false  // Set to true if using HTTPS
  }
}));

// Routes
app.use('/chat', chatRoute);
app.use('/products', productRoutes);
app.use('/tasks', taskRoutes);
app.use('/addTask', addTaskRoute);
app.use('/executive', executiveRoute);
app.use('/master', masterdataRoutes);
app.use('/customer', customerDoc);
app.use('/groups', groupRouter);
app.use('/customers', customerRoutes);
app.use('/employee', employeeRoutes);
app.use('/company', companyRoutes);
app.use('/', authRoutes);

// Serve the index page
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public/index.html'));
// });

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/dashboard-counts', async (req, res) => {
    try {
      const [companyCount] = await db.query('SELECT COUNT(*) AS count FROM company');
      const [employeeCount] = await db.query('SELECT COUNT(*) AS count FROM employee');
      const [groupCount] = await db.query(`SELECT COUNT(*) AS count FROM \`groups\` `);
      const [customerCount] = await db.query('SELECT COUNT(*) AS count FROM customer');
      const [customerDocCount] = await db.query('SELECT COUNT(*) AS count FROM customer_documents');
  
      res.json({
        companyCount: companyCount[0].count,
        employeeCount: employeeCount[0].count,
        groupCount: groupCount[0].count,
        customerCount: customerCount[0].count,
        customerDocCount: customerDocCount[0].count,
      });
    } catch (err) {
      console.error('Error fetching counts:', err);
      res.status(500).send('Server Error');
    }
  });


// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
