/*global $:false */
'use strict';

function Tooltip() {
    return {
        restrict: 'EA',
        scope: {
            tooltipId: '=',
            info: '='
        },
        controller: ['$scope', function($scope, User) {
            $scope.next = function() {
                $scope.tooltipId++;
            };
        }],
        templateUrl: 'tooltip/tooltip.tpl.html',
        link: function(scope, elem, attr) {
            var tooltipInfo, tooltipCSS;

            scope.$watch('tooltipId', function(newVal, oldVal) {
                scope.tooltipContent = scope.info[scope.tooltipId];
                tooltipCSS = scope.tooltipContent.css;
                tooltipCSS.position = 'absolute';
                elem.css(tooltipCSS);
            });
        }
    };
}


angular
    .module('directives.Tooltip', ['ngAnimate'])
    .directive('tooltip', Tooltip);