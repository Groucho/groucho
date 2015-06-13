/**
 * @file
 * Update meta data and settings found within a page.
 */

/* globals store:false, simpleStorage:false */

var groucho = window.groucho || {};

(function($, g) {

  // Default configs.
  g.config = {
    'taxonomyProperty': 'entityTaxonomy',
    'trackExtent': 10,
    'favThreshold': 1,
    'trackProperties': [
      'entityType',
      'entityTaxonomy',
      'entityBundle'
    ]
  };

  // Alternate storage backend configs.
  // @todo Extendable, and select tested backends by name.
  if (location.search.match(/[?&]store.js=(.*?)(?=&|$)/) !== null) {
    g.storage = {
      set: function set(id, value) {
        return store.set(id, value);
      },
      get: function get(id) {
        return store.get(id);
      },
      remove: function remove(id) {
        return store.remove(id);
      },
      index: function index() {


        // Just get the keys.
        //var keys = Object.keys(store.getAll());
        // for (var key in store.getAll()) {
        //   keys.push(key);
        // }



        return Object.keys(store.getAll());
      },
      available: function available() {
        // Property vs function.
        return store.enabled;
      },
      clear: function clear() {
        return store.clear();
      }
    };
  }

  // SimpleStorage.
  if (location.search.match(/[?&]simplestorage=(.*?)(?=&|$)/) !== null) {
    g.storage = {
      set: function set(id, value) {
        return simpleStorage.set(id, value);
      },
      get: function get(id) {
        return simpleStorage.get(id);
      },
      remove: function remove(id) {
        return simpleStorage.deleteKey(id);
      },
      index: function index() {
        return simpleStorage.index();
      },
      available: function available() {
        // Property vs function.
        return simpleStorage.canUse();
      },
      clear: function clear() {
        return simpleStorage.flush();
      }
    };
  }

})(window.jQuery || window.Zepto || window.$, groucho);

// Page meta data.
dataLayer = [{
  "entityId": "123",
  "entityLabel": "My Cool Page",
  "entityType": "node",
  "entityBundle": "article",
  "entityTaxonomy": {
    "my_category": {
      "25": "Term Name",
      "26": "Another Term"
    },
    "my_types": {
      "13": "Some Tag",
      "14": "Another Tag"
    }
  }
}];

//console.log(groucho);
