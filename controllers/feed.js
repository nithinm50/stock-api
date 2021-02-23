const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator/check');

const Post = require('../models/stock');
const User = require('../models/user');
var yahooFinance = require('yahoo-finance');

exports.getPosts = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;
  Post.find()
    .countDocuments()
    .then(count => {
      totalItems = count;
      return Post.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then(posts => {
      res.status(200).json({
        message: 'Fetched stocks successfully.',
        posts: posts,
        totalItems: totalItems
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  
  const name = req.body.name;
  const symbol = req.body.symbol;
  let creator;
  const post = new Post({
    name: name,
    symbol: symbol
  });
  post
    .save()
    .then(result => {
      return User.findById(req.userId);
    })
    .then(user => {
      creator = user;
      user.posts.push(post);
      return user.save();
    })
    .then(result => {
      res.status(201).json({
        message: 'Post created successfully!',
        post: post,
        creator: { _id: creator._id, name: creator.name }
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Could not find stock.');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: 'Stock fetched.', post: post });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updatePost = (req, res, next) => {
  const postId = req.params.postId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  const name = req.body.name;
  const symbol = req.body.symbol;
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Could not find stock.');
        error.statusCode = 404;
        throw error;
      }
      if (post.creator.toString() !== req.userId) {
        const error = new Error('Not authorized!');
        error.statusCode = 403;
        throw error;
      }
      post.name = name;
      post.symbol = symbol;
      return post.save();
    })
    .then(result => {
      res.status(200).json({ message: 'stock updated!', post: result });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Could not find stock.');
        error.statusCode = 404;
        throw error;
      }
      if (post.creator.toString() !== req.userId) {
        const error = new Error('Not authorized!');
        error.statusCode = 403;
        throw error;
      }
      return Post.findByIdAndRemove(postId);
    })
    .then(result => {
      return User.findById(req.userId);
    })
    .then(user => {
      user.posts.pull(postId);
      return user.save();
    })
    .then(result => {
      res.status(200).json({ message: 'Deleted stock.' });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getStock = (req, res, next) => {
  const stockSyml = req.params.stockSyml;
  yahooFinance.quote({
    symbol: stockSyml,
    modules: ['price', 'summaryDetail', 'financialData']
  }, function(err, quote) {
    if(!err){
      return quote;
    }
    const error = new Error(`Could not find stock with symbol ${stockSyml}`);
    error.statusCode = 404;
    throw error;
  })
  .then(result =>{
    res.status(200).json({ message: 'Stock fetched.', stock: result });
  })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getCurrentStockPrice = (req, res, next) => {
  const stockSyml = req.params.stockSyml;
  yahooFinance.quote({
    symbol: stockSyml,
    modules: ['summaryDetail']
  }, function(err, quote) {
    if(!err){
      return quote;
    }
    const error = new Error(`Could not find stock with symbol ${stockSyml}`);
    error.statusCode = 404;
    throw error;
  })
  .then(result =>{
    res.status(200).json({ message: 'Stock fetched.', stock: result });
  })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};