const pool = require('../db/dbconnection');

const getCartItems = () => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM cartitems';
    pool.query(query, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

const getCartItemById = (user_id) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM cartitems WHERE user_id = ?';
    pool.query(query, [user_id], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? results[0] : null);
      }
    });
  });
};

const addCartItem = (product_id, quantity, user_id) => {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO cartitems (product_id, quantity, user_id) VALUES (?, ?, ?)';
    pool.query(query, [product_id, quantity, user_id], (err, results) => {
      if (err) {
        reject(err);
      } else {
        const newCartItem = { id: results.insertId, product_id, quantity, user_id };
        resolve(newCartItem);
      }
    });
  });
};

const updateCartItem = (id, product_id, quantity, user_id) => {
  return new Promise((resolve, reject) => {
    const query = 'UPDATE cartitems SET product_id = ?, quantity = ? WHERE id = ? AND user_id = ?';
    pool.query(query, [product_id, quantity, id, user_id], (err, results) => {
      if (err) {
        reject(err);
      } else {
        if (results.affectedRows === 0) {
          reject(new Error('Cart item not found'));
        } else {
          const updatedCartItem = { id, product_id, quantity, user_id };
          resolve(updatedCartItem);
        }
      }
    });
  });
};

const deleteCartItem = (id, user_id) => {
  return new Promise((resolve, reject) => {
    const query = 'DELETE FROM cartitems WHERE id = ? AND user_id = ?';
    pool.query(query, [id, user_id], (err, results) => {
      if (err) {
        reject(err);
      } else {
        if (results.affectedRows === 0) {
          reject(new Error('Cart item not found'));
        } else {
          resolve({ id });
        }
      }
    });
  });
};

module.exports = {
  getCartItems,
  getCartItemById,
  addCartItem,
  updateCartItem,
  deleteCartItem,
};
