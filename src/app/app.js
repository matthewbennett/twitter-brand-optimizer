/*global angular:false */
'use strict';

function config($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
    $stateProvider
    .state('root', {
        url: '',
        abstract: true,
        views: {}
    })
    .state('root.dashboard', {
        url: '/',
        views: {
            'content@': {
                controller: 'DashboardController',
                templateUrl: 'dashboard/dashboard.tpl.html'
            }

        },
        data:{ pageTitle: 'Dashboard' }
    });
}

function run() {

}

function AppController($scope, $location, API) {
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        $scope.pageTitle = toState.data.pageTitle;
    });
}

angular
    .module('app', [
        // Modules
        'app.dashboard',
        // Templates
        'templates-app',
        'templates-components',
        // Dependencies
        'ngAnimate',
        'ngResource',
        'ui.router'
    ])
    .config(config)
    .run(run)
    .controller('AppController', AppController);