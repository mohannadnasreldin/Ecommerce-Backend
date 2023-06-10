const util = require('util');
const connection = require('../db/dbconnection');
const { body, validationResult } = require('express-validator');

const shoppingCartController = require('../controllers/shoppingCartController');

const createOrder = async (req, res) => {
  try {
    const { token } = req.headers;
    const userId = await getUserIdFromToken(token);
    const cartItems = await shoppingCartController.getCartItemsByUserId(userId);
    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Shopping cart is empty.' });
    }
    const orderData = {
      userID: userId,
      info: cartItems,
      total_price: getTotalPrice(cartItems),
    };
    const orderId = await insertOrder(orderData);
    await shoppingCartController.deleteCartItemById(userId);
    res.status(200).json({
      message: 'Order placed successfully.',
orderData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

async function getUserIdFromToken(token) {
  const query = 'SELECT id FROM users WHERE token = ?';
  const rows = await queryDB(query, [token]);
  if (rows.length === 0) {
    throw new Error('Invalid token');
  }
  return rows[0].id;
}

function getTotalPrice(cartItems) {
  let totalPrice = 0;
  for (let i = 0; i < cartItems.length; i++) {
    totalPrice += cartItems[i].price * cartItems[i].quantity;
  }
  return totalPrice;
}

async function insertOrder(orderData) {
  const query = 'INSERT INTO orders SET ?';
  const result = await queryDB(query, orderData);
  return result.insertId;
}

async function updateOrderById(req, res) {
  try {
    // 1- VALIDATE REQUEST [manual, express validation]
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // 2- CHECK IF order EXISTS OR NOT
    const order = await getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found!' });
    }

    // 3- PREPARE order OBJECT
    const orderObj = {
      info: req.body.info,
      status: req.body.status,
    };

    // 4- UPDATE order
    await updateOrder(order.id, orderObj);

    res.status(200).json({
      msg: 'Order updated successfully',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
}

async function getOrderById(orderId) {
  const query = 'SELECT * FROM orders WHERE id = ?';
  const rows = await queryDB(query, [orderId]);
  if (rows.length === 0) {
    return null;
  }
  return rows[0];
}

async function updateOrder(orderId, orderObj) {
  const query = 'UPDATE orders SET ? WHERE id = ?';
  await queryDB(query, [orderObj, orderId]);
}

async function getOrders(req, res) {
  try {
    const orders = await selectAllOrders();
    res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
}

async function selectAllOrders() {
  const query = 'SELECT * FROM orders';
  return await queryDB(query);
}

async function queryDB(query, params = []) {
  return new Promise((resolve, reject) => {
    connection.query(query, params, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

module.exports = {
  createOrder,
  updateOrderById,
  getOrders,
};