const express = require('express');
const { body } = require('express-validator/check');

const feedController = require('../controllers/feed');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// GET /feed/stocks
router.get('/stocks', isAuth, feedController.getPosts);

// POST /feed/stock
router.post(
  '/stock',
  isAuth,
  [
    body('name')
      .trim()
      .isLength({ min: 5 }),
    body('symbol')
      .trim()
      .isLength({ min: 4 })
  ],
  feedController.createPost
);

// GET /feed/stock/post id
router.get('/stock/:postId', isAuth, feedController.getPost);

// PUT /feed/stock/post id
router.put(
  '/stock/:postId',
  isAuth,
  [
    body('title')
      .trim()
      .isLength({ min: 5 }),
    body('symbol')
      .trim()
      .isLength({ min: 5 })
  ],
  feedController.updatePost
);

// DELETE /feed/stock/post id
router.delete('/stock/:postId', isAuth, feedController.deletePost);

// GET /feed/stockingo/AAPL
router.get('/stockinfo/:stockSyl', isAuth, feedController.getStock);

// GET /feed/stockprice/AAPL    //get updated stock price
router.get('/stockprice/:stockSyl', isAuth, feedController.getCurrentStockPrice);

module.exports = router
