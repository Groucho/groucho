/**
 * @file Storage utilities for a flexible storage backend.
 *
 * Use any local storage backend.
 * Provide simple wrappers for library functions where you do other groucho configs...
 *
 * groucho.storage.set = function(id, val) {
 *   mySetter(id, val);
 * }
 *
 * groucho.storage.get = function(id) {
 *  myGetter(id);
 * }
 */


var groucho = window.groucho || {};

(function($, groucho) {

  var defaultStorage,
      error;

  // Provide feedback for missing backend.
  error = function error() {
    console.log('No localStorage backend libary');
    return false;
  };

  // jStorage default, or error handler.
  // @todo Allow only overriding some functions.

  if (!groucho.storage) {
    defaultStorage = ($.hasOwnProperty('jStorage')) && (typeof $.jStorage === 'object');

    // Assign storage function defaults.
    groucho.storage = {
      /**
       * Set localStorage item.
       *
       * @param {string} id
       * @param {string} value
       * @param {number} ttl
       */
      set: (defaultStorage) ? function set(id, value, ttl) {
        ttl = ttl || groucho.config.ttl || 0;
        return $.jStorage.set(id, value, {TTL: ttl});
      } : error,

      /**
       * Get localStorage item.
       *
       * @param {string} id
       */
      get: (defaultStorage) ? function get(id) {
        return $.jStorage.get(id);
      } : error,

      /**
       * Remove localStorage item.
       *
       * @param {string} id
       */
      remove: (defaultStorage) ? function remove(id) {
        return $.jStorage.deleteKey(id);
      } : error,

      /**
       * Get entire localStorage index.
       *
       * @return {array}
       */
      index: (defaultStorage) ? function index() {
        return $.jStorage.index();
      } : error,

      /**
       * Determine if storage is available. Only required for testing.
       */
      available: (defaultStorage) ? function available() {
        return $.jStorage.storageAvailable();
      } : error,


      /**
       * Clear all local storage contents. Only required for testing.
       */
      clear: (defaultStorage) ? function clear() {
        return $.jStorage.flush();
      } : error

    };
  }

})(window.jQuery || window.Zepto || window.$, groucho);
