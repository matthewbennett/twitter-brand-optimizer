/*global $:false */
'use strict';

function Feed() {
    return {
        restrict: 'EA',
        scope: {
            retweetedTweets: '=',
            status: '=',
            postTweet: '&'
        },
        controller: ['$scope', function($scope ) {

        }],
        templateUrl: 'feed/feed.tpl.html',
        link: function(scope, elem, attr) {

        }
    };
}


angular
    .module('directives.Feed', ['ngAnimate'])
    .directive('feed', Feed);