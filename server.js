const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Simulate a database for this example (you can replace this with a real database like MongoDB)
const users = [
    { email: 'test@example.com', passwordHash: '$2b$10$EfjljD6pIl4wLlFxaD8Lwu5YQcb9aftrjrKhx3HXspFKhe.0LR51S' } // password is "password123"
];

const app = express();
app.use(bodyParser.urlencoded({ extended: true })); // for parsing form data
app.use(bodyParser.json());

const JWT_SECRET = 'your_secret_key_here'; // A secret key for signing JWT tokens

// Login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Find user by email
    const user = users.find(u => u.email === email);
    if (!user) {
        return res.status(400).send('User not found');
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
        return res.status(400).send('Incorrect password');
    }

    // Generate a JWT token
    const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});

// Serve the dashboard page (for simplicity)
app.get('/dashboard', (req, res) => {
    res.send('<h1>Welcome to your dashboard!</h1>');
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
// Middleware to verify the JWT token
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(403);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user; // Attach user info to request
        next();
    });
};

// Use the middleware on the dashboard route
app.get('/dashboard', authenticateToken, (req, res) => {
    res.send(`<h1>Welcome, ${req.user.email}, to your dashboard!</h1>`);
});






//register
// Connect to MongoDB (Replace <your_db_url> with your actual MongoDB connection string)
mongoose.connect('<your_db_url>', { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// User schema for MongoDB
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String
});

const User = mongoose.model('User', userSchema);

// Registration route
app.post('/register', async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
        return res.status(400).send('Passwords do not match');
    }

    // Check if the email is already taken
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).send('Email is already registered');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new user
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(200).send('Registration successful');
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});