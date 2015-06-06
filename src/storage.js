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

(function grouchoStorage($, g) {

  // Flexible storage backend.
  var storage = g.storage || false,
      config = g.config.storage || {
        set: 'set',
        get: 'get',
        remove: 'deleteKey',
        index: 'index',
        available: 'storageAvailable',
        clear: 'flush'
      },
      error;

  // jStorage default.
  if (!storage && $.hasOwnProperty('jStorage') && (typeof $.jStorage === 'function')) {
    storage = $.jStorage;
  }

  // Provide feedback for missing backend.
  error = function error() {
    console.error('No localStorage backend libary');
  };

  // Scafold abstract storage.
  g.storage = {

    /**
     * Set localStorage item.
     *
     * @param {string} id
     * @param {string} value
     */
    set: storage[config.set] || error,

    /**
     * Get localStorage item.
     *
     * @param {string} id
     */
    get: storage[config.get] || error,

    /**
     * Remove localStorage item.
     *
     * @param {string} id
     */
    remove: storage[config.remove] || error,

    /**
     * Get entire localStorage index.
     */
    index: storage[config.index] || error,

    /**
     * Determine if storage is available. Only required for testing.
     */
    available: storage[config.available] || error,

    /**
     * Determine if storage is available. Only required for testing.
     */
    clear: storage[config.clear] || error,

  };

})(window.jQuery || window.Zepto || window.$, groucho);
