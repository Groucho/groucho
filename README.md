Groucho [![Build Status](https://travis-ci.org/tableau-mkt/groucho.svg?branch=master)](https://travis-ci.org/tableau-mkt/groucho) [![Test Coverage](https://codeclimate.com/github/tableau-mkt/groucho/badges/coverage.svg)](https://codeclimate.com/github/tableau-mkt/groucho) [![Code Climate](https://codeclimate.com/github/tableau-mkt/groucho/badges/gpa.svg)](https://codeclimate.com/github/tableau-mkt/groucho)
==============

**Know more about your anonymous users.**

This library uses in-browser localStorage to track people. Client-side activities are stashed, which rely on the presence of on-page meta data in the 'dataLayer.' This is useful for working with heavily cached, non-user-unique pages and adding __personalized front-end features__ on top. Size: 7k.

### [Full documentation](DOCS.md)

### Dependencies
1. [jQuery](http://jquery.com) - easy to use JS framework.
1. [jStorage](http://jstorage.info) - localStorage abstraction library [8k].
 * [JSON2](https://github.com/douglascrockford/JSON-js) - browser compatible JSON methods (if you care) [3k].
1. dataLayer - meta data standard.
1. [Data Layer Helper](https://github.com/google/data-layer-helper) - access dataLayer properties [2k].

## Installation
Include the dependencies on your pages, add groucho configs if you want to deviate from defaults, and output your data layer attributes. Your HTML should look a bit like this...

```html
<head>
  <script src="jquery.min.js"></script>
  <script src="json2.js"></script>
  <script src="jstorage.min.js"></script>
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
_Tested with jQuery: 1.5.2, 1.6.4, 1.7.2, 1.8.3, 1.9.1, 1.10.2, 1.11.1, 2.0.3, 2.1.1_

## Examples

### Favorites

React to your visitors' favorite tags/terms.

```javascript
var myFavs = groucho.getFavoriteTerms('my_vocab');
if (myFavs.length > 0) {
  // Pre-fill form field.
  $('input.pre-fill.my-vocab').val(myFavs[0].name);
}
```

_Results can include multiple terms if their hit counts are equal. These examples just use the first._

Generate favorites once then use results a few times on the page.

```javascript
groucho.getFavoriteTerms();

// Set a form filter, but enforce a threshold.
if (groucho.favoriteTerms.my_vocab[0].count >= 3) {
  $('form.personalize select.my-vocab').val(groucho.favoriteTerms.my_vocab[0].name);
  $('form.personalize').submit();
}

// Prune a list to personalize.
$('ul.peronalized li').each(function (index, element) {
  // Data attribute does not match user's favorite.
  if ($(this).attr('data-my_vocab') !== groucho.favoriteTerms.my_vocab[0].id) {
    $(this).addClass('hide');
  }
});
```

### Pageview Tracking

Use page view activity tracking to dig through history.

```javascript
var history = groucho.getActivities('browsing'),
    links = $('a.promoted'),
    count = 0;
for (var i in history) {
  // Determine if they've seen a page with a specific property.
  if (history[i].hasOwnProperty('myProperty') count++;
}
// Visually weight relevant content via past behavior.
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

### Basic User Info

Wait for data availability and user basic user info.

```javascript
(function ($) {
  $(document).ready(function(){
    groucho.userDeferred = groucho.userDeferred || $.Deferred();
    groucho.userDeferred.done(function () {
      // Act on a specific user property.
      var origin = $.jStorage.get('user.origin');
      adjustSomething(origin.url);
    }
 });
})(jQuery);
```
_Previous examples simplified._

### This is just a taste, [full docs](DOCS.md).

## Tests?
This library uses QUnit via Phantom for unit testing with Grunt.

### Thanks.
If you've read this far you might have some suggestions. Feel free to send those or make a merge request.
Find something wrong with these docs? Please send that along as well. Why groucho? ...because we can tell who you are with those silly glasses on.
