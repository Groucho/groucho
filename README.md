Groucho
==============

**Know more about your anonymous users.**

This library uses in-browser localStorage to track people. Client-side activities are stashed, which rely on the presence of on-page meta data in the dataLayer. This is useful for working with cached, non-user-unique pages and adding personalized front-end features on top.

### [Full documentation](DOCS.md)

### Dependencies
1. [jQuery](http://jquery.com) - easy to use JS framework.
1. [jStorage](http://jstorage.info) - localStorage abstraction library.
 * [JSON2](https://github.com/douglascrockford/JSON-js) - browser compatible JSON methods (if you care).
1. [dataLayer](https://developers.google.com/tag-manager/android/v3/reference/com/google/tagmanager/DataLayer) - client-side meta data standard. [See below.](#meta-data-output)
1. [Data Layer Helper](https://github.com/google/data-layer-helper) - access dataLayer properties.

## Installation
Include the dependencies on your pages, add groucho configs if you want to deviate from defaults, and output your data layer attributes. Your HTML should look a bit like this...
```html
<head>
  <script src="jquery.min.js"></script>
  <script src="jstorage.min.js"></script>
  <script src="json2.js"></script>
  <script src="data-layer-helper.js"></script>
  <script src="groucho.min.js"></script>
  <script>
  window.groucho = window.groucho || {};
  groucho.config = {
    'taxonomyProperty': 'tags',
    'trackExtent': 25,
    'trackProperties': ['pageId', 'title', 'type', 'tags']
  };
  </script>
</head>
<body>
  <script>
  dataLayer = [{
    "pageId" : "123",
    "title" : "My Cool Page",
    "type" : "article",
    "tags" : {
      "my_category" : {
        "123" : "My Term",
        "456" : "My Other Term"
      },
      "my_types" : {
        "555" : "My Type",
        "222" : "Another Type"
      }
    },
    'myProperty' : 'my value'
  }];
  </script>
</body>
```
## Examples

### Basic User Info

Make use of basic info about your users.
```javascript
(function ($) {
  $(document).ready(function(){
    // Ensure data availability.
    groucho.userDeferred = groucho.userDeferred || $.Deferred();

    groucho.userDeferred.done(function () {
      // Act on a user property.
      var origin = JSON.parse($.jStorage.get('user.origin'));
      adjustSomething(origin.url);
    }
 });
})(jQuery);
```
_All following examples don't include setup shown above._

### Favorites!

Make use of your visitors' favorite tags/terms.
```javascript
var myFavs = groucho.getFavoriteTerms('my_vocab');
if (myFavs.length > 0) {
  $('input.pre-fill.my-vocab').val(myFavs[0].name);
}
```
_Results can include multiple terms if their hit counts are equal. Examples just use the first._

Generate favorites once terms and use results a few times on the page.
```javascript
groucho.getFavoriteTerms();

// Enforce a threshold and react.
if (groucho.favoriteTerms.my_vocab[0].count >= 3) {
  $('select.my-filter').val(groucho.favoriteTerms.my_vocab[0].id);
}

// Trim a list to personalize.
$('ul.peronalized li').each(function (index, element) {
  // Data attribute does not match user's favorite.
  if ($(this).attr('data-my_vocab') !== groucho.favoriteTerms.my_vocab[0].name) {
    $(this).addClass('hide');
  }
});
```

### Pageview Tracking

Use page view activity tracking to dig through history.
```javascript
var history = groucho.getActivities('browsing'),
    links = $('a.promoted'),
    count;
for (var i in history) {
  // Determine if they've seen a page with a specific property.
  if (history[i].hasOwnProperty('myProperty') count++;
}
// Visual alter relevant content.
if (count < 2) links.addClass('feature');
else if (count > 2 && count < 7) links.addClass('reduce');
else links.addClass('hide');
```

## Custom Activies

Register your own tracking activities like this...
```javascript
// Track your own activities.
$('.my-special-links').bind('click', function (e) {
  groucho.createActivity('my_activity', {
    'linkText' : $(this).text(),
    'myProperty' : $(this).attr('data-property')
  });
});
// Later...
myActivites = groucho.getActivities('my_activity');
```

### This is just a taste, [full docs](DOCS.md).

## Tests?
This library uses QUnit via Phantom for unit testing with Grunt.

### Thanks.
If you've read this far you might have some suggestions. Feel free to send those or make a merge request.
Find something wrong with these docs? Please send that along as well.
