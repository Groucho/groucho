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
   * Use browsing history and find user's top terms.
   *
   * @param {string} vocab
   *   The taxonomy vocabulary to collect favorites from.
   * @param {boolean} returnAll
   *   Whether or not to return all term hit counts.
   *
   * return {object}
   *   List of vocabs with top taxonomy term and count.
   */
  groucho.getFavoriteTerms = function (vocab, returnAll) {

    var results = groucho.getActivities('browsing'),
        trackTags = groucho.config.taxonomyProperty,
        output = false,
        topTerms = {},
        pages = [],
        returnTerms = {},
        vocName;

    // Params optional.
    returnAll = returnAll || false;
    vocab = vocab || '*';


    /**
     * Abstraction for reuse, DRY.
     */
    function collectTerms (vocName, terms) {
      for (var tid in terms) {
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
          returnTerms[vocName][tid] = { name: terms[tid], count: 1 };
        }
      }
    }

    // Only bother to build it once if no arguments were passed.
    if (typeof trackTags !== 'undefined') {
      // Walk through tracking records.
      for (var key in results) {
        // Only count each URL once.
        if (typeof pages[results[key].url] === 'undefined' && results[key].hasOwnProperty(trackTags)) {
          // For de-duping URL hits.
          pages[results[key].url] = true;

          if (vocab === '*') {
            // Walk through all vocabs.
            for (vocName in results[key][trackTags]) {
              collectTerms(vocName, results[key][trackTags][vocName]);
            }
          }
          else {
            // Just use requested vocabulary.
            if (results[key][trackTags].hasOwnProperty(vocab)) {
              collectTerms(vocab, results[key][trackTags][vocab]);
            }
          }

        }
      }

      // Reduce to just top terms per vocab.
      if (!returnAll) {
        // Walk through vocabs.
        for (vocName in returnTerms) {
          var topCount = 0;

          // Walk through terms, to find top count.
          for (var tidForCount in returnTerms[vocName]) {
            // Find top term hit count.
            if (returnTerms[vocName][tidForCount].count > topCount) {
              topCount = returnTerms[vocName][tidForCount].count;
            }
          }
          // Walk through terms, again, to collect top terms.
          for (var tidForTop in returnTerms[vocName]) {
            // Find top term hit count.
            if (returnTerms[vocName][tidForTop].count === topCount) {
              if (!topTerms.hasOwnProperty(vocName)) {
                topTerms[vocName] = {};
              }
              topTerms[vocName][tidForTop] = returnTerms[vocName][tidForTop];
            }
          }
        }

        output = topTerms;
      }
      else {
        output = returnTerms;
      }

    }

    // Set favorites if no arguments were passed.
    if (vocab === '*' && returnAll === false) {
      groucho.favoriteTerms = output;
    }

    return output;
  };


  /**
   * Access records of a specific tracking group.
   *
   * @param {string} group
   *   Name of the tracking group to return values for.
   *
   * return {object}
   *   Key/value list of tracking localStorage entries.
   */
  groucho.getActivities = function (group) {

    var results = $.jStorage.index(),
        returnVals = {},
        i = 0;

    if (group) {
      // Remove unwanted types and return records.
      for (i in results) {
        if (results[i].indexOf('track.' + group) === 0) {
          returnVals[results[i]] = JSON.parse($.jStorage.get(results[i]));
        }
      }
    }
    else {
      // Collect and return all.
      for (i in results) {
        returnVals[results[i]] = JSON.parse($.jStorage.get(results[i]));
      }
    }

    return returnVals;
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

    var results = new groucho.Collection(groucho.getActivities(group)),
        keys = results.keys(),
        n = new Date().getTime(),
        diff = 0;

    // Log event, first.
    $.jStorage.set('track.' + group + '.' + n, data);

    // Ensure space limit is maintained.
    if (results.size() > groucho.config.trackExtent) {
      diff = results.size() - groucho.config.trackExtent;

      // Kill off oldest extra tracking activities.
      for (var i=0; i<=diff; i++) $.jStorage.deleteKey(keys[i]);
    }
  };


  /**
   * Utility...
   * (Avoiding depdencies)
   */

  /**
   * Handy object type for record retrieval and use.
   * Namespaced for easy use to extend the module.
   *
   * param {object}
   *   Set of records to gain methods on.
   */
  groucho.Collection = function (obj) {

    // Private vars.
    var keyList = null,
        length = null;

    // Public functions.
    return {

      /**
       * Get the property keys of an object.
       *
       * param {object} obj
       *   Oject to be inspected.
       * return {array}
       *   List of object properties.
       */
      keys : function() {
        if (keyList === null) {
          keyList = [];
          for (var key in obj) keyList.push(key);
        }
        return keyList.sort();
      },

      /**
       * Get the size of an object.
       *
       * param {object} obj
       *   Oject to be inspected.
       * return {number}
       *   Size of the object.
       */
      size : function () {
        if (obj == null) return 0;
        if (length === null) {
          length = this.keys().length;
        }
        return length;
      },

      /**
       * Access the object from this instance.
       *
       * return {object}
       *   Use what you started with.
       */
      get : function () {
        return obj;
      }
    };
  };

})(jQuery);
