/**
 * @file Track browsing history or other logging stats.
 */

var groucho = window.groucho || {};

// Functions in need of a little jQuery or similar selector library.
(function($, groucho) {

  // Defaults.
  var defaults = {
        'taxonomyProperty': 'tags',
        'trackExtent': 50,
        'favThreshold': 1,
        'trackProperties': [
          'title',
          'type',
          'tags'
        ],
        'lastClicked': 'a',
        'ttl': 0,
        'addons': {}
      };

  // Handle empty config.
  if (!groucho.hasOwnProperty(config) {
    groucho.config = groucho.defaults;
  } else {
    // Set empty configs to defaults.
    for (var setting in defaults) {
      if (!groucho.config.hasOwnProperty(setting)) {
        groucho.config[setting] = defaults[setting];
      }
    }
  }

  // Data availability.
  groucho.userDeferred = groucho.userDeferred || $.Deferred();
  // Make favorites "static".
  groucho.favoriteTerms = false;

  // React to page load.
  $(document).ready(function () {
    // Data transforms due to version updates.
    groucho.schema();
    // Automatic events.
    groucho.trackOrigins();
    groucho.trackHit();
    groucho.trackClicks();
  });

})(window.jQuery || window.Zepto || window.$, groucho);
