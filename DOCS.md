Groucho Docs
==============

* __[Getting started](#getting-started)__
 * [Local storage](#local-storage) - data storage basics
 * [User data space](#user-space) - standardized and guaranteed
 * [Page meta data](#meta-data-output) - available properties
* __[Pageview tracking](#pageview-tracking)__
 * Rich user browsing history
* __[Favorite terms](#favorite-terms)__
 * Aggregated profiling at the ready _(skip to the goodies)_
* __[Custom tracking](#custom-tracking)__
 * Stash and retrieve your own activities with ease!

## Getting Started
This library uses in-browser localStorage to track people. Client-side activities are stashed, which rely on the presence of on-page meta data in the dataLayer. This is useful for working with cached, non-user-unique pages and adding personalized front-end features on top. Size: 2k.

### Dependencies
1. [jQuery](http://jquery.com) - easy to use JS framework.
1. [jStorage](http://jstorage.info) - localStorage abstraction library [8k].
 * [JSON2](http://cdnjs.com/libraries/json2) - browser compatible JSON methods (if you care) [3k].
1. [dataLayer](https://developers.google.com/tag-manager/android/v3/reference/com/google/tagmanager/DataLayer) - client-side meta data standard. [See below.](#meta-data-output)
1. [Data Layer Helper](https://github.com/google/data-layer-helper) - access dataLayer properties [2k].

### Local Storage
This library uses in-browser key/value localStorage with the convenient jStorage abstraction library.
_See [jStorage](http://jstorage.info) for more info._

```javascript
// Set a value.
$.jStorage.set('myThing', 'neato');

// Get it later on some other page.
var myVal = $.jStorage.get('myThing');
```
You can can store objects just as easily as strings.

```javascript
var myObj = {
  'thing' : 'something',
  'cost' : 3,
  'percent' : 27
};
$.jStorage.set('mySave', myObj);

// Later access and use.
var myVal = $.jStorage.get('mySave');
alert(myVal.thing + ' = ' + (myObj.cost * myObj.percent * .01));
// Output: something = 0.81
```

### User Space
One of the basic features is just knowing where a user came from. Find that info organized like this...

```json
{
  "user.origin" : {
    "url" : "http://www.mysite.com/some-great-page?param=value",
    "timestamp" : "398649600",
    "referrer" : "http://www.anothersite.com/their-linking-page"
  },
  "user.session_origin" : {
    "url" : "http://www.mysite.com/recent-entry-point",
    "timestamp" : "398649999"
  }
}
```
To stash a single user property it's **recommended** to use the `user.property` key format.
To access user storage, it's **highly recommended** that you ensure the object is available. There can be a very small amount of time associated with jQuery + jStorage setup, additionally this keeps JS include order irrelevant which is good for robustness.

```javascript
(function ($) {
  $(document).ready(function(){
    // Ensure data availability.
    groucho.userDeferred = groucho.userDeferred || $.Deferred();

    groucho.userDeferred.done(function () {
      // Act on a user property.
      var origin = $.jStorage.get('user.origin');
      doSomethingNeato(origin.url);
    }
 });
})(jQuery);
```

### Meta Data Output
In order to do fun and fancy things on the client-side you need easy access to meta data about the pages of your site. Google has created a standard for this called the dataLayer. It's great for working with [Google Tag Manager](http://www.google.com/tagmanager), but is also a solid tool for front-end features on top of cached pages. For more documentation see: [API Reference](https://developers.google.com/tag-manager/android/v3/reference/com/google/tagmanager/DataLayer), [Developer Guide](https://developers.google.com/tag-manager/devguide), [Data Layer Helper](https://github.com/google/data-layer-helper).

If you're using a CMS outputing data might be super easy, eg: Drupal [module](https://www.drupal.org/project/datalayer), WordPress [plugin](https://wordpress.org/plugins/mokusiga-google-tag-manager/), [plugin](http://wordpress.org/plugins/gtm-data-layer/).

You can output whatever you want, but to work with Groucho you'll need it to look something like this...

```javascript
dataLayer = [{
  "language" : "en",
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
  }
}];
```
NOTE: The structure of taxonomy output is _particularly important_ to work with existing groucho functions. Vocabularies must be listed on a single property, with each tags beneath it as an ID and name. As you might expect-- getting user favorites will not work unless the taxonomy property is listed in the stored properties.

If you use Google Analytics or Google Tag Manager, you should be accessing dataLayer properties via the Data Layer Helper. You can't be certain the values you care about are in the first array position.

```javascript
var myHelper = new DataLayerHelper(dataLayer);
alert(myHelper.get('type'));
```

## Pageview Tracking
A user's browsing history is stored per page view. They exist in jStorage as key/value records...

```json
{
  "track.browsing.398649600" : {
    "url" : "http://www.mysite.com/some-great-page",
    "type" : "blog-post",
    "myProperty" : "my value"
  }
}
```
You'll want to stash specific info with each pageview activity record. You can control which dataLayer properties are stored and other options by setting configs on the `groucho` object. The tracking extent will be separately used for each type of activity stored.

```javascript
window.groucho = window.groucho || {};
groucho.config = {
  'taxonomyProperty' : 'tags',
  'trackExtent' : 50,
  'favThreshold' : 1,
  'trackProperties' : [
    'myPageTypes',
    'myAuthorIds',
    'myPageTags'
  ]
}
```
To write your own features, grab browsing history and work with it like this...

```javascript
$.each(groucho.getActivities('browsing'), function (key, record) {
  someComparison(record.property, record.url);
});
```
When returned by `groucho.getActivities()` activities will be an array for convenience.

```json
[{
  "_key" : "track.my_activity.398649600",
  "url" : "http://www.mysite.com/some-great-page",
  "type" : "blog-post",
  "pageValue" : "1",
  "tags" : {
    "my_category" : {
      "123" : "My Term"
    }
  }
},
{
  "_key" : "track.my_activity.398649999",
  "url" : "http://www.mysite.com/another-page",
  "type" : "product",
  "pageValue" : "5",
  "tags" : {
    "my_types" : {
      "555" : "My Type"
    }
  }
}]
```

## Favorite Terms
Now that you're locally stashing user activity-- let's use it. One great use is infering a person's favorite terms from their rich browsing history records. Because we know how many times a person has seen specific tags we can return counts. Recall that it's the `taxonomyProperty` from the global config that determines where tags are stored in meta data, this powers favorites.
_NOTE: A vocabulary can have more than one term returned if the hit count is the same._ You can request it, easy as pie...

```javascript
var favTerms = groucho.getFavoriteTerms();
```
Here's what you get back...

```json
{
  "my_category" : [{
    "id" : "123",
    "count" : 12,
    "name" : "My Term"
  }],
  "my_types" : [{
      "id" : "555",
      "count" : 4,
      "name" : "My Type"
    }, {
      "id" : "222",
      "count" : 4,
      "name": "Another Type"
  }]
}
```
The accuracy of user favorites can be improved by adjusting your `favThreshold`, which controls the term view count required to be returned as a favorite. The default is just 1 to allow easily getting setup, but it's recommended to boost that to at least 2 or 3. _You can still manually specify lower thresholds when calling the function._

Once favorites have been built once (with no arguments) it becomes available via `groucho.favoriteTerms` but you can run the function again to regenerate. Use the persistence to build favorites on page-load then access the vocabs you're interested in later.

A careful and full setup might look like this...

```javascript
(function ($) {
  groucho.userDeferred = groucho.userDeferred || $.Deferred();
  groucho.userDeferred.done(function () {
    groucho.getFavoriteTerms();
  });
})(jQuery);
```
Then in another script...

```javascript
(function ($) {
  $(document).ready(function() {
    var taxonomies = ['my_category', 'my_types'];
    // Set various form inputs.
    $.each(taxonomies, function(i, vocab) {
      if (groucho.favoriteTerms.hasOwnProperty(vocab)) {
        // Set various form inputs.
        $('select[data-vocab="' + vocab + '"]').val(
          groucho.favoriteTerms[vocab][0].id
        );
      }
    });
  });
})(jQuery);
```

### Specific Returns
Limit favorites to just the vocabulary you care about with an argument.

```javascript
var favCategoryTerms = groucho.getFavoriteTerms('my_category');
```
```json
[{
  "id": "123", "count": 12, "name": "My Term"
}]
```
You can also request **all term count data**. Default is false. Here shown by vocab...

```javascript
var seenCategoryTerms = groucho.getFavoriteTerms('my_category', true);
```
```json
[
  {"id": "123", "count": 12, "name": "My Term"},
  {"id": "456", "count": 3, "name": "My Other Term"}
]
```
Use a wildcard argument to see **all term count data in all vocabs** from pages seen by the user.

```javascript
var allSeenTerms = groucho.getFavoriteTerms('*', true);
```
```json
{
  "my_category" : [
    {"id": "123", "count": 12, "name": "My Term"},
    {"id": "456", "count": 3, "name": "My Other Term"}
  ],
  "my_types" : [
    {"id": "555", "count": 4, "name": "My Type"},
    {"id": "999", "count": 4, "name": "Another Type"}
    {"id": "876", "count": 1, "name": "Yet Another"}
  ]
}
```
You can also override the global threshold whening requesting favorites data. Example sets a high threshold, while returning pruned favorites only...

```javascript
var favCategoryTerms = groucho.getFavoriteTerms('*', false, 7);
```
```json
{
  "my_category" : [
    {"id": "123", "count": 12, "name": "My Term"}
  ]
}
```

## Custom Tracking!
You can register your own tracking activities like this...

```javascript
// Track your own activities.
$('.my-special-links').bind('click', function (e) {
  myObj.linkText = $(this).text()
  myObj.myProperty = $(this).attr('data-property');
  groucho.createActivity('my_activity', myObj);
});
```
They will be stored as key/value in jStorage. But can be returned as an array, filtered down to the group specified.

```javascript
var myActivities = groucho.getActivities('my_activity');
```
```json
[{
  "_key" : "track.my_activity.398649600",
  "linkText" : "Link text from page",
  "myProperty" : "the-property-value"
}, {
  "_key" : "track.my_activity.398649999",
  "linkText" : "Other link text",
  "myProperty" : "this-property-value"
}]
```
You can work directly with tracking activites and create your own smart functions...

```javascript
function myActivitySmarts () {
  var myActivities = groucho.getActivities('my_activity'),
      record;

  for (i in myActivities) {
    record = myActivities[i];
    if (myComparison(record.property, record.url, record._key.split('.')[2])) {
      count++;
    }
  }
  return count;
}
```

## Tests?
This library uses QUnit and Phantom for unit testing via Grunt. There are also some moderately behavioral tests used to confirm tracking activities. Istambul is used for code coverage analysis.

## Thanks.
If you've read this far you might have some suggestions. Feel free to send those or make a merge request.
Find something wrong with these docs? Please send that along as well.
