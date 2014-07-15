/**
 * @file
 * Update meta data and settings found within a page.
 */

(function($) {

  // Clear out past tests, unless explicitly not.
  if (!location.href.match(/\?noflush\=|&noflush\=/)) {
    $.jStorage.flush();
  }

})(jQuery);

window.groucho = window.groucho || {};
groucho.config = {
  'taxonomyProperty': 'entityTaxonomy',
  'trackExtent': 25,
  'trackProperties': [
    'entityType',
    'entityTaxonomy',
    'entityBundle'
  ]
};

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
