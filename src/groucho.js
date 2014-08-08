/**
 * @file
 * Track browsing history or other logging stats.
 */

// Functions in need of a little jQuery.
(function ($) {

  // Namespace.
  window.groucho = window.groucho || {};
  // Defaults
  groucho.config = groucho.config || {
    'taxonomyProperty': 'tags',
    'trackExtent': 25,
    'trackProperties': [
      'title',
      'type',
      'tags'
    ]
  };
  // Data availability.
  groucho.userDeferred = groucho.userDeferred || $.Deferred();
  // Make favorites "static".
  groucho.favoriteTerms = false;

  // React to page load.
  $(document).ready(function () {
    groucho.trackOrigins();
    groucho.trackHit();
  });


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
    if (!$.jStorage.get('user.session_origin') || !document.referrer) {
      $.jStorage.set('user.session_origin', JSON.stringify(hit));
    }

    // Stash the deep origin.
    if (!$.jStorage.get('user.origin')) {
      hit.referrer = document.referrer;
      $.jStorage.set('user.origin', JSON.stringify(hit));
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
        },
        i;

    // Log all configured items.
    // @todo Allow toggling tracking on and off as a localStorage help config override.
    if (typeof trackExtent !== false && typeof dataLayer !== 'undefined') {
      for (i in trackIds) {
        // Add each item.
        if (typeof dlHelper.get(trackIds[i]) !== 'undefined') {
          trackVals[trackIds[i]] = dlHelper.get(trackIds[i]);
        }
      }
    }

    // Stash tracking in localStorage.
    groucho.createActivity('browsing', JSON.stringify(trackVals));
  };


  /**
   * Put a tracking record into storage.
   * @todo Could allow TTL as an optional parameter.
   *
   * @param {string} group
   *   Name of the tracking group to store the data as.
   * @param {string} data
   *   Blob of data to store. Recommended as JSON.stringify(myDataObject).
   */
  groucho.createActivity = function (group, data) {

    var results = new groucho.getActivities(group),
        n = new Date().getTime(),
        diff = 0;

    // Log event, first.
    $.jStorage.set('track.' + group + '.' + n, data);

    // Ensure space limit is maintained.
    if (results.length > groucho.config.trackExtent) {
      diff = results.length - groucho.config.trackExtent;

      // Kill off oldest extra tracking activities.
      for (var i=0; i<=diff; i++) $.jStorage.deleteKey(results[i]._key);
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
  groucho.getActivities = function (group) {

    var results = $.jStorage.index(),
        returnVals = [],
        record,
        i;

    for (i in results) {
      // Remove unwanted types and return records.
      if (group) {
        if (results[i].indexOf('track.' + group) === 0) {
          record = JSON.parse($.jStorage.get(results[i]));
          record._key = results[i];
          returnVals.push(record);
        }
      }
      else {
        // Collect and return all.
        record = JSON.parse($.jStorage.get(results[i]));
        record._key = results[i];
        returnVals.push(record);
      }
    }

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
  groucho.getFavoriteTerms = function (vocab, returnAll) {

    var results = groucho.getActivities('browsing'),
        termProp = groucho.config.taxonomyProperty,
        pages = [],
        returnTerms = {},
        vocName;

    // Params optional.
    returnAll = returnAll || false;
    vocab = vocab || '*';

    /**
     * Assemble term counts.
     */
    function collectTerms (vocName, i) {
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
    function filterByCount (vocName) {
      var topCount = 0;

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
    }

    /**
     * Term returns should be an array.
     */
    function makeArray (vocabObject) {
      var arr = [];
      for (var i in vocabObject) {
        vocabObject[i].id = i;
        arr.push(vocabObject[i]);
      }
      return arr;
    }

    // No data will be available.
    if (typeof termProp !== 'undefined') {
      // Walk through all tracking records.
      for (var i in results) {
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
        for (vocName in results[i][termProp]) {
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

})(jQuery);
