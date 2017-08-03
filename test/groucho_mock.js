/**
 * @file
 * Update meta data and settings found within a page.
 */

/* globals store:false, simpleStorage:false */

var groucho = window.groucho || {};

(function($, g) {

  // Default configs.
  g.config = {
    taxonomyProperty: 'entityTaxonomy',
    trackExtent: 10,
    favThreshold: 1,
    trackProperties: [
      'entityType',
      'entityTaxonomy',
      'entityBundle'
    ],
    ttl: 0,
    adjust: {
      dataAttribute: 'groucho-region',
      userProperty: 'user.region',
      paramOverride: 'utm_region',
      helperCallback: 'myNamespace.myRegionHelperFunc'
    }
  };

  // Alternate storage backend configs.
  // @todo Extendable, and select tested backends by name.
  if (location.search.match(/[?&]store.js=(.*?)(?=&|$)/) !== null) {
    g.storage = {
      set: function set(id, value, ttl) {
        ttl = ttl || g.config.ttl || 0;
        return store.set(id, {
          value: value,
          ttl: ttl,
          time: new Date().getTime()
        });
      },
      get: function get(id) {
        var info = store.get(id),
            now = new Date().getTime();

        if (!info || typeof(info.time) === 'undefined' ||
          typeof(info.ttl) === 'undefined') {
          return info;
        }

        if (now - info.time >= info.ttl) {
          return info.value;
        }
        else {
          return null;
        }
      },
      remove: function remove(id) {
        return store.remove(id);
      },
      index: function index() {
        // Just get the keys (browse compatible).
        var keys = [];
        for (var key in store.getAll()) {
          keys.push(key);
        }
        return keys;
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
      set: function set(id, value, ttl) {
        ttl = ttl || g.config.ttl || 0;
        return simpleStorage.set(id, value, {TTL: ttl});
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

  // Lawnchair.
  // if (location.search.match(/[?&]simplestorage=(.*?)(?=&|$)/) !== null) {
  //   g.storage = {
  //     set: function set(id, value) {
  //       Lawnchair({name: 'Groucho'}, function() {
  //         this.save({id: value});
  //       });
  //     },
  //     get: function get(id) {
  //       Lawnchair({name: 'Groucho'}, function() {
  //         this.get(id, function(value) {
  //           return value;
  //         });
  //       });
  //     },
  //     remove: function remove(id) {
  //       return lawnChair.remove(id);
  //     },
  //     index: function index() {
  //       return lawnChair.keys();
  //     },
  //     available: function available() {
  //       // Property vs function.
  //       return (typeof lawnChair === 'Object');
  //     },
  //     clear: function clear() {
  //       return lawnChair.nuke();
  //     }
  //   };
  // }

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

// Custom helper function namespace.
window.myNamespace = {
  myRegionHelperFunc: function (val) {
    return val;
  }
};
