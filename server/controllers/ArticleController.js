/*jslint node: true */
'use strict';

/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
	Article = require('../models/ArticleModel');

var ArticleController = function() {};

ArticleController.prototype.create = function(req, res) {

	var article = new Article(req.body);

	article.save(function(err) {
		if (err) {
			res.status(400).send('Error creating article');
		} else {
			res.send('Article created');
		}
	});

};

ArticleController.prototype.read = function(req, res) {

	Article.find({}, function(err, data) {
		if (err || !data) {
			res.status(400).send('Error: ' + err);
		} else {
			res.send(data);
		}
	});
};

module.exports = new ArticleController();


