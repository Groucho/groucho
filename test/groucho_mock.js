/**
 * @file
 * Update meta data and settings found within a page.
 */

var groucho = window.groucho || {};

(function($, g) {

  // Default configs.
  g.config = {
    'taxonomyProperty': 'entityTaxonomy',
    'trackExtent': 5,
    'favThreshold': 1,
    'trackProperties': [
      'entityType',
      'entityTaxonomy',
      'entityBundle'
    ]
  };

  // Alternate storage backend configs.
  // @todo Extendable.
  if (location.search.match(/[?&]store.js=(.*?)(?=&|$)/) !== null) {


//console.log('Store.js');


    var store = window.store || {};
    g.storage = store;
    g.config.storage = {
      set: 'set',
      get: 'get',
      remove: 'remove',
      index: 'getAll',
      available: 'enabled',
      clear: 'clear'
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
