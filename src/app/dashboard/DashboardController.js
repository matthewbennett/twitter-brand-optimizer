/*global angular:false */
'use strict';

function DashboardController ($scope, API, DashboardFactory) {
	$scope.twitter = DashboardFactory.twitter;
    $scope.config = DashboardFactory.config;
    $scope.initStream = DashboardFactory.initStream;
    $scope.postTweet = DashboardFactory.postTweet;

    DashboardFactory
        .initStream();
}

angular
    .module('app.dashboard', [
        // Libs
        'angular.directives-chartjs-doughnut',
        // Components
        'services.API',
        'services.DashboardFactory',
        'directives.Breakdown',
        'directives.Config',
        'directives.Feed',
        'directives.Frequent',
        'directives.Sentiment',
        'directives.Stream',
        'directives.Tooltip'
    ])
    .controller('DashboardController', DashboardController);





