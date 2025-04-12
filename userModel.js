const db = require('../db'); // Create a db.js file to manage your database connection

const User = {
    create: (user, callback) => {
        db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [user.name, user.email, user.password], callback);
    },
    findByEmail: (email, callback) => {
        db.query('SELECT * FROM users WHERE email = ?', [email], callback);
    },
    findById: (id, callback) => {
        db.query('SELECT * FROM users WHERE id = ?', [id], callback);
    }
};

module.exports = User;