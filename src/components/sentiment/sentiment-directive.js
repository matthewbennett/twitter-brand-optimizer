/*global $:false */
'use strict';

function Sentiment() {
    return {
        restrict: 'EA',
        scope: {
            calculations: '='
        },
        controller: ['$scope', function($scope ) {
            $scope.$watch('calculations', function(newVal, oldVal) {
                if (newVal !== oldVal && newVal !== null) {
                    $scope.doughnutCalculations = [
                        { value: $scope.calculations.positiveCount, color: '#66CCCC' },
                        { value: $scope.calculations.negativeCount, color : '#E2E5E8' }
                    ];
                }
            });
        }],
        templateUrl: 'sentiment/sentiment.tpl.html',
        link: function(scope, elem, attr) {
        }
    };
}


angular
    .module('directives.Sentiment', ['ngAnimate'])
    .directive('sentiment', Sentiment);