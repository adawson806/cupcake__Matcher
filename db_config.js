const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASSWORD || 'Education_3000', // safer with env var
  database: 'cupcakeMatcher'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    throw err;
  }
  console.log('Connected to MySQL Database: cupcakeMatcher');
});

module.exports = db;
