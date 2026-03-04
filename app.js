const http = require('http');
const mysql = require('mysql2');

function connectWithRetry() {
  const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQL_DATABASE
  });

  db.connect((err) => {
    if (err) {
      console.log('DB not ready, retrying in 3 seconds...');
      setTimeout(connectWithRetry, 3000);
      return;
    }

    console.log('Connected to MySQL!');

    db.query('CREATE TABLE IF NOT EXISTS messages (id INT AUTO_INCREMENT PRIMARY KEY, text VARCHAR(255))', () => {
      db.query("INSERT INTO messages (text) VALUES ('Hello from .env!')", () => {});
    });

    const server = http.createServer((req, res) => {
      db.query('SELECT * FROM messages', (err, results) => {
        res.writeHead(200, {'Content-Type': 'text/html'});
        if (err) return res.end('<h1>DB Error: ' + err.message + '</h1>');
        const rows = results.map(r => '<li>' + r.text + '</li>').join('');
        res.end('<h1>Messages from MySQL:</h1><ul>' + rows + '</ul>');
      });
    });

    server.listen(3000, () => console.log('Server running on port 3000'));
  });
}

connectWithRetry();
