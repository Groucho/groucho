<img src="https://raw.githubusercontent.com/tableau-mkt/groucho/master/groucho.png?raw=true" height="30" style="bottom:2px"> Groucho [![Build Status](https://travis-ci.org/tableau-mkt/groucho.svg?branch=master)](https://travis-ci.org/tableau-mkt/groucho) [![Test Coverage](https://codeclimate.com/github/tableau-mkt/groucho/badges/coverage.svg)](https://codeclimate.com/github/tableau-mkt/groucho) [![Code Climate](https://codeclimate.com/github/tableau-mkt/groucho/badges/gpa.svg)](https://codeclimate.com/github/tableau-mkt/groucho)
==============

**Know more about your anonymous users. Scalable front-end personalization.**

This library uses in-browser localStorage to track people. Client-side activities are stashed, which rely on the presence of on-page meta data in the `dataLayer`. This is useful for working with heavily cached, non-user-unique pages and adding __personalized front-end features__ on top. Size: just 2k!

### [Full documentation](DOCS.md)

### Dependencies
1. Selector library, one of...
 * [jQuery](http://jquery.com) - JS library standard.
   - Tested: 1.5.2, 1.6.4, 1.7.2, 1.8.3, 1.9.1, 1.10.2, 1.11.1, 2.0.3, 2.1.1, 2.1.4
 * [Zepto](http://zeptojs.com) - Minimal jQuery alternative (core, callbacks, deferred).
   - Tested: 1.1.0, 1.1.4, 1.1.6
1. In-browser storage abstraction library. Configurable! Tested with...
 * [jStorage](http://jstorage.info) - localStorage or userData [8k].
   - Tested: 0.4.12
 * [Store.js](https://github.com/marcuswestin/store.js) - localStorage, globalStorage, and userData [3k].
   - Tested: 1.3.17
 * [simpleStorage](https://github.com/andris9/simpleStorage) - fork of jStorage [6k].
   - Tested: 0.1.3
1. [Data Layer Helper](https://github.com/google/data-layer-helper) - access "dataLayer" properties [2k].
1. [JSON2](https://github.com/douglascrockford/JSON-js) - old browser JSON methods (if you care) [3k].

_(Sizes are minified, pre-gzipped.)_


## Example Installation
Include the dependencies on your pages, add groucho configs if you want to deviate from defaults, and output your data layer attributes. Your HTML should look a bit like this...

```html
<script src="jquery.min.js"></script>
<script src="json2.min.js"></script>
<script src="jstorage.min.js"></script>
<script src="data-layer-helper.js"></script>
<script src="groucho.min.js"></script>
<script>
  dataLayer = [{
    'pageId' : 123,
    'title' : 'My Cool Page',
    'type' : 'article',
    'tags' : {
      'my_category' : {
        '123' : 'My Term',
        '456' : 'My Other Term'
      },
      'my_types' : {
        '555' : 'My Type',
        '222' : 'Another Type'
      }
    },
    'myProperty' : 'my value'
  }];
</script>
<script>
  var groucho = window.groucho || {};
  groucho.config = {
    'taxonomyProperty': 'tags',
    'trackExtent': 50,
    'favThreshold': 1,
    'trackProperties': ['type', 'tags']
  };
</script>
```

## Examples

### Favorites

React to your visitors' favorite tags/terms.

```javascript
var taxonomy = 'my_category',
    myFavs = groucho.getFavoriteTerms(taxonomy);

if (myFavs.length > 0) {
  // Pre-fill any marked form elements and the right taxonomy.
  $('input.pre-fill.' + taxonomy).each(function() {
    $(this).val(myFavs[0].name);
  });
}
```

_Results can include multiple terms if their hit counts are equal. Examples just use the first._

Generate all favorites once, then use results several times on the page.

```javascript
groucho.getFavoriteTerms();
var taxonomy = 'my_category';

if (groucho.favoriteTerms.hasOwnProperty(taxonomy)) {
  // Prune a list to personalize.
  $('ul.peronalized li').each(function() {
    // Data attribute does not match user's favorite.
    if ($(this).data(taxonomy) !== groucho.favoriteTerms[taxonomy][0].id) {
      $(this).addClass('hide');
    }
  });

  // Set an AJAX form filter automatically.
  $('form.personalize select.' + taxonomy).val(
    groucho.favoriteTerms[taxonomy][0].name
  );
  $('form.personalize').submit();
}
```

### Pageview Tracking

Use page view activity tracking to dig through history and alter UX.

```javascript
var history = groucho.getActivities('browsing'),
    links = $('a.promoted'),
    count = 0;
for (var i in history) {
  // Determine if they've seen a page with a specific property.
  if (history[i].hasOwnProperty('myProperty') count++;
}
// Visually weight content via past behavior.
if (count < 2) links.addClass('featured');
else if (count >= 2 && count < 7) links.addClass('reduced');
else links.addClass('hidden');
```
Show the last viewed item of a given type. Example is last watched video...

```javascript
var history = groucho.getActivities('watch');
if (history.length) {
  $.get("videos.json?id=" + history[0].videoId, function(data) {
    $('.recent').html(displayVideo(data));
  });
}
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

### Tasty bite? Try the [full docs](DOCS.md).

## Tests
This library uses QUnit via Phantom for unit testing via Grunt and Istambul for code coverage analysis.

### Thanks.
If you've read this far you might have some suggestions. Feel free to send those or make a merge request.
Find something wrong with these docs? Please send that along as well. Why groucho? ...because we can tell who you are with those silly glasses on.
