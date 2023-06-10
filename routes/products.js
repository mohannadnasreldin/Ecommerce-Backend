const express = require('express');
const router = express.Router();
const productController = require('../Controllers/productController');
const { body, validationResult } = require('express-validator');
const upload = require('../middleware/upload_images');
const authorized = require('../middleware/authorize');
const admin = require('../middleware/admin');

// CREATE product [ADMIN]
router.post(
  '',
  admin,
  upload.single('image'),
  [
    body('name')
      .isString()
      .withMessage('Please enter a valid product name')
      .isLength({ min: 10 })
      .withMessage('Product name should be at least 10 characters'),

    body('description')
      .isString()
      .withMessage('Please enter a valid description')
      .isLength({ min: 20 })
      .withMessage('Description should be at least 20 characters'),
  ],
  productController.createProduct
);

// UPDATE product [ADMIN]
router.patch(
  '/:id',
  admin,
  upload.single('image'),
  [
    body('name')
      .isString()
      .withMessage('Please enter a valid product name')
      .isLength({ min: 10 })
      .withMessage('Product name should be at least 10 characters'),

    body('description')
      .isString()
      .withMessage('Please enter a valid description')
      .isLength({ min: 20 })
      .withMessage('Description should be at least 20 characters'),
  ],
  productController.updateProduct
);

// DELETE product [ADMIN]
router.delete('/:id', admin, productController.deleteProduct);

// LIST & SEARCH [ADMIN, USER]
router.get('/', productController.getProducts);

// SHOW product [ADMIN, USER]
router.get('/:id', productController.getProduct);

// MAKE REVIEW [ADMIN, USER]
router.post(
  '/review',
  authorized,
  [
    body('product_id')
      .isNumeric()
      .withMessage('Please enter a valid product ID'),

    body('review')
      .isString()
      .withMessage('Please enter a valid review'),
  ],
  productController.addReview
);

module.exports = router;
