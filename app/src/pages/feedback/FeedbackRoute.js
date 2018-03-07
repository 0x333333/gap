(function(){
  'use strict';

  angular.module('feedback')
         .config(['$routeProvider', '$locationProvider', FeedbackRoutes]);

  function FeedbackRoutes($routeProvider, $locationProvider, $q){
    $routeProvider
      .when('/feedback', {
        templateUrl: '/src/pages/feedback/view/content.html',
        controller: 'FeedbackController',
        controllerAs: 'page'
      })
      .when('/', {
        templateUrl: '/src/pages/feedback/view/content.html',
        controller: 'FeedbackController',
        controllerAs: 'page'
      });
  }

})();
