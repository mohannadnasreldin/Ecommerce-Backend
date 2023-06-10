const router = require('express').Router();
const orderController = require('../Controllers/ordercontroller');
const admin = require('../middleware/admin');

router.patch('/:id', admin,async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const token = req.headers.token;

  if (!status || !token) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const user_id = await getUserIdFromToken(token);

    const updatedOrder = await orderController.updateOrderById(id, { status });
    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

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
router.get('/', admin, orderController.getOrders);
router.post('/', orderController.createOrder);
module.exports = router;