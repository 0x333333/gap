(function(){
  'use strict';

  angular.module('feedback')
         .service('feedbackService', ['$q', FeedbackService]);

  /**
   * Feedback DataService
   * Uses embedded, hard-coded data model; acts asynchronously to simulate
   * remote data service call(s).
   *
   * @returns {{loadContent: Function}}
   * @constructor
   */
  function FeedbackService($q){
    var data = {
      title: 'Prad Pitt',
      description: 'William Bradley Pitt is an American actor and producer. He has received multiple awards and nominations including an Academy Award as producer under his own company Plan B Entertainment.'
    };

    // Promise-based API
    return {
      loadContent : function() {
        // Simulate async nature of real remote calls
        return $q.when(data);
      }
    };
  }

})();
