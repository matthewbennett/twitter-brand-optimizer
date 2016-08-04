/*jslint node: true */
'use strict';

/**
 * Dependencies
 */

var bodyParser = require('body-parser'),
    express = require('express'),
    mongoose = require('mongoose'),
    config = require('./config/secrets').config(),
    errorHandler = require('errorhandler'),
    path = require('path');

var app = express();

/**
 * Express configuration
 */
app.set('port', config.port);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/**
 * Start server
 */
var io =  require('socket.io').listen(app.listen(app.get('port'), function() {
        console.log('Express listening to port', app.get('port'));
    }));

exports.io = io;

/**
 * Secrets and API keys
 */
var secrets = require('./config/secrets');

/**
 * Establishes MongoDB connection
 */
var db = mongoose.connect(config.mongoDB, function(err) {
    if (err) { console.error('Could not establish connection with MongoDB' + err); }
});

exports.db = db;

/**
 * Controllers
 */
var ArticleController = require('./controllers/ArticleController'),
    TwitterController = require('./controllers/TwitterController');

/**
 * Development Settings
 */
if ('development' === app.get('env')) {
    app.use(express.static(path.join(__dirname, '../client/dist')));
    app.use(express.static(path.join(__dirname, '../user'))); // Exposes upload folder - refactor nameing
    app.use(errorHandler()); // Dev only
}

/**
 * Production Settings
 */
if ('production' === app.get('env')) {
    app.use(express.static(path.join(__dirname, '../client/dist')));
    app.use(express.static(path.join(__dirname, '../user'))); // Exposes upload folder - refactor nameing
}

/**
 * API routes
 */
app.get('/api/article-create', ArticleController.create);
app.get('/api/article-read', ArticleController.read);
app.post('/api/twitter-stream', TwitterController.getStream);
app.post('/api/sentiment-calculations', TwitterController.getSentimentCalculations);
app.post('/api/post-tweet', TwitterController.postTweet);
app.post('/api/frequent', TwitterController.getFrequent);


app.all('*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    next();
});







