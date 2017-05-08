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

  // Set empty configs to defaults.
  for (var config in defaults) {
    if (!groucho.config.hasOwnProperty(config)) {
      groucho.config[config] = defaults[config];
    }
  }

  // Data availability.
  groucho.userDeferred = groucho.userDeferred || $.Deferred();
  // Make favorites static.
  groucho.favoriteTerms = false;

  // React to page load.
  $(document).ready(function grouchoInit () {
    // Manage page for later adjuments.
    //groucho.personalizeInit();
    // Data transforms due to version updates.
    groucho.schema();
    // Automatic events.
    groucho.trackOrigins();
    groucho.trackHit();
    groucho.trackClicks();
    // Update configured user preferences.
    //groucho.favoritesInit();
    // Adjust page.
    //groucho.personalize();
  });

})(window.jQuery || window.Zepto || window.$, groucho);
