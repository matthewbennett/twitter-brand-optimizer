'use strict';

function API($rootScope, $resource) {
    var streamEndpoint = 'api/:dest';
    return {
        socketOn: function(eventName, callback) {
            var socket = io.connect('/');
            socket.on(eventName, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    callback.apply(socket, args);
                });
            });
        },
        twitter: $resource(streamEndpoint, null, {
            getStream: {
                method: 'POST',
                params: {
                    dest: 'twitter-stream'
                }
            },
            getSentimentCalculations: {
                method: 'POST',
                params: {
                    dest: 'sentiment-calculations'
                }
            },
            postTweet: {
                method: 'POST',
                params: {
                    dest: 'post-tweet'
                }
            },
            getFrequent: {
                method: 'POST',
                params: {
                    dest: 'frequent'
                }
            }
        })
    };

}

angular
    .module('services.API', [])
    .factory('API', ['$rootScope', '$resource', API]);
