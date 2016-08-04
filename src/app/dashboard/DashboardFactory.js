/*global angular:false */
'use strict';

function DashboardFactory($q, $timeout, API) {
	var self = this,
		exports = {};

	exports.twitter = {
		positiveTweets: [],
		negativeTweets: [],
		retweetedTweets: [],
		frequent: [],
		hashtags: ['#apple', '#stevejobs', '#timcook'],
		sentimentCalculations: {},
		status: ''
	};

	/* Contains all configs */
	exports.config = {
		tooltip: {
			id: 0,
			info: [{
				css: {
					left: '30px',
					top: '169px'
				},
				title: 'This is your stream!',
				message: 'The stream uses natural language processing to split tweets based on sentiment',
				next: 'Next'
			},
			{
				css: {
					left: '480px',
					top: '235px'
				},
				title: 'Boom! Checkout your retweets!',
				message: 'The tweets with the most positive sentiment will automatically be tweeted out!',
				next: 'Next'
			},
			{
				css: {
					left: '900px',
					top: '480px'
				},
				title: 'Woah! That\'s alot of sentiment!',
				message: 'This meter keeps track of how happy people are talking about your hashtag',
				next: 'Next'
			},
			{
				css: {
					left: '1370px',
					top: '300px'
				},
				title: 'Frequent keywords!',
				message: 'Keep track of what keywords people are using with your hashtag',
				next: 'Done!'
			}]
		}
	};


	/* Gets Twitter stream */
	exports.initStream = function() {
		console.log('initStream called with: ' + JSON.stringify(exports.twitter.hashtags));
		API.twitter.getStream({ hashtags: exports.twitter.hashtags }, function(result, err) {
			if (result) {
				getStream();
				getSentimentHelper();
				getSentimentCalculations();
				getFrequent();
			}
		});
	};

	exports.postTweet = function() {
		API.twitter.postTweet({ status: exports.twitter.status }, function(results) {
			var tweet = {
				text: results.text,
				user: {
					name: 'You',
					image: results.image
				}
			};
			exports.twitter.status = '';
			exports.twitter.retweetedTweets.unshift(tweet);
		});
	};

	function getStream() {
		API.socketOn('tweets', function(data) {
			console.log('Getting stream!');
			var tweet = data[0];

			if (tweet.isPositive) {
				exports.twitter.positiveTweets.unshift(tweet);
			} else {
				exports.twitter.negativeTweets.unshift(tweet);
			}

			if (tweet.retweet) {
				exports.twitter.retweetedTweets.unshift(tweet);
			}
		});
	}

	function getSentimentCalculations() {
		API.socketOn('tweets', function(data) {
			getSentimentHelper();
		});
	}

	function getSentimentHelper() {
		API.twitter.getSentimentCalculations({}, function(data) {
			console.log('Getting calculations');
			exports.twitter.sentimentCalculations = data;
			exports.twitter.sentimentCalculations.cleanSentimentRatio = Math.floor(exports.twitter.sentimentCalculations.sentimentRatio * 100);
		});
	}

	function getFrequent() {
		console.log('Frequent called!');
		API.twitter.getFrequent({}, function(data) {
			exports.twitter.frequent = [data][0];
			$timeout(getFrequent, 10000);
		});
	}

	return exports;
}

angular
    .module('services.DashboardFactory', ['services.API'])
    .factory('DashboardFactory', ['$q', '$timeout', 'API', DashboardFactory]);



