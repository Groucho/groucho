<img src="https://raw.githubusercontent.com/tableau-mkt/groucho/master/groucho.png?raw=true" height="30" style="bottom:2px"> Groucho [![Build Status](https://travis-ci.org/tableau-mkt/groucho.svg?branch=master)](https://travis-ci.org/tableau-mkt/groucho) [![Test Coverage](https://codeclimate.com/github/tableau-mkt/groucho/badges/coverage.svg)](https://codeclimate.com/github/tableau-mkt/groucho) [![Code Climate](https://codeclimate.com/github/tableau-mkt/groucho/badges/gpa.svg)](https://codeclimate.com/github/tableau-mkt/groucho)
==============

**Know more "anonymous" users. Scalable front-end personalization.**

This library uses in-browser localStorage to track people and allow easy personalization. Browsing and client-side activities are stashed, which rely on the presence of on-page meta data in the `dataLayer`. This is useful for working with heavily cached, non-user-unique pages and adding user-specific front-end features on top. Size: just 2k!

**Dependencies**

1. [jQuery](http://jquery.com) - easy to use JS framework.
1. [jStorage](http://jstorage.info) - localStorage abstraction library [8k].
 * [JSON2](https://github.com/douglascrockford/JSON-js) - browser compatible JSON methods (if you care) [3k].
1. dataLayer - meta data standard.
1. [Data Layer Helper](https://github.com/google/data-layer-helper) - access dataLayer properties [2k].

**Installation details in the [full docs](https://github.com/tableau-mkt/groucho/blob/master/DOCS.md).**


## Examples

### Favorites

React to your visitors' favorite tags/terms.

```javascript
var category = 'my-category',
    myFavs = groucho.getFavoriteTerms(category);

if (myFavs.length > 0) {
  // Pre-fill form elements with category, marked for it.
  $('input.pre-fill.' + category).each(function() {
    $(this).val(myFavs[0].name);
  });
}
```

_Results can include multiple terms if their hit counts are equal. Examples just use the first._


### Personalize

Filter and/or reveal content based on each users' personal preference.
```html
<div class="personalize">
  <span data-groucho-genre="pop">Lady Gaga</span>
  <span data-groucho-genre="rock">Led Zeppelin</span>
</div>

<div class="personalize hidden">
  <a href="/order-history" data-groucho-lead-status="customer">Past Orders</a>
</div>
```

Just run the `groucho.personalize()` function. Data attributes correlate to your `groucho.config.adjustments` settings.
```javascript
groucho.config.adjustments = {
  'genre': 'favorites',
  'lead-status': 'user',
};
groucho.personalize();
```

Properties of type `user` refer to those set with `setUserProperty()`, while favorites will search for valid Groucho favorites.  See [full docs](https://github.com/tableau-mkt/groucho/blob/master/DOCS.md#personalize) for advanced possibilities.


### Custom Favorites Uses

Generate all favorites once, then use results several times on the page.

```javascript
var category = 'my-category';
    display;

groucho.getFavoriteTerms();
if (groucho.favoriteTerms.hasOwnProperty(category)) {
  // Display current favs.
  for (var f in groucho.favoriteTerms[category]) {
    display.push(groucho.favoriteTerms[category][f].name);
  }
  $('.favorite-stuff').text(display.join(', '));
  // Set an AJAX form filter automatically.
  $('form.autoFavorite select.' + category).val(
    groucho.favoriteTerms[category][0].name
  );
  $('form.autoFavorite').submit();
}
```


### Pageview Tracking

Use raw page view activity to dig through history and alter UX.
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


### Custom Activies

Register your own tracking activities like this...
```javascript
$('.videos a.play').bind('click', function() {
  groucho.createActivity('watch', {'videoId': $(this).data('videoid')});
});
```

Retrieve activities later to personalize pages. Example swaps in the last watched video...
```javascript
var history = groucho.getActivities('watch');

if (history.length) {
  $.get("videos.json?id=" + history[0].videoId, function(data) {
    $('.recent').find('.title').text(data.title)
      .find('.graphic').text(data.graphic)
      .find('a').attr('href', data.url);
  });
}
```

### Basic User Info

Wait for data availability and use basic user info.
```javascript
(function ($) {
  $(document).ready(function(){
    groucho.userDeferred = groucho.userDeferred || $.Deferred();
    groucho.userDeferred.done(function () {
      // Act on a specific user property.
      var origin = getUserProperty('origin');
      adjustSomething(origin.url);
    }
 });
})(jQuery);
```
_Previous examples skip data deferral._

### Tasty bite? Try the [full docs](DOCS.md).

## Tests
This library uses QUnit via Phantom for unit testing via Grunt and Istambul for code coverage analysis.

### Thanks.
If you've read this far you might have some suggestions. Feel free to send those or make a merge request.
Find something wrong with these docs? Please send that along as well. Why groucho? ...because we can tell who you are with those silly glasses on.
