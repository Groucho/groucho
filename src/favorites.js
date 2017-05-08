/**
 * @file Compute the preferences of a user.
 */

var groucho = window.groucho || {};

(function($, groucho) {

  /**
   * Continually update some properties as favorites are generated.
   */
  groucho.favoritesInit = function () {
    var settings = {};
    // Sanity check.
    if (groucho.config.hasOwnProperty('favorites')) {
      // Discover favorites and create change set.
      groucho.getFavoriteTerms();
      $.each(groucho.config.favorites, function (userKey, favorite) {
        if (groucho.favorites[favorite]) {
          settings[userKey] = groucho.favorites[favorite];
        }
      });
      // Update all configured favorites.
      groucho.userSet(settings);
    }
  };


  /**
   * Use browsing history and find user's top terms.
   *
   * @param {string} vocab
   *   The taxonomy vocabulary to collect favorites from.
   * @param {boolean} returnAll
   *   Whether or not to return all term hit counts.
   *
   * @return {array}
   *   List of vocabs with top taxonomy terms and counts.
   */
  groucho.getFavoriteTerms = function (vocab, returnAll, threshold) {
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
     *
     * @param {string} vocName
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
     *
     * @param {string} vocName
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
     *
     * @param {object} obj
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

})(window.jQuery || window.Zepto || window.$, groucho);
