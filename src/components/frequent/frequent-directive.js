/*global $:false */
'use strict';

function Frequent() {
    return {
        restrict: 'E',
        scope: {
            frequent: '='
        },
        controller: ['$scope', function($scope ) {

        }],
        templateUrl: 'frequent/frequent.tpl.html',
        link: function(scope, elem, attr) {

        }
    };
}


angular
    .module('directives.Frequent', ['ngAnimate'])
    .directive('frequent', Frequent);