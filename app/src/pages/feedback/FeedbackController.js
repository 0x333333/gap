(function(){

  angular
       .module('feedback')
       .controller('FeedbackController', [
          'feedbackService', '$mdBottomSheet', '$q', '$scope', '$sce',
          FeedbackController
       ]);

  /**
   * Feedback Controller for the Angular Material Starter App
   * @param $scope
   * @param $mdSidenav
   * @param avatarsService
   * @constructor
   */
  function FeedbackController(feedbackService, $mdBottomSheet, $q, $scope, $sce) {
    console.log('--feedbackController')

    var self = this;

    self.content        = {};
    self.showContactOptions = showContactOptions;

    self.showFeedbackForm = false;
    self.showOverview = false;
    self.showDetails = false;
    self.corrected = false;
    self.corrected2 = false;
    self.showReason = false;
    $scope.data = {};
    $scope.data.overview = "";
    $scope.data.details = "";
    $scope.data.overviewSuggestion = undefined;

    feedbackService
          .loadContent()
          .then( function( content ) {
            self.content    = content;
          });

    $scope.showFeedbackForm = function() {
      console.log('-- form')
      self.showFeedbackForm = !self.showFeedbackForm;
      self.showOverview = true;
      self.showDetails = false;
    }

    $scope.refresh = function() {
      location.reload();
    }

    $scope.acceptSuggestion = function() {
      self.corrected = true;
      $scope.data.overview = convert($scope.data.overview, false);
      $scope.data.overviewSuggestion = $sce.trustAsHtml(convert($scope.data.overview, true));
      console.log($scope.data.overview)
      console.log($scope.data.overviewSuggestion)
      if ($scope.data.overview == $scope.data.overviewSuggestion) {
        $scope.data.overviewSuggestion = false;
      }
      if ($scope.data.overviewSuggestion.indexOf('highlighttext') != -1) {
        self.showReason = true;
      }
    }

    $scope.acceptDetailsSuggestion = function() {
      self.corrected2 = true;
      $scope.data.details = convert($scope.data.details, false);
      $scope.data.detailsSuggestion = $sce.trustAsHtml(convert($scope.data.details, true));
    }

    $scope.next = function() {
      if (!self.corrected) {
        suggest = convert($scope.data.overview, true);
        console.log(suggest);
        if ($scope.data.overview !== suggest)
          $scope.data.overviewSuggestion = $sce.trustAsHtml(suggest);
        self.corrected = true;
      } else {
        self.showDetails = true;
      }
    }

    $scope.submit = function() {
      if (!self.corrected2) {
        $scope.data.detailsSuggestion = $sce.trustAsHtml(convert($scope.data.details, true));
      } else {
        alert('You are all set.');
      }
    }

    $scope.changed = function(idx) {
      if (idx === 0) {
        self.corrected = false;
      } else if (idx === 1) {
        self.corrected2 = false;
      }
    }

    /**
     * Show the bottom sheet
     */
    function showContactOptions($event) {
        var user = self.selected;

        return $mdBottomSheet.show({
          templateUrl: './src/pages/feedback/view/share.html',
          controller: [ '$mdBottomSheet', ContactPanelController],
          controllerAs: "cp",
          bindToController : true,
          targetEvent: $event
        }).then(function(clickedItem) {
          clickedItem && $log.debug( clickedItem.name + ' clicked!');
        });

        /**
         * Bottom Sheet controller for the Avatar Actions
         */
        function ContactPanelController( $mdBottomSheet ) {
          this.user = user;
          this.actions = [
            { name: 'Phone'       , icon: 'phone'       , icon_url: 'assets/svg/phone.svg'},
            { name: 'Twitter'     , icon: 'twitter'     , icon_url: 'assets/svg/twitter.svg'},
            { name: 'Google+'     , icon: 'google_plus' , icon_url: 'assets/svg/google_plus.svg'},
            { name: 'Hangout'     , icon: 'hangouts'    , icon_url: 'assets/svg/hangouts.svg'}
          ];
          this.submitContact = function(action) {
            $mdBottomSheet.hide(action);
          };
        }
    }
  }

  /**
 * @fileoverview Description of this file.
 *
 * Adapted from https://github.com/jewang/gender-neutral-text-converter
 */

  var PRONOUNS = [
    ["she's", "they're"],
    ["he's", "they're"],
    ['he', 'they'],
    ['she', 'they'],
    ['him', 'them'],
    ['hers', 'theirs'],
    ['her', 'them'],
    ['herself', 'themselves'],
    ['himself', 'themselves'],
    ['his', 'their'],
  ];
  var IRREGULAR_VERBS = [
      ['was', 'were'],
      ['has', 'have'],
      ['is', 'are'],
      ['does', 'do'],
      ['doesn', 'don'],
      ['hasn', 'haven'],
      ['isn', 'aren'],
      ['goes', 'go'],
    ];
  var FORMAT_TAG_OPEN = '<span class="changetext">';
  var FORMAT_TAG_CLOSE = "</span>";

  var VERB_ES_SUFFIXES = ['ses', 'zes', 'xes', 'ches', 'shes'];

  String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
  };

  function convert(s, with_highlights) {
    s = pluralize_verbs(s, with_highlights);
    for(i = 0; i < PRONOUNS.length; i++) {
      s = pronoun_replace(s, PRONOUNS[i][0], PRONOUNS[i][1], with_highlights);
    }
    if (with_highlights) {
      s = highlight_gendered(s);
    }

    if (with_highlights)
      return s.replaceAll('\n', '<br>');
    else
      return s;
    // return s.replaceAll('\n', '<br>');
  }

  function highlight_gendered(s) {
    var regexstr = '';
    // TODO: Make accents work
    var others = ['girl[a-z]*', 'Stephanie',
        'boy[a-z]*', 'female[a-z]*', 'male',
        'fianc(e|&eacute;|é)e?', 'husband',
        'wife', 'wive', 'actor', '[a-z]*ess(es)?', '[a-z]*ster', 'ms',
        'mr', 'miss(es)?', 'mister', 'madam', 'maiden', 'lad',
        'lass(es)?', 'latin(o|a)', '[a-z]*ette', 'comedienne', '(lady|ladies)', 'femme',
        'feminine', 'masculine', 'masseuse', 'ghc', 'anita([a-z]| )*borg', 'grace([a-z]| )*hopper',
        'ghc', 'ncwit', 'ada', 'lovelace'];
    for (let i = 0; i<others.length; i++) {
      regexstr += '\\b' + others[i] + 's?\\b|';
    }
    regexstr += '\\b[a-z]*m(a|e)ns?\\b';
    var re = new RegExp(regexstr, 'gi');
    var sep = ' ';
    let match;
    while((match = re.exec(s)) != null) {
      let replace = '<span class="highlighttext">' + match[0] + '</span>';
      s = s.substring(0, match.index) + replace + s.substring(re.lastIndex, s.length);
      re.lastIndex += replace.length - match[0].length;
    }
    return s;
  }

  function pluralize_verbs(s, with_highlights) {
    var re = new RegExp('\\bs?he\\b\\s+(.+?)\\b', 'gi');
    var sep = /\b/gi;
    let match;
    let split;
    while((match = re.exec(s)) != null) {
      split = match[0].split(sep);
      let replace = split[0] + split[1] + pluralize_verb(split[2], with_highlights);
      s = s.replace(match[0], replace);
    }
    return s;
  }

  function pluralize_verb(verb, with_highlights) {
    var uppercase = verb === verb.toUpperCase();
    let new_verb = pluralize_lowercase_verb(verb.toLowerCase());
    if (uppercase) {
      new_verb = new_verb.toUpperCase();
    }
    if (verb != new_verb && with_highlights) {
      new_verb = FORMAT_TAG_OPEN + new_verb + FORMAT_TAG_CLOSE;
    }
    return new_verb;
  }

  function pluralize_lowercase_verb(verb) {
    for (let i = 0; i < IRREGULAR_VERBS.length; i++) {
      if (verb == IRREGULAR_VERBS[i][0]) {
        return IRREGULAR_VERBS[i][1];
      }
    }
    if (verb.endsWith('ies')) {
      return verb.substring(0, verb.length - 3) + 'y';
    }
    for (let i = 0; i < VERB_ES_SUFFIXES.length; i++) {
      var suffix = VERB_ES_SUFFIXES[i];
      if (verb.endsWith(suffix)) {
        return verb.substring(0, verb.length - 2);
      }
    }
    if (verb.endsWith('s')) {
      return verb.substring(0, verb.length - 1);
    }
    return verb;
  }

  function pronoun_replace(s, p, r, with_highlights) {
    let replace_map = [[p, r]];
    replace_map.push([capitalize(p), capitalize(r)]);
    replace_map.push([p.toUpperCase(), r.toUpperCase()]);
    if (with_highlights) {
      for (let j = 0; j < replace_map.length; j++) {
        if (p == 'her') {
          replace_map[j][1] = '<span class="her">' + replace_map[j][1] + '</span>';
        } else {
          replace_map[j][1] = FORMAT_TAG_OPEN + replace_map[j][1] + FORMAT_TAG_CLOSE;
        }
      }
    }

    for (let j = 0; j < replace_map.length; j++) {
      var re = new RegExp('\\b' + replace_map[j][0] + '\\b', 'g');
      s = s.replace(re, replace_map[j][1]);
    }
    return s;
  }

  function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

})();
