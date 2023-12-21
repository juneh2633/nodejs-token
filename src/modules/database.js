const mysql = require("mysql");
const db = mysql.createConnection({
    host: "localhost",
    user: 'juneh',
    password: '2633',
    database: 'nodejs_study'
});
db.connect(err => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to database.');
});

module.exports = db;