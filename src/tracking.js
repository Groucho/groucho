/**
 * @file Tracking user behavior and events.
 */

var groucho = window.groucho || {};

(function($, groucho) {

  /**
   * Stash user origins.
   */
  groucho.trackOrigins = function () {
    var n = new Date().getTime(),
        hit = {
          'timestamp': n,
          'url': window.location.href
        };

    // Stash the session entry point.
    if (!groucho.storage.get('user.sessionOrigin') || !document.referrer) {
      groucho.storage.set('user.sessionOrigin', hit);
    }

    // Stash the deep origin.
    if (!groucho.storage.get('user.origin')) {
      hit.referrer = document.referrer;
      groucho.storage.set('user.origin', hit);
    }

    // Reliable availability.
    groucho.userDeferred.resolve();
  };


  /**
   * Track page hit.
   */
  groucho.trackHit = function () {
    var dlHelper = new DataLayerHelper(dataLayer),
        trackIds = groucho.config.trackProperties,
        trackVals = {
          'url': window.location.href
        };

    // Log all configured items.
    // @todo Allow toggling tracking on and off as a localStorage help config override.
    if (typeof dataLayer !== 'undefined') {
      for (var i in trackIds) {
        // Safety measure.
        if (!trackIds.hasOwnProperty(i)) continue;

        // Add each item.
        if (typeof dlHelper.get(trackIds[i]) !== 'undefined') {
          trackVals[trackIds[i]] = dlHelper.get(trackIds[i]);
        }
      }
    }

    // Stash tracking in localStorage.
    groucho.createActivity('browsing', trackVals);
  };


  /**
   * Stash last clicked text.
   */
  groucho.trackClicks = function () {
    if (!groucho.config.lastClicked) return;
    // Bind click event to configured selector.
    if (typeof $.fn.click === 'function') {
      $(groucho.config.lastClicked).click(function () {
        groucho.storage.set('user.lastClicked', $(this).text());
      });
    }
  };

})(window.jQuery || window.Zepto || window.$, groucho);
