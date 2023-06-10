const bcrypt = require('bcrypt');
const crypto = require('crypto');
const conn = require('../db/dbconnection');
const util = require('util');
const { body , validationResult} = require('express-validator');
async function loginUser(req, res) {
  try {
    // 1- VALIDATE REQUEST [manual, express validation]
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // 2- CHECK IF EMAIL EXISTS
    const query = util.promisify(conn.query).bind(conn);
    const user = await query('SELECT * FROM users WHERE email = ?', [req.body.email]);
    if (user.length === 0) {
      res.status(404).json({
        errors: [
          {
            msg: 'Email or password not found!',
          },
        ],
      });
    }

    // 3- COMPARE HASHED PASSWORD
    const checkPassword = await bcrypt.compare(req.body.password, user[0].password);
    if (checkPassword) {
      delete user[0].password;
      res.status(200).json(user[0]);
    } else {
      res.status(404).json({
        errors: [
          {
            msg: 'Email or password not found!',
          },
        ],
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: err });
  }
}

async function registerUser(req, res) {
  try {
    // Validation request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // 2- CHECK IF EMAIL EXISTS
    const query = util.promisify(conn.query).bind(conn);
    const checkEmailExists = await query('SELECT * FROM users WHERE email = ?', [req.body.email]);
    if (checkEmailExists.length > 0) {
      res.status(400).json({
        errors: [
          {
            msg: 'Email already exists!',
          },
        ],
      });
    }

    // 3- PREPARE USER OBJECT TO SAVE
    const userData = {
      username: req.body.username,
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, 10),
      token: crypto.randomBytes(16).toString('hex'),
    };

    // 4- INSERT USER OBJECT INTO DB
    await query('INSERT INTO users SET ?', userData);
    delete userData.password;
    res.status(200).json(userData);
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: err });
  }
}
async function logoutUser(req, res) {
  try {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({ error: 'An error occurred while logging out.' });
      } else {
        res.status(200).json({ message: 'Logout successful.' });
      }
    });
    } catch (err) {
    res.status(500).json({ error: 'An error occurred while logging out.' });
  }
}
module.exports = {
  loginUser,
  registerUser,
  logoutUser,
};
