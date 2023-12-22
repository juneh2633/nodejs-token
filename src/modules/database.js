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
function queryPromise(sql, params){
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

module.exports = db;
module.exports.queryPromise = queryPromise;