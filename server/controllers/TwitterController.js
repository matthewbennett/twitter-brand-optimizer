/*jslint node: true */
'use strict';

/**
 * Module dependencies.
 */

// var mongoose = require('mongoose'),
// 	Article = require('../models/ArticleModel');

var Twit = require('twit'),
    _ = require('lodash-node'),
    sentiment = require('sentiment'),
    wordAnalysis = require('speakeasy-nlp').sentiment,
    twitBufferSize = 1,
    masterUser = 'admin',
    gramophone = require('gramophone'),
    async = require('async'),
    User = require('../models/UserModel'),
    Flickr = require('flickrapi'),
    filter = require('bad-words'),
    flickrOptions = {
        api_key: '15c665b504072d3f082eaea878c7205d',
        secret: '1d020b3b71695078'
    },
    twit = new Twit({
        consumer_key: 'VRrPue7PIo0gBlbF3S5Uydani',
        consumer_secret: 'EuLFGBdjEojaOkhqb9ygS1axnvJj8PhpenFEwjOy99lwKG8xHB',
        access_token: '2855494097-FFAAIPZbcWFfSaJ0t3opeHzcQMwbsBUiIURb4RM',
        access_token_secret: 'Zl1P1XVVPqLVjpoigK5smshVuZ3fTawKnfgS5Z3rTSh7o',
    });


var TwitterController = function() {
    // Checks if admin user exists
    User.findOne({
        username: 'admin'
    }, function(err, user) {
        if (err) console.log('Error: TwitterController constructor' + err);

        if (!user) {
            var newUser = new User({
                username: masterUser,
                positionTweets: [],
                negativeTweets: []
            });

            newUser.save(function(err) {
                console.log('New user created!');
            });
        }
    });
};

TwitterController.prototype.getStream = function(req, res) {
    var io = require('../app').io,
        hashtags = req.body.hashtags,
        isPositive,
        retweet = false,
        tweetsBuffer = [],
        stream = twit.stream('statuses/filter', {
            track: hashtags,
            language: 'en'
        });

    console.log('open stream and listening to ' + req.body);
    stream.on('connect', function(request) {
        console.log('Connected to Twitter');
    });

    stream.on('disconnect', function(message) {
        console.log('Disconnected from Twitter' + message);
    });

    stream.on('reconnect', function(request, response, connectInterval) {
        console.log('Trying to reconnect to Twitter API in ' + connectInterval + ' ms');
    });

    stream.on('tweet', function(inputTweet) {
        var tasks = {
            tweet: function(callback) {
                if (!inputTweet.text) return;

                var analysis = getSentiment(inputTweet.text);
                //assign tweet to positive or negative
                if (analysis.score < 0) {
                    isPositive = false;
                } else {
                    isPositive = true;
                }
                //compare against retweet threshold
                if (analysis.score >= 4) {
                    retweet = true;
                    autoRetweet(inputTweet); // Retweets
                }

                var tweet = {};
                tweet.isPositive = isPositive;
                tweet.retweet = retweet;
                tweet.score = analysis.score;
                tweet.text = inputTweet.text;
                tweet.timestamp = inputTweet.timestamp_ms;
                tweet.user = {
                    name: inputTweet.user.name,
                    handle: inputTweet.user.screen_name,
                    image: inputTweet.user.profile_image_url
                };

                tweetsBuffer.push(tweet);
                if (tweetsBuffer.length >= twitBufferSize) {
                    io.sockets.emit('tweets', tweetsBuffer);
                    tweetsBuffer = [];
                }

                retweet = false; // Sets back to false
                callback(null, tweet);
            },
            save: ['tweet',
                function(callback, results) {
                    var tweet = results.tweet,
                        param;

                    if (tweet.isPositive) {
                        param = 'positiveTweets';
                    } else {
                        param = 'negativeTweets';
                    }

                    var update = {};
                    update[param] = tweet;

                    User.findOneAndUpdate({
                        username: masterUser
                    }, {
                        $push: update
                    }, {
                        safe: true,
                        upsert: true
                    }, function(err, user) {
                        callback(err, user);
                    });
                }
            ]
        };

        async.auto(tasks, function(err, results) {
            if (err) {
                console.log('Error' + err);
            }
        });
    });

    if (stream) {
        res.send({
            message: 'Stream open and listening to: ' + hashtags
        });
    }
};

TwitterController.prototype.getSentimentCalculations = function(req, res) {
    var tasks = {
        positiveCount: function(callback) {
            User.find({}, 'positiveTweets', function(err, results) {
                if (!results[0]) {
                    return callback({
                        message: 'Nothing on the database right now'
                    });
                }
                var positiveTweets = results[0].positiveTweets,
                    positiveCount = positiveTweets.length;

                callback(null, positiveCount);
            });
        },
        negativeCount: function(callback) {
            User.find({}, 'negativeTweets', function(err, results) {
                if (!results[0]) {
                    return callback({
                        message: 'Nothing on the database right now'
                    });
                }
                var negativeTweets = results[0].negativeTweets,
                    negativeCount = negativeTweets.length;

                callback(null, negativeCount);
            });
        },
        calculations: ['positiveCount', 'negativeCount',
            function(callback, results) {
                var sentimentRating,
                    calculations = {
                        sentimentRating: null,
                        sentimentRatio: 0,
                        positiveCount: 0,
                        negativeCount: 0,
                        totalTweets: 0
                    },
                    positiveCount = results.positiveCount,
                    negativeCount = results.negativeCount,
                    totalTweets = positiveCount + negativeCount,
                    sentimentRatio = positiveCount / totalTweets;


                if (sentimentRatio >= 0.5) {
                    sentimentRating = 1; // Good
                } else if (sentimentRatio < 0.5 && sentimentRatio >= 0.4) {
                    sentimentRating = 0; // Neutral
                } else if (sentimentRatio < 0.4) {
                    sentimentRating = -1; // Bad
                }

                calculations.negativeCount = negativeCount;
                calculations.positiveCount = positiveCount;
                calculations.sentimentRating = sentimentRating;
                calculations.sentimentRatio = sentimentRatio;
                calculations.totalTweets = totalTweets;

                callback(null, calculations);
            }
        ]
    };

    async.auto(tasks, function(err, results) {
        if (err) console.log(err);
        res.send(results.calculations);
    });
};

TwitterController.prototype.postTweet = function(req, res) {
    var status = req.body.status;
    twit.post('statuses/update', { status: status }, function(err, data, response) {
        if (err) {
            console.log('There was an error in posting a tweet' + JSON.stringify(err));
            res.status(400).send(err);
        } else {
            res.send({
                username: data.user.name,
                text: data.text,
                image: data.user.profile_image_url
            });
        }
    });
};

TwitterController.prototype.getFrequent = function getFrequent(req, res) {
    var io = require('../app').io,
        positiveScoreThreshold = 0,
        negativeScoreThreshold = -1;

    var tasks = {
        positiveTweets: function(callback) {
            User.find({}, 'positiveTweets', function (err, results) {
                if (!results[0]) {
                    return callback({ message: 'Nothing on the database right now' });
                }
                var filteredTweets = [],
                    positiveTweets = results[0].positiveTweets;
                async.each(positiveTweets, function(tweet, cb) {
                    // Score threshold
                    if (tweet.score >= positiveScoreThreshold) {
                        filteredTweets.push(tweet);
                    }
                    cb();
                }, function() {
                    callback(null, filteredTweets);
                });
            });
        },
        negativeTweets: function(callback) {
            User.find({}, 'negativeTweets', function (err, results) {
                if (!results[0]) {
                    return callback({ message: 'Nothing on the database right now' });
                }
                var filteredTweets = [],
                    negativeTweets = results[0].negativeTweets;
                async.each(negativeTweets, function(tweet, cb) {
                    // Score threshold
                    if (tweet.score <= negativeScoreThreshold) {
                        filteredTweets.push(tweet);
                    }
                    cb();
                }, function() {
                    callback(null, filteredTweets);
                });
            });
        },
        positiveFrequent: ['positiveTweets', function(callback, results) {
            // TODO: Use gramaphone to extract out frequent words
            // Possible, use NLP & machine learning to provide context
            // allow user to exclude keywords
            var positiveFrequent = [];
            var texts = '';
            async.each(results.positiveTweets, function(tweet, cb) {
                texts += tweet.text;
                cb();
            }, function() {
                positiveFrequent = gramophone.extract(texts, {min: 3});
                async.each(positiveFrequent, function(word, cb){
                    if( isIrrelevant(word) ) {
                        positiveFrequent =  _.without(positiveFrequent, word);
                        cb();
                    }
                });
                if(positiveFrequent.length > 9) {
                    positiveFrequent = positiveFrequent.splice(0,8);
                }
                console.log(positiveFrequent);
                callback(null, positiveFrequent);
            });
        }],
        negativeFrequent: ['negativeTweets', function(callback, results) {
            // TODO: Use gramaphone to extract out frequent words
            // Possible, use NLP & machine learning to provide context
            // allow user to exclude keywords
            var negativeFrequent = [];
            var texts = '';
            async.each(results.negativeTweets, function(tweet, cb) {
                texts += tweet.text;
                cb();
            }, function() {
                negativeFrequent = gramophone.extract(texts, {min: 3});
                async.each(negativeFrequent, function(word, cb){
                    if( isIrrelevant(word) ) {
                        negativeFrequent =  _.without(negativeFrequent, word);
                        cb();
                    }
                });
                if(negativeFrequent.length > 9) {
                    negativeFrequent = negativeFrequent.splice(0,8);
                }
                console.log(negativeFrequent);
                callback(null, negativeFrequent);
            });
        }],
        images: ['negativeFrequent', 'positiveFrequent', function(callback, results) {
            Flickr.tokenOnly(flickrOptions, function(error, flickr) {
                if (error) {
                    return callback(error);
                }

                var tasks = {
                    positive: function(callback) {
                        var positive = [];
                        async.each(results.positiveFrequent, function(keyword, cb) {
                            flickr.photos.search({
                                text: keyword
                            }, function(err, result) {
                                if (err) {
                                    return callback(err);
                                }
                                try {
                                    var photo = result.photos.photo[0];
                                    console.log(photo);
                                    positive.push({
                                        keyword: filter.clean(keyword),
                                        imgUrl: 'http://farm' + photo.farm + '.static.flickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '.jpg'
                                    });
                                } catch (e) {
                                    console.log('Missing photo');
                                }
                                cb();
                            });
                        }, function(err) {
                            if (err) {
                                console.log('Error in Flickr search: ' + err);
                                callback(err);
                            } else {
                                callback(null, positive);
                            }
                        });
                    },
                    negative: function(callback) {
                        var negative = [];
                        async.each(results.negativeFrequent, function(keyword, cb) {
                            // http://farm{farm-id}.static.flickr.com/{server-id}/{id}_{secret}.jpg
                            flickr.photos.search({
                                text: keyword,
                                safe_search: 1,
                                content_type: 1,
                                sort: 'relevance'
                            }, function(err, result) {
                                if (err) {
                                    return callback(err);
                                }
                                try {
                                    var photo = result.photos.photo[0];
                                    negative.push({
                                        keyword: filter.clean(keyword),
                                        imgUrl: 'http://farm' + photo.farm + '.static.flickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '.jpg'
                                    });
                                } catch (e) {
                                    console.log('Missing photo');
                                }
                                cb();
                            });
                        }, function(err) {
                            if (err) {
                                console.log('Error in Flickr search: ' + err);
                                callback(err);
                            } else {
                                callback(null, negative);
                            }
                        });
                    }
                };

                async.auto(tasks, function(err, results) {
                    console.log('Results: ' + JSON.stringify(results));
                    callback(null, results);
                });
            });
        }]
    };

    async.auto(tasks, function(err, results) {
        if (err) console.log(err);
        res.send(results.images); // Sends images
    });
};

function autoRetweet(tweet) {
    twit.post('statuses/retweet/' + tweet.id_str, {}, function(err, data) {
        if (err) {
            console.log('Error' + err);
            //console.log(response);
        } else {
            console.log('Retweeted!');
        }
    });
}

function getSentiment(tweetText) {
    var analysis = sentiment(tweetText);
    var analysisTwo = wordAnalysis.analyze(tweetText);
    var sentimentAnalysis;
    sentimentAnalysis = {
        score: analysisTwo.score + analysis.score,
        keyWords: analysis.words.concat(analysisTwo.positive.words.concat(analysisTwo.negative.words))
    };
    return sentimentAnalysis;
}

function isIrrelevant(s) {
	if(s.indexOf(' ') >= 0) {
		return true;
	} else if (s.length < 3) {
		return true;
	} else {
		return false;
	}
  // return s.indexOf(' ') >= 0;
}

module.exports = new TwitterController();