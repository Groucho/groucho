/**
 * @file Storage utilities for a flexible storage backend.
 *
 * Use any local storage backend.
 * Provide simple wrappers for library functions where you do other groucho configs...
 *
 * g.storage.set = function(id, val) {
 *   mySetter(id, val);
 * }
 *
 * g.storage.get = function(id) {
 *  myGetter(id);
 * }
 *
 * Include: get(), set(), remove(), index(), just for testing: available(), and clear().
 */


var groucho = window.groucho || {};

(function($, g) {

  var defaultStorage,
      error;

  // Provide feedback for missing backend.
  error = function error() {
    console.log('No localStorage backend libary');
    return false;
  };

  // jStorage default, or error handler.
  // @todo Allow only overriding some functions.

  if (!g.storage) {
    defaultStorage = ($.hasOwnProperty('jStorage')) && (typeof $.jStorage === 'object');

    // Assign storage function defaults.
    g.storage = {
      /**
       * Set localStorage item.
       *
       * @param {string} id
       * @param {string} value
       */
      set: (defaultStorage) ? function set(id, value) {
        return $.jStorage.set(id, value);
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
