/**
 * @file
 * Track browsing history or other logging stats.
 */

var groucho = window.groucho || {};

// Functions in need of a little jQuery.
(function ($, groucho) {

  // Defaults.
  groucho.config = groucho.config || {
    'taxonomyProperty': 'tags',
    'trackExtent': 50,
    'favThreshold': 1,
    'trackProperties': [
      'title',
      'type',
      'tags'
    ],
    'addons': {}
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
  groucho.trackOrigins = function trackOrigins() {

    var n = new Date().getTime(),
        hit = {
          'timestamp': n,
          'url': window.location.href
        };

    // Stash the session entry point.
    if (!$.jStorage.get('user.session_origin') || !document.referrer) {
      $.jStorage.set('user.session_origin', hit);
    }

    // Stash the deep origin.
    if (!$.jStorage.get('user.origin')) {
      hit.referrer = document.referrer;
      $.jStorage.set('user.origin', hit);
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
    if (typeof trackExtent !== false && typeof dataLayer !== 'undefined') {
      for (var i in trackIds) {
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
   * Put a tracking record into storage.
   * @todo Could allow TTL as an optional parameter.
   *
   * @param {string} group
   *   Name of the tracking group to store the data as.
   * @param {string} data
   *   Data to store-- string, int, object.
   */
  groucho.createActivity = function createActivity(group, data) {

    var results = groucho.getActivities(group),
        n = new Date().getTime(),
        diff = 0;

    // Log event, first.
    $.jStorage.set('track.' + group + '.' + n, data);

    // Ensure space limit is maintained.
    if (results.length >= groucho.config.trackExtent) {
      diff = results.length - groucho.config.trackExtent;
      // Kill off oldest extra tracking activities.
      for (var i=0; i<=diff; i++) $.jStorage.deleteKey(results[i]._key);
    }
  };


  /**
   * Access records of a specific tracking group.
   *
   * @param {string} group
   *   Strucutured conditions for activity lookup: {type, [conditionList]}.
   * @param {array} conditions
   *   List of acceptable property [key/[values]] objects.
   *
   * return {array}
   *   List of tracking localStorage entries.
   */
  groucho.getActivities = function getActivities(type, conditionList) {

    // Optional params.
    var group = type || false,
        conditions = conditionList || false,
        groupMatch = new RegExp("^track." + group + ".", "g"),
        results = $.jStorage.index(),
        returnVals = [],
        record;

    /**
     * Confirm properties are of desired values.
     * NOTE: String comparisons only!
     *
     * @param  {array} conditions
     *   List of acceptable property [key/[values]] objects.
     * @param  {string} record
     *   History record to check against.
     *
     * @return {boolean}
     *   Result of match check.
     */
    function checkProperties(conditions, record) {
      // Check all conditions, be picky about type.
      if (conditions && conditions instanceof Array) {
        for (var i in conditions) {
          // Confirm an acceptable value.
          if (checkValues(i, conditions[i], record)) {
            addRecord(record);
          }

        }
      }
      else {
        // No conditions, or wrong type-- add everything.
        addRecord(record);
      }
    }

    /**
     * Confirm one of values matches the record.
     * NOTE: String comparisons only!
     *
     * @param  {string} property
     *   Property to check.
     * @param {array} values
     *   List of acceptable values.
     * @param  {string} record
     *   History record to check against.
     *
     * @return {boolean}
     *   Result of match check.
     */
    function checkValues(property, values, record) {
      // Check all values, be picky about type.
      if (values instanceof Array) {
        for (var i in values) {
          // Confirm an acceptable value.
          if (record.hasOwnProperty(property) && record.property === values[i]) {
            addRecord(record);
            // Only need one match per value set.
            break;
          }
        }
      }
    }

    /**
     * Grab record from storage, add to returns.
     *
     * @param string key
     *   Browser storage lookup key.
     */
    function addRecord(key) {
      record = $.jStorage.get(key);
      // Move key to special property.
      record._key = key;
      returnVals.push(record);
    }


    // Look through storage index.
    for (var i in results) {
      // Remove unwanted types and return records.
      if (group) {
        if (results[i].match(groupMatch) !== null) {
          // Move on to checking conditions (potentially just add it).
          checkProperties(conditions, results[i]);
        }
      }
      else {
        // Just check property or just add.
        checkProperties(conditions, results[i]);
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

})(jQuery, groucho);
