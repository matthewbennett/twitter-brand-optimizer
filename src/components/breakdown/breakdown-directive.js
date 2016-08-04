/*global $:false */
'use strict';

function Breakdown() {
    return {
        restrict: 'EA',
        scope: {
            calculations: '='
        },
        controller: ['$scope', function($scope ) {
            $scope.$watch('calculations', function(newVal, oldVal) {
                if (newVal !== oldVal && newVal !== null) {
                    if ($scope.calculations.sentimentRating === -1) {
                        $scope.rating = 'Bad';
                    } else if ($scope.calculations.sentimentRating === 1) {
                        $scope.rating = 'Good';
                    } else {
                        $scope.rating = 'Neutral';
                    }
                }
            });
        }],
        templateUrl: 'breakdown/breakdown.tpl.html',
        link: function(scope, elem, attr) {
        }
    };
}


angular
    .module('directives.Breakdown', ['ngAnimate'])
    .directive('breakdown', Breakdown);