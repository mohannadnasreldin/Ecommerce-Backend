const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const authController = require('../Controllers/authController');

// LOGIN
router.post(
  '/login',
  body('email').isEmail().withMessage('Please enter a valid email!'),
  body('password')
    .isLength({ min: 8, max: 12 })
    .withMessage('Password should be between 8 and 12 characters.'),
  authController.loginUser
);

// REGISTER
router.post(
  '/register',
  body('email').isEmail().withMessage('Please enter a valid email!'),
  body('username')
    .isString()
    .withMessage('Please enter a valid username.')
    .isLength({ min: 4, max: 15 })
    .withMessage('Username must be 4 to 15 characters long.'),
  body('password')
    .isLength({ min: 8, max: 12 })
    .withMessage('Password must be 8 to 12 characters long.'),
  authController.registerUser
);
//LOGOUT
router.post('/logout', authController.logoutUser);

module.exports = router;
