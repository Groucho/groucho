/**
 * @file Storage utilities for a flexible storage backend.
 *
 * Use any local storage backend, must allow object data.
 * Add this to your config...
 *
 * g.storage = myStorageBackend;
 * g.config {
 *   storage: {
 *     set: 'mySetter',
 *     get: 'myGetter',
 *     remove: 'myRemover',
 *     index: 'myIndex'
 *   }
 * };
 */

var groucho = window.groucho || {};

(function($, g) {

console.log('init storage');

  // Flexible storage backend.
  var storage = g.storage || false,
      config = (g.hasOwnProperty('config') && g.config.storage) || {
        set: 'set',
        get: 'get',
        remove: 'deleteKey',
        index: 'index',
        available: 'storageAvailable',
        clear: 'flush'
      },
      error;

console.log($.jStorage);

  // jStorage default.
  if (!storage && $.hasOwnProperty('jStorage') && (typeof $.jStorage === 'object')) {
    storage = $.jStorage;

console.log('storage default');
console.log(storage);

  }

  // Provide feedback for missing backend.
  error = function error() {
    console.error('No localStorage backend libary');
    return false;
  };


  // Scafold abstract storage.
  g.storage = storage || {};

  /**
   * Set localStorage item.
   *
   * @param {string} id
   * @param {string} value
   */
  g.storage.set = storage[config.set] || error;

  /**
   * Get localStorage item.
   *
   * @param {string} id
   */
  g.storage.get = storage[config.get] || error;

  /**
   * Remove localStorage item.
   *
   * @param {string} id
   */
  g.storage.remove = storage[config.remove] || error;

  /**
   * Get entire localStorage index.
   */
  g.storage.index = storage[config.index] || error;

  /**
   * Determine if storage is available. Only required for testing.
   */
  g.storage.available = storage[config.available] || error;

  /**
   * Determine if storage is available. Only required for testing.
   */
  g.storage.clear = storage[config.clear] || error;

console.log('storage done');
console.log(storage);
console.log(storage[config.clear]);

})(window.jQuery || window.Zepto || window.$, groucho);
