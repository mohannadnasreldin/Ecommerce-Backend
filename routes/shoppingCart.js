const express = require('express');
const router = express.Router();
const shoppingCartController = require('../Controllers/shoppingCartController');
const pool = require('../db/dbconnection');

router.get('/', async (req, res) => {
  try {
    const cartItems = await shoppingCartController.getCartItems();
    if (cartItems.length === 0) {
      return res.status(200).json({ message: 'Cart is empty' });
    }
    res.json(cartItems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/cart/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const cartItem = await shoppingCartController.getCartItemById(id);
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    res.status(200).json(cartItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/cart
router.post('/', async (req, res) => {
  const { product_id, quantity } = req.body;
  const token = req.headers.token;

  if (!product_id || !quantity || !token) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const user_id = await getUserIdFromToken(token);

    const newCartItem = await shoppingCartController.addCartItem(product_id, quantity, user_id);
    res.status(201).json(newCartItem);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/cart/:id
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { product_id, quantity } = req.body;
  const token = req.headers.token;

  if (!product_id || !quantity || !token) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const user_id = await getUserIdFromToken(token);

    const updatedCartItem = await shoppingCartController.updateCartItem(id, product_id, quantity, user_id);
    res.status(200).json(updatedCartItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/cart/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const token = req.headers.token;

  if (!id || !token) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const user_id = await getUserIdFromToken(token);

    await shoppingCartController.deleteCartItem(id, user_id);
    res.status(200).json({ message: 'Cart item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

async function getUserIdFromToken(token) {
  const query = 'SELECT id FROM users WHERE token = ?';
  return new Promise((resolve, reject) => {
    pool.query(query, [token], (err, results) => {
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
module.exports = router;