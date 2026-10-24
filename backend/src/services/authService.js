const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { generateToken } = require('../utils/jwt');

async function register({ name, email, password, university, department }) {
  const normalizedEmail = email.trim().toLowerCase();

  // Check if email already registered
  const [existing] = await pool.execute(
    'SELECT id FROM users WHERE email = ?',
    [normalizedEmail]
  );

  if (existing.length > 0) {
    const error = new Error('An account with this email address already exists');
    error.statusCode = 409;
    throw error;
  }

  // Hash password
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Insert user
  const [result] = await pool.execute(
    `INSERT INTO users (name, email, password_hash, university, department)
     VALUES (?, ?, ?, ?, ?)`,
    [name.trim(), normalizedEmail, passwordHash, university.trim(), department.trim()]
  );

  const userId = result.insertId;

  // Record initial login timestamp
  await pool.execute('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', [userId]);
  console.log(`[AUTH] New user registered: ${normalizedEmail} (ID: ${userId}, University: ${university.trim()})`);

  const user = {
    id: userId,
    name: name.trim(),
    email: normalizedEmail,
    university: university.trim(),
    department: department.trim(),
  };

  const token = generateToken({ id: user.id, email: user.email });

  return { user, token };
}

async function login({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const [rows] = await pool.execute(
    `SELECT id, name, email, password_hash, university, department, bio, github_url, portfolio_url
     FROM users WHERE email = ?`,
    [normalizedEmail]
  );

  if (rows.length === 0) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const userRecord = rows[0];
  const isMatch = await bcrypt.compare(password, userRecord.password_hash);

  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Update last login timestamp and log authentication event
  await pool.execute('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', [userRecord.id]);
  console.log(`[AUTH] User logged in: ${userRecord.email} (ID: ${userRecord.id}) at ${new Date().toISOString()}`);

  const user = {
    id: userRecord.id,
    name: userRecord.name,
    email: userRecord.email,
    university: userRecord.university,
    department: userRecord.department,
    bio: userRecord.bio,
    github_url: userRecord.github_url,
    portfolio_url: userRecord.portfolio_url,
    last_login_at: new Date().toISOString(),
  };

  const token = generateToken({ id: user.id, email: user.email });

  return { user, token };
}

async function getCurrentUser(userId) {
  const [rows] = await pool.execute(
    `SELECT id, name, email, university, department, bio, github_url, portfolio_url, last_login_at, created_at
     FROM users WHERE id = ?`,
    [userId]
  );

  if (rows.length === 0) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return rows[0];
}

module.exports = {
  register,
  login,
  getCurrentUser,
};

