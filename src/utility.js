/**
 * @file Library utilities for accessing data strcuture.
 *
 * Helper functions used throughout the library for common operations.
 *
 * groucho.userSet = function({country: "US"});
 */

var groucho = window.groucho || {};

(function($, groucho) {

  /**
   * Set user properties in localStorage.
   *
   * @param {object} data
   * @param {boolean} keepExisting
   *   Default is to overwrite value.
   * @param {number} ttl
   */
  groucho.userSet = function (data, keepExisting, ttl) {
    var userProperty;

    // Walk through data and attempt to set.
    for (var property in data) {
      if (!data.hasOwnProperty(property) || typeof property !== 'string') {
        // Irregular, skip.
        continue;
      }
      if (keepExisting) {
        userProperty = groucho.storage.get('user.' + property);
        if (!(userProperty === null || userProperty === undefined)) {
          // Continue to next property.
          continue;
        }
      }
      // Set user property, may be skipped above.
      groucho.storage.set('user.' + property, data[property], ttl);
    }
  };


  /**
   * Retrieve user data, one or all properties.
   *
   * @param {string} property
   *   Optionally specify a property.
   *
   * @return {mixed}
   */
  groucho.userGet = function (property) {
    var index = groucho.storage.index(),
        userProperties = {},
        propertyName;

    // Handle single property lookup.
    if (typeof property !== 'undefined') {
      return groucho.storage.get('user.' + property);
    }
    // Look for all user properties.
    for (var i in index) {
      if ((typeof index[i] === 'string') && (index[i].indexOf('user.') === 0)) {
        propertyName = index[i].replace('user.', '');
        userProperties[propertyName] = groucho.storage.get(index[i]);
      }
    }

    return userProperties;
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
  groucho.createActivity = function (group, data, ttl) {
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
   * @return {array}
   *   List of tracking localStorage entries.
   */
  groucho.getActivities = function (group) {
    var results = groucho.storage.index(),
        returnVals = [],
        matchable = (group) ? new RegExp("^track." + group + ".", "g") : false;

    for (var i in results) {
      // Safety measure.
      if (!results.hasOwnProperty(i)) continue;

      // Collect and return all.
      if (!group) {
        addRecordRow(returnVals, results[i]);
      }
      // Remove unwanted types, return relevant records.
      else if (results[i].match(matchable) !== null) {
        addRecordRow(returnVals, results[i]);
      }
    }

    // Ensure key sort regardless of session index, especially for timestamps.
    return returnVals.sort(sortList);
  };


  /**
   * Add record to collected values list, and move key to property.
   *
   * @param {object} list
   *   Array of records to be added to.
   * @param {string} name
   */
  function addRecordRow (list, name) {
    var record = groucho.storage.get(name);
    record._key = name;
    list.push(record);
  }


  /**
   * Sort after Groucho prefix, eliminate other entries.
   *
   * @param {string} a
   * @param {string} b
   *
   * @return {number}
   */
  function sortList (a, b) {
    // Eliminate storage entries outside Groucho.
    if (!a.hasOwnProperty('_key') || !a._key.match(/\./) ||
        !b.hasOwnProperty('_key') || !b._key.match(/\./)) {
      return 0;
    }
    // Sort by post-prefix key.
    if (parseInt(b._key.split('.')[2], 10) > parseInt(a._key.split('.')[2], 10)) {
      return -1;
    }
    else {
      return 1;
    }
  }


  /**
   * Data transforms due to version updates. Prevents past use data corruption.
   */
  groucho.schema = function () {
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

})(window.jQuery || window.Zepto || window.$, groucho);
