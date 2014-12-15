/**
 * @file
 * Determine user's comfort with web norms. Cough.
 */

groucho.addons = groucho.addons || {};
groucho.config.addons = groucho.config.addons || {};

(function ($, groucho) {

  // Defaults.
  groucho.config.addons.webIQ = {
    'behaviors': {
      'formsDelete': { 'increment': -1, 'threshold': 3, 'stash': 0 },
      'formsTab': { 'increment': 2 },
      'findOnPage': { 'increment': 4 },
      'doubleClick': { 'increment': -0.5 },
      'repeatPage': { 'increment': -3, 'threshold': 1 }
    }
  };

  // React to page load.
  $(document).ready(function () {
    behaviors = groucho.config.addons.webIQ.behaviors;

    // Call all behavior functions.
    for (var i in behaviors) {
      groucho.addons.webIQ[behaviors[i]].call();
    }
  });

  /**
  * Utility: Confirm threshold before recording.
  *
  * @param string behavior
  *   Behavior being monitored.
  * @param int count
  *   Current threshold count.
  *
  * @return boolean
  *   Results of check.
  */
  var checkThreshold = function checkThreshold(behavior, count) {
    if (count >= groucho.config.addons.webIQ.behaviors[behavior].threshold) {
      return true;
    }
    else {
      return false;
    }
  };


  groucho.addons.webIQ = {

    /**
     * How good is this user at internetting.
     *
     * @return int|object
     *   Score value or behaviors
     */
    getScore: function getScore(behavior) {
      var results = groucho.getActivities('webIQ'),
          score;

      // Return options.
      if (behavior === undefined) {
        score = 0;
        // Add it up for better or worse.
        for (var i in results) {
          score = score +
              groucho.config.addons.webIQ.behaviors[results[i].type].increment;
        }
      }
      else if (behavior === '*') {
        score = {};
        // Segment by behavior type.
        for (i in results) {
          scores[behavior] = scores[behavior] +
              groucho.config.addons.webIQ.behaviors[behavior].increment;
        }
      }
      else {
        score = 0;
        // Just the one behavior type.
        for (i in results) {
          if (results[i].type === behavior) {
            score = score +
                groucho.config.addons.webIQ.behaviors[behavior].increment;
          }
        }
      }

      return score;
    },

    /**
     * Listen: Delete keypresses in forms.
     */
    formsDelete: function formsDelete() {
      $('input').keypress(function (e) {
        if (e.which === 8 || e.which === 46) {
          // Allow a threshold, on-page.
          if (checkThreshold(this.name, groucho.config.addons.webIQ.behaviors[this.name].stash)) {
            groucho.createActivity('webIQ', { 'type': this.name });
          }
          else {
            groucho.config.addons.webIQ.behaviors[this.name].stash++;
          }

console.log("Executed: " + this.name);

        }
      });
    },

    /**
     * Listen: Use of delete in forms.
     */
    formsTab: function formsTab() {
      $('input').keypress(function (e) {
        if (e.which === 9) {
          groucho.createActivity('webIQ', { 'type': this.name });

console.log("Executed: " + this.name);

        }
      });
    },

    /**
     * Listen: Typing speed in forms.
     */
    findOnPage: function findOnPage() {
      $(document).keypress('f', function (e) {
        if (e.ctrlKey)
          groucho.createActivity('webIQ', { 'type': this.name });

console.log("Executed: " + this.name);

      });
    },

    /**
     * Listen: Double clicking, evar.
     */
    doubleClick: function doubleClick() {
      $(document).dblclick(function() {
        groucho.createActivity('webIQ', { 'type': this.name });

console.log("Executed: " + this.name);

      });
    },


    /**
     * Listen: Clicking a link to the same page.
     */
    repeatPage: function repeatPage() {
      $('a').click(function() {
        if (this.href = location.href) {
          // Allow a threshold, persistent.
          if (checkThreshold(this.name, groucho.getActivities('webIQ:' + this.name).length)) {
            groucho.createActivity('webIQ', { 'type': this.name });
          }
          else {
            groucho.createActivities('webIQ:' + this.name);
          }

console.log("Executed: " + this.name);

        }
      });
    }

  };

 })(jQuery, groucho);
