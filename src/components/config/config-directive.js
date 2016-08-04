/*global $:false */
'use strict';

function Config() {
    return {
        restrict: 'EA',
        scope: {
            hashtags: '=',
            initStream: '&'
        },
        controller: ['$scope', function($scope ) {
            $scope.newHashtag = '';
            $scope.addHashtag = function() {
                $scope.hashtags.push($scope.newHashtag);
                $scope.newHashtag = '';
            };
        }],
        templateUrl: 'config/config.tpl.html',
        link: function(scope, elem, attr) {

        }
    };
}


angular
    .module('directives.Config', ['ngAnimate'])
    .directive('config', Config);