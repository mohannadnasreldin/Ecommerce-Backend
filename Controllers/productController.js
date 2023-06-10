const util = require('util');
const fs = require('fs');
const connection = require('../db/dbconnection');
const { body, validationResult } = require('express-validator');

const getProductById = async (productId) => {
  const query = util.promisify(connection.query).bind(connection);
  const product = await query('SELECT * FROM products WHERE id = ?', [productId]);
  return product[0];
};

const createProduct = async (req, res) => {
  try {
    // 1- VALIDATE REQUEST [manual, express validation]
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // 2- VALIDATE THE IMAGE
    if (!req.file) {
      return res.status(400).json({
        errors: [
          {
            msg: 'Image is required',
          },
        ],
      });
    }

    // 3- PREPARE product OBJECT
    const product = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      image: req.file.filename,
    };

    // 4 - INSERT product INTO DB
    const query = util.promisify(connection.query).bind(connection);
    await query('INSERT INTO products SET ?', product);
    res.status(200).json({
      msg: 'Product created successfully!',
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

const updateProduct = async (req, res) => {
  try {
    // 1- VALIDATE REQUEST [manual, express validation]
    const query = util.promisify(connection.query).bind(connection);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
 // 2- VALIDATE THE IMAGE
 if (!req.file) {
  return res.status(400).json({
    errors: [
      {
        msg: 'Image is required',
      },
    ],
  });
}
    // 3- CHECK IF product EXISTS OR NOT
    const product = await getProductById(req.params.id);
    if (!product) {
      res.status(404).json({ msg: 'Product not found!' });
    }

    // 3- PREPARE product OBJECT
    const productObj = {
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      image: req.file.filename,

    };

    if (req.file) {
      productObj.image = req.file.filename;
      fs.unlinkSync('./upload/' + product.image); // delete old image
    }

    // 4- UPDATE product
    await query('UPDATE products SET ? WHERE id = ?', [productObj, product.id]);

    res.status(200).json({
      msg: 'Product updated successfully',
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

const deleteProduct = async (req, res) => {
  try {
    // 1- CHECK IF product EXISTS OR NOT
    const query = util.promisify(connection.query).bind(connection);
    const product = await getProductById(req.params.id);
    if (!product) {
      res.status(404).json({ msg: 'Product not found!' });
    }

    // 2- REMOVE product IMAGE
    fs.unlinkSync('./upload/' + product.image); // delete old image
    await query('DELETE FROM products WHERE id = ?', [product.id]);
    res.status(200).json({
      msg: 'Product deleted successfully',
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

const getProducts = async (req, res) => {
  try {
    const query = util.promisify(connection.query).bind(connection);
    let search = '';
    if (req.query.search) {
      // QUERY PARAMS
      search = `where name LIKE '%${req.query.search}%' or description LIKE '%${req.query.search}%'`;
    }
    const products = await query(`SELECT * FROM products ${search}`);
    products.map((product) => {
      product.image_url = 'http://' + req.hostname + ':3000/' + product.image;
    });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json(err);
  }
};

const getProduct = async (req, res) => {
  try {
  const query = util.promisify(connection.query).bind(connection);
  const product = await getProductById(req.params.id);
  if (!product) {
  res.status(404).json({ msg: 'Product not found!' });
  }

  product.image_url = 'http://' + req.hostname + ':3000/' + product.image;
  product.reviews = await query('SELECT * FROM reviews WHERE product_id = ?', product.id);
  res.status(200).json(product);
  } catch (err) {
  res.status(500).json(err);
  }
  };
      
      const getReview = async (req, res) => {
      try {
      const query = util.promisify(connection.query).bind(connection);
      const product = await getProductById(req.params.id);
      if (!product) {
      res.status(404).json({ msg: 'Product not found!' });
      }
      product.name = await query('SELECT name FROM products WHERE product_id = ?', product.id);
      product.image_url = 'http://' + req.hostname + ':3000/' + product.image;
      product.reviews = await query('SELECT * FROM reviews WHERE product_id = ?', product.id);
      res.status(200).json(product);
      } catch (err) {
      res.status(500).json(err);
      }
      };
      
      const addReview = async (req, res) => {
      try {
      const query = util.promisify(connection.query).bind(connection);
      // 1- VALIDATE REQUEST [manual, express validation]
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
      }
      
      // 2- CHECK IF product EXISTS OR NOT
      const product = await getProductById(req.body.product_id);
      if (!product) {
        res.status(404).json({ msg: 'Product not found!' });
      }
      
      // 3 - PREPARE product REVIEW OBJECT
      const reviewObj = {
        user_id: res.locals.user.id,
        product_id: req.body.product_id,
        review: req.body.review,
      };
      
      // 4- INSERT product OBJECT INTO DATABASE
      await query('INSERT INTO reviews SET ?', reviewObj);
      
      res.status(200).json({
        msg: 'Review added successfully!',
      });
      } catch (err) {
      res.status(500).json(err);
      }
      };
      
      module.exports = {
      createProduct,
      updateProduct,
      deleteProduct,
      getProducts,
      getProduct,
      addReview,
      getReview,
      };
