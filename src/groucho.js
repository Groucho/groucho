/**
 * @file
 * Track browsing history or other logging stats.
 */

var groucho = window.groucho || {};

// Functions in need of a little jQuery.
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
  // Make favorites "static".
  groucho.favoriteTerms = false;


  /**
   * Stash user origins.
   */
  groucho.trackOrigins = function trackOrigins() {

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
  groucho.trackHit = function trackHit() {

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


  /**
   * Put a tracking record into storage.
   *
   * @param {string} group
   *   Name of the tracking group to store the data as.
   * @param {string} data
   *   Data to store-- string, int, object.
   * @param {number} ttl (optional)
   *   Time-to-live in milliseconds.
   */
  groucho.createActivity = function createActivity(group, data, ttl) {
    var results = groucho.getActivities(group),
        n = new Date().getTime(),
        diff = 0;

    // Log event, first.
    groucho.storage.set('track.' + group + '.' + n, data, ttl);

    // Ensure space limit is maintained.
    if (results.length >= groucho.config.trackExtent) {
      diff = results.length - groucho.config.trackExtent;
      // Kill off oldest extra tracking activities.
      for (var i=0; i<=diff; i++) {
        groucho.storage.remove(results[i]._key);
      }
    }
  };


  /**
   * Access records of a specific tracking group.
   *
   * @param {string} group
   *   Name of the tracking group to return values for.
   *
   * return {array}
   *   List of tracking localStorage entries.
   */
  groucho.getActivities = function getActivities(group) {

    var results = groucho.storage.index(),
        returnVals = [],
        matchable = (group) ? new RegExp("^track." + group + ".", "g") : false,
        record;

    for (var i in results) {
      // Safety measure.
      if (!results.hasOwnProperty(i)) continue;

      // Remove unwanted types and return records.
      if (group) {
        if (results[i].match(matchable) !== null) {
          // Collect relevant.
          record = groucho.storage.get(results[i]);
          // Move key to property.
          record._key = results[i];
          returnVals.push(record);
        }
      }
      else {
        // Collect and return all.
        record = groucho.storage.get(results[i]);
        // Move key to property.
        record._key = results[i];
        returnVals.push(record);
      }
    }

    // Ensure sorting regardless of index.
    returnVals.sort(function (a, b) {
      // Created non-standard or outside Groucho.
      if (!b.hasOwnProperty('_key')) {
        return 1;
      }
      //
      if (parseInt(b._key.split('.')[2], 10) > parseInt(a._key.split('.')[2], 10)) {
        return -1;
      }
      else {
        return 1;
      }
    });

    return returnVals;
  };


  /**
   * Use browsing history and find user's top terms.
   *
   * @param {string} vocab
   *   The taxonomy vocabulary to collect favorites from.
   * @param {boolean} returnAll
   *   Whether or not to return all term hit counts.
   *
   * return {array}
   *   List of vocabs with top taxonomy terms and counts.
   */
  groucho.getFavoriteTerms = function getFavoriteTerms(vocab, returnAll, threshold) {

    var results = groucho.getActivities('browsing'),
        termProp = groucho.config.taxonomyProperty,
        pages = [],
        returnTerms = {},
        vocName;

    // Params optional.
    vocab = vocab || '*';
    returnAll = returnAll || false;
    threshold = threshold || groucho.config.favThreshold;

    /**
     * Assemble term counts.
     */
    function collectTerms(vocName, i) {
      for (var tid in results[i][termProp][vocName]) {
        // Non-existant vocab.
        if (!returnTerms.hasOwnProperty(vocName)) {
          returnTerms[vocName] = {};
        }

        // Existing term, add to count.
        if (returnTerms[vocName].hasOwnProperty(tid)) {
          returnTerms[vocName][tid].count++;
        }
        else {
          // New, add it on and create count.
          returnTerms[vocName][tid] = { 'name': results[i][termProp][vocName][tid], 'count': 1 };
        }
      }
    }

    /**
     * Remove lesser count terms.
     */
    function filterByCount(vocName) {
      var topCount = threshold;

      // Find top count.
      for (var tid in returnTerms[vocName]) {
        // Find top term hit count.
        if (returnTerms[vocName][tid].count >= topCount) {
          topCount = returnTerms[vocName][tid].count;
        }
      }
      // Get those with top count.
      for (tid in returnTerms[vocName]) {
        if (returnTerms[vocName][tid].count < topCount) {
          delete returnTerms[vocName][tid];
        }
      }
      // Destroy empty vocabs.
      if (isEmpty(returnTerms[vocName])) {
        delete returnTerms[vocName];
      }
    }

    /**
     * Utility: Term returns should be an array.
     */
    function makeArray(obj) {
      var arr = [];
      for (var i in obj) {
        obj[i].id = i;
        arr.push(obj[i]);
      }
      return arr;
    }

    /**
     * Utility: check for empty vocab object.
     */
    function isEmpty(obj) {
      for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          return false;
        }
      }
      return true;
    }

    // No data will be available.
    if (typeof termProp !== 'undefined') {
      // Walk through all tracking records.
      for (var i in results) {
        // Safety measure.
        if (!results.hasOwnProperty(i)) continue;

        // Only count each URL once.
        if (typeof pages[results[i].url] === 'undefined' && results[i].hasOwnProperty(termProp)) {
          // For de-duping URL hits.
          pages[results[i].url] = true;

          if (vocab === '*') {
            // Walk through all vocabs on record.
            for (vocName in results[i][termProp]) {
              collectTerms(vocName, i);
            }
          }
          else {
            // Just use requested vocabulary.
            if (results[i][termProp].hasOwnProperty(vocab)) {
              collectTerms(vocab, i);
            }
          }

        }
      }

      // Filter to top terms if desired.
      if (!returnAll) {
        for (vocName in returnTerms) {
          filterByCount(vocName);
        }
      }

      // Format output.
      if (vocab === '*') {
        for (vocName in returnTerms) {
          // Return arrays of terms.
          returnTerms[vocName] = makeArray(returnTerms[vocName]);
        }

        // Set favorites on page if no arguments were passed.
        if (returnAll === false) {
          groucho.favoriteTerms = returnTerms;
        }
      }
      else {
        // // Return array of terms in requested vocabulary.
        returnTerms = makeArray(returnTerms[vocab]);
      }
    }

    return returnTerms;
  };


  /**
   * Data transforms due to version updates.
   */
  groucho.schema = function schema() {
    // Update keys.
    var keys = {
          'user.sessionOrigin': {
            'oldKey': 'user.session_origin',
            'version': '0.2.0'
          }
        };

    for (var newKey in keys) {
      if ((groucho.storage.get(newKey) === null) && (groucho.storage.get(keys[newKey].oldKey) !== null)) {
        groucho.storage.set(newKey, groucho.storage.set(keys[newKey].oldKey));
        groucho.storage.remove(keys[newKey].oldKey);
      }
    }
  };


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
