/**
 * IMPORTANT DO NOT COMMIT || IMPORTANT DO NOT COMMIT
 *
 * Do not commit this to git - this is only here
 * as an example
 *
 * Add this to .gitignore and git rm -rf config/secrets.js
 *
 * Store your API keys here
 */

var config = {
	'development': {
		port: process.env.PORT || 3000,
		mongoDB: process.env.MONGODB || 'mongodb://localhost:27017/usetwitter'

	},
	'production': {
		port: 80,
		mongoDB: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://localhost/usetwitter'

	},
};

exports.config = function() {
	var node_env = process.env.NODE_ENV || 'development';
	return config[node_env];
};