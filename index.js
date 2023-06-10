// ====================== INITIALIZE EXPRESS APP ======================
const express = require('express');
const session = require('express-session');
const app = express();

// ====================== GLOBAL MIDDLEWARE ======================
app.use(express.json());
async function getUserIdFromToken(token) {
  const query = 'SELECT id FROM users WHERE token = ?';
  return new Promise((resolve, reject) => {
    conn.query(query, [token], (err, results) => {
      if (err) {
        reject(err);
      } else {
        if (results.length === 0) {
          reject(new Error('Invalid token'));
        } else {
          resolve(results[0].id);
        }
      }
    });
  });
}
app.use(
  session({
    secret: getUserIdFromToken,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true if using HTTPS
      maxAge: 3600000, // Session expiration time in milliseconds
    },
  })
);

app.use(express.urlencoded({ extended: true })); //TO ACCESS URL FORM ENCODED
app.use(express.static('upload')); //TO ACCESS STATIC FILES
const cors = require('cors');
app.use(cors()); //ALLOW HTTP REQUESTS LOCALHOSTS

// ====================== REQUIRED MODULE ======================
const auth = require('./routes/auth');
const products = require('./routes/products');
const shoppingCart = require('./routes/shoppingCart');
const order = require('./routes/order');

// ====================== RUN APP ======================
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

// ====================== API ROUTES [ENDPOINTS] ======================
app.use('/auth', auth);
app.use('/products', products);
app.use('/cart', shoppingCart);
app.use('/order', order);