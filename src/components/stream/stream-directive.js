/*global $:false */
'use strict';

function Stream() {
    return {
        restrict: 'EA',
        scope: {
            positiveTweets: '=',
            negativeTweets: '='
        },
        controller: ['$scope', function($scope ) {
            $scope.getClass = function(score) {
                // Positives
                if (score >= 0 && score < 2) {
                    return 'stream-sentiment-pos0';
                } else if (score >= 2 && score < 6) {
                    return 'stream-sentiment-pos1';
                } else if (score >= 6 && score <= 10) {
                    return 'stream-sentiment-pos2';
                }
                // Negatives
                else if (score <= -1 && score > -2) {
                    return 'stream-sentiment-neg0';
                } else if (score <= -2 && score > -6) {
                    return 'stream-sentiment-neg1';
                } else if (score <= -6 && score >= -10) {
                    return 'stream-sentiment-neg2';
                }
            };
        }],
        templateUrl: 'stream/stream.tpl.html',
        link: function(scope, elem, attr) {

        }
    };
}


angular
    .module('directives.Stream', ['ngAnimate'])
    .directive('stream', Stream);