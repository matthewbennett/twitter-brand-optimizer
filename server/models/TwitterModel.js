/*jslint node: true */
'use strict';

/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Base Schema
 */

var TwitterSchema = new Schema({
	author: String,
	title: String,
	body: String
});

module.exports = mongoose.model('TwitterModel', TwitterSchema);
