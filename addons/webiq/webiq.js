/**
 * @file
 * Determine user's comfort with web norms. Cough.
 */

(function ($) {

	// Setup.
  window.groucho = window.groucho || {};
	groucho.config = groucho.config || {};
	groucho.config.addons = groucho.config.addons || [];
	// Defaults.
  groucho.config.addons.webiq = {
    'startScore': 0,
    'behaviors': {
      'formsDelete': { 'increment': '-1' },
      'formsTab': { 'increment': '2' },
      'findOnPage': { 'increment': '4' },
      'doubleClick': { 'increment': '.5' }
    }
  };

  // React to page load.
  $(document).ready(function () {
    // Call all behavior functions.
    for (var i in groucho.config.addons.webiq.behaviors) {
      groucho.addons.webiq[groucho.config.addons.webiq.behavior[i]].call();
    }
  });

  /**
   * How good is this user at internetting.
   */
  groucho.addons.webiq.getScore = function () {
    var results = groucho.getActivities('webiq'),
    score = groucho.config.addons.webiq.startScore;
    // Add it up for better or worse.
    for (var i in results) {
      score = score + groucho.config.addons.webiq.behaviors[results[i].type].increment;
    }
    return score;
  };


  /**
   * Listen: Delete keypresses in forms.
   */
  groucho.addons.webiq.formsDelete = function () {
    $('input').keypress(function (e) {
      if (e.which === 8 || e.which === 46) {
        groucho.createActivity('webiq', { 'type': this.name });

console.log("Executed: " + this.name);

      }
    });
  };

  /**
   * Listen: Use of delete in forms.
   */
  groucho.addons.webiq.formsTab = function () {
    $('input').keypress(function (e) {
      if (e.which === 9) {
        groucho.createActivity('webiq', { 'type': this.name });

console.log("Executed: " + this.name);

      }
    });
  };

  /**
   * Listen: Typing speed in forms.
   */
  groucho.addons.webiq.findOnPage = function () {
    $(document).keypress('f', function (e) {
      if (e.ctrlKey)
        groucho.createActivity('webiq', { 'type': this.name });

console.log("Executed: " + this.name);

    });
  };

  /**
   * Listen: Double clicking, evar.
   */
  groucho.addons.webiq.doubleClick = function () {
    $(document).dblclick(function() {
      groucho.createActivity('webiq', { 'type': this.name });

console.log("Executed: " + this.name);

    });
  };

 })(jQuery);
