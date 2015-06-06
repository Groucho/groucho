/**
 * @file
 * Update meta data and settings found within a page.
 */

window.groucho = window.groucho || {};

(function($, groucho) {

  // Default configs.
  groucho.config = {
    'taxonomyProperty': 'entityTaxonomy',
    'trackExtent': 5,
    'favThreshold': 1,
    'trackProperties': [
      'entityType',
      'entityTaxonomy',
      'entityBundle'
    ]
  };

  // Clear out past tests, unless explicitly not.
  if (!location.href.match(/\?noflush\=|&noflush\=/)) {
    groucho.storage.flush();
  }

})(jQuery, groucho);

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
