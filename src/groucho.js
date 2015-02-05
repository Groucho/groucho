/**
 * @file
 * Track browsing history or other logging stats.
 */

var groucho = window.groucho || {};

// Functions in need of a little jQuery.
(function ($, groucho) {

  // Defaults.
  groucho.config = groucho.config || {
    'trackExtent': 50,
    'taxonomyProperty': 'tags',
    'favThreshold': 1,
    'trackProperties': [
      'title',
      'type',
      'tags'
    ],
    'adjustments': [],
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
   * Set a user value for storage.
   *
   * @param {string} varname
   * @param {string} value
   */
  groucho.setUserProperty = function setUserProperty(varName, value) {
    var now = new Date().getTime();
    $.jStorage.set('user.' + varName, {
      'timestamp': now,
      'value': value
    });
  };


  /**
   * Get a user value from storage.
   *
   * @param {string} varname
   * @param {boolean} meta (optional)
   */
  groucho.getUserProperty = function getUserProperty(varName, meta) {
   var property = $.jStorage.get('user.' + varName);
   return (meta !== null) ? property : property.value;
  };


  /**
   * Stash user origins.
   */
  groucho.trackOrigins = function trackOrigins() {
    var hit = {
          'url': window.location.href,
          'referrer': document.referrer
        };

    // Stash the session entry point.
    if (!groucho.getUserProperty('session_origin') || !document.referrer) {
      groucho.setUserProperty('session_origin', hit)
    }
    // Stash the deep origin.
    if (!groucho.getUserProperty('origin')) {
      groucho.setUserProperty('origin', hit);
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
   * @param {int} threshold
   *   Number of hits to be returned with favorites.
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


  /**
   * Initialize personalzation.
   */
  groucho.personalizeInit = function personalizeInit() {
    var hiddenPanes = document.querySelectorAll('.personalize.hidden');
    for (var p = 0; p < hiddenPanes.length; p++) {
      hiddenPanes[p].style.display = 'none';
    }
  };


  /**
   * Audience-specific content.
   *
   * Filter and/or reveal content based on personal preference.
   */
  groucho.personalize = function personalize() {
    var preferences = groucho.adjustments,
        panes = document.querySelectorAll('.personalize'),
        source,
        anyKept;

    /**
     * Obtain value and label of preference.
     *
     * @param {string} label
     *   Label for preference, both DOM and storage.
     * @param  {string|object} pref
     *   Source for preference value.
     *
     * @return {array|boolean}
     *   Preference value and DOM label.
     */
    function getPrefDetails(label, source) {
      var prefValue,
          favs,
          container;

      if (source === 'user') {
        prefValue = groucho.getUserProperty(label);
      }
      else if (source === 'favorite') {
        favs = groucho.getFavoriteTerms(label, false);
        prefValue = favs[0];
      }
      else if (typeof source === 'object') {
        // Custom localStorage data source.
        if (source.hasOwnProperty('key') && source.hasOwnProperty('property')) {
          // Strcutured data source.
          // @todo Recursive.
          container = $.jStorage.get(source.key);
          if (container !== null) {
            if (container.hasOwnProperty(source.property)) {
              prefValue = container[source.property];
            }
            else {
              return false;
            }
          }
          else {
            return false;
          }
        }
        else if (source.hasOwnProperty('key')) {
          // Simple data source.
          prefValue = $.jStorage.get(source.key);
          if (prefValue === null) {
            return false;
          }
        }
        else {
          return false;
        }
      }
      else {
        return false;
      }

      return {
        'matchValue': String(prefValue),
        'domLabel': label
      };
    }


    /**
     * Use preferences to alter a pane.
     *
     * @todo Sorting.
     *
     * @param  {nodeList element}
     *   Element to act on.
     * @param  {object} pref
     *   Qualified preference object.
     *
     * @return {bool}
     *   If relevant content was found.
     */
    function applyPrefsToElements(pane, pref) {
      var anyKept = false,
          elements,
          elmVal;

      // All the elements.
      elements = pane.querySelectorAll('[data-groucho-' + pref.domLabel + ']');
      if (elements.length > 0) {
        for (var e = 0; e < elements.length; e++) {
          // Hide irrelevant.
          elmVal = elements[e].data('data-groucho-' + pref.domLabel);
          if (elmVal !== pref.matchValue && elmVal !== 'default') {
            elements[e].style.display = 'none';
          }
          else {
            // Found.
            anyKept = true;
            if ($(elements[e]).hasClass('hidden')) {
              elements[e].style.display = '';
            }
          }
        }
      }

      return anyKept;
    }


    // Process each pane.
    for (var p = 0; p < panes.length; p++) {
      anyKept = false;
      // One pass per preference.
      // @todo Allow mulitple favs per preference group.
      for (var label in preferences) {
        if (preferences.hasOwnProperty(label)) {
          source = getPrefDetails(label, preferences[label]);
          if (applyPrefsToElements(panes[p], source)) {
            anyKept = true;
          }
        }
      }

      // Hidden gems were found OR shown pane had nothing good.
      if ($(panes[p]).hasClass('hidden') === anyKept) {
        panes[p].style.display = '';
      }
    }
  };

})(jQuery, groucho);
