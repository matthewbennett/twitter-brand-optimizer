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

var UserSchema = new Schema({
	username: String,
	positiveTweets: [],
	negativeTweets: []
});

module.exports = mongoose.model('UserModel', UserSchema);
