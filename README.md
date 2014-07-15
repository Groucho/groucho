Groucho
==============

**Know more about your anonymous users.**

* __[Getting started](#getting-started)__
 * [Local storage](#local-storage) - how the data storage works
 * [User data space](#user-space) - standardized and guaranteed
 * [Page meta data](#meta-data-output) - available properties
* __[Pageview tracking](#activity-tracking)__
 * [Collections](#collections) - included helper class
* __[Favorite terms](#favorite-terms)__
 * Aggregated profiling at the ready
* __[Custom tracking](#custom-tracking)__
 * Stash and retrieve your own activities with ease!

## Getting Started
This library uses in-browser localStorage to track people. Client-side activities are stashed, which rely on the presence of on-page meta data in the dataLayer. This is useful for working with cached, non-user-unique pages and adding personalized front-end features on top.

### Dependencies
1. [jQuery](http://jquery.com) - easy to use JS framework.
1. [jStorage](http://jstorage.info) - localStorage abstraction library.
 * [JSON2](https://github.com/douglascrockford/JSON-js) - browser compatible JSON methods (if you care).
1. [dataLayer](https://developers.google.com/tag-manager/android/v3/reference/com/google/tagmanager/DataLayer) - client-side meta data standard. [See below.](#meta-data-output)
1. [Data Layer Helper](https://github.com/google/data-layer-helper) - access dataLayer properties.


### Local Storage
This library uses in-browser key/value localStorage with the convenient jStorage abstraction library.
_See the [jStorage](http://jstorage.info) for more info._
```javascript
// Set a value.
$.jStorage.set('myThing', 'neato');

// Get it later on some other page.
var myVal = $.jStorage.get('myThing');
```
For ease of use you should stash data in JSON format, duh.
```javascript
var myObj = {
  'thing': 'something',
  'cost': 3,
  'percent': 27
};
$.jStorage.set('mySave', JSON.stringify(myObj));

// Later access and use.
var myVal = JSON.parse($.jStorage.get('mySave'));
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
To stash a single user property it's **recommended** to use a `user.property` key format.
To access user storage, it's **highly recommended** that you ensure the object is available. There can be a very small amount of time associated with jQuery + jStorage setup, additionally this keeps JS include order irrelevant which is good for robustness.
```javascript
(function ($) {
  $(document).ready(function(){
    // Ensure data availability.
    groucho.userDeferred = groucho.userDeferred || $.Deferred();

    groucho.userDeferred.done(function () {
      // Act on a user property.
      var origin = JSON.parse($.jStorage.get('user.origin'));
      doSomethingNeato(origin.url);
    }
 });
})(jQuery);
```

### Meta Data Output
In order to do fun and fancy things on the client-side you need easy access to meta data about the pages of your site. Google has created a standard for this called the dataLayer. It's great for working with [Google Tag Manager](http://www.google.com/tagmanager), but is also a solid tool for front-end features on top of cached pages. For more documentation see: [API Reference](https://developers.google.com/tag-manager/android/v3/reference/com/google/tagmanager/DataLayer), [Developer Guide](https://developers.google.com/tag-manager/devguide), [Data Layer Helper](https://github.com/google/data-layer-helper).

If you're using a CMS outputing data might be super easy, eg: Drupal [module](https://www.drupal.org/project/datalayer), WordPress [plugin](https://wordpress.org/plugins/mokusiga-google-tag-manager/), [plugin](http://wordpress.org/plugins/gtm-data-layer/).

You can output whatever you want, but to work with Groucho you'll need it to look something like this...
```json
{
  "language": "en",
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
}
```
NOTE: The structure of taxonomy output is particularly important to work with existing groucho functions, vocabularies must be listed on a single property, with tags beneath that with an ID and name property. As you might expect-- getting user favorites will not work unless the taxonomy property is listed in the stored properties.

## Activity Tracking
A user's browsing history is stored per page view. Here's an example record...
```json
{
  "track.browsing.398649600" : {
    "url" : "http://www.mysite.com/some-great-page",
    "type" : "blog-post",
    "myProperty" : "my value"
  }
}
```
To be more useful you'll want to stash more info with each activity record. You can control which properties are stored along with other configurations by setting configs on the `groucho` object.
```javascript
window.groucho = window.groucho || {};
groucho.config = {
  'taxonomyProperty': 'myPageTags',
  'trackExtent': 99,
  'trackProperties': [
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

### Collections
Because records are returned as objects simple array type operations can be annoying to work with if you don't use
a library like [Underscore](http://underscorejs.org) or [Lo-Dash](http://lodash.com). To avoid any more
dependencies the following class and methods were necessary and are available...
```javascript
var myResults = new groucho.Collection(groucho.getActivities('browsing')),
    // Use the keys from this group.
    resultsKeys = myResults.keys(),
    // Use the tracking objects in this group, the same as directly calling the
    // groucho.getActivities('my_activity') function.
    resultsObjects = myResults.get();

// Use the number of activities to output almost the same thing you'd get from iterating
// over the groucho.getActivities('my_activity') function.
for (var int = 0; i >= myResults.size(); i++) {
  console.log(resultsObjects[resultsKeys[i]]);
}
```
* `keys()` Returns a list of object properties, in this case tracking keys.
* `size()` Returns an int, just like `myArray.length`
* `get()` Returns the object you passed in.

## Favorite Terms
There's no point in locally stashing user activity unless you use it. One great use is infering a person's favorite terms from their rich browsing history records. Because we know how many times a person has seen specific tags we can return counts.
_NOTE: A vocabulary can have more than one term returned if the hit count is the same._ You can request it, easy as pie...
```javascript
var favTerms = groucho.getFavoriteTerms();
```
For clarity here's what you get back...
```json
{
  "my_category" : {
    "123" : {
      "count" : 12,
      "name" : "My Term"
    }
  },
  "my_types" : {
    "555" : {
      "count" : 7,
      "name" : "My Type"
    },
    "222" : {
      "count" : 7,
      "name" : "Another Type"
    }
  }
}
```
Once favorites have been built once (with no arguments) it becomes available via `groucho.favoriteTerms` or you run the function again to regenerate. This is useful if you'd like to build favorites once per page load and keep reusing it.

You can also grab it by initially generating favorites on-page load and accessing the vocab you're interested in later...
```javascript
(function ($) {
  $(document).ready(function(){

    groucho.getFavoriteTerms();

    // Later in another script.
    var myTypeFavs = groucho.favoriteTerms.my_types;

 });
})(jQuery);
```
You might use this with some kind of on-page AJAX reaction...
```javascript
var favData = groucho.favoriteTerms,
    vocab = 'my_category',
    myThreshold = 3,
    favVocabData,
    topTermId;

if (favData.hasOwnProperty(vocab)) {
  // Handle mulitple terms due to matching hit counts.
  // Read more about using a "Collection" below.
  favVocabData = new groucho.Collection(favData[vocab]);
  topTermId = favVocabData.keys()[0];
  // Honor some trigger threshold.
  if (favData[vocab][topTermId].count >= myThreshold) {
    // React to user profiling!
    doSomeCoolAjaxThing(topTermId);
  }
  else {
    // Exit, under threshold.
  }
}
```

### Specific Returns
Limit favorites to just the vocabulary you care about with an argument. NOTE: The return value will include the vocabulary name to stay consistent with other return values.
```javascript
var favThings = groucho.getFavoriteTerms('my_category');
```
```json
{
  "my_category" : {
    "123" : {
      "count" : 12,
      "name" : "My Term"
    }
  }
}
```
You can also request **all the data** for just one vocab...
```javascript
var allSeenTerms = groucho.getFavoriteTerms('my_category', true);
```
```json
{
  "my_category" : {
    "123" : {
      "count" : 12,
      "name" : "My Term"
    },
    "456" : {
      "count" : 3,
      "name" : "My Other Term"
    }
  }
}
```
If you want to see **all terms in all vocabs** from pages seen by the user, with a hit count, just pass `true` as a second function arg.
```javascript
var allSeenTerms = groucho.getFavoriteTerms('*', true);
```
Results will be extended to all seen terms, like this...
```json
{
  "my_category" : {
    "123" : {
      "count" : 12,
      "name" : "My Term"
    },
    "456" : {
      "count" : 3,
      "name" : "My Other Term"
    }
  },
  "my_types" : {
    "555" : {
      "count" : 7,
      "name" : "My Type"
    },
    "999" : {
      "count" : 7,
      "name" : "Another Type"
    }
  }
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
They will be stored and come back like this; filtered down to the group specified.
```json
{
  "track.my_activity.398649600" : {
    "linkText" : "Link text from page",
    "myProperty" : "the-property-value"
  },
  "track.my_activity.398649999" : {
    "linkText" : "Other link text",
    "myProperty" : "this-property-value"
  }
}
```
You can work with those activites via included functions...
```javascript
var myActivities = groucho.getActivities('my_activity');

// Iterate and do something neat.
$.each(myActivities, function (key, record) {
  // Use a stored property the URL and the timestamp.
  someComparison(record.property, record.url, key.split('.')[2]);
});
```

## Tests?
This library uses QUnit and Phantom for unit testing via Grunt.
There are also some moderately behavioral tests needed to confirm tracking activities.

## Thanks.
If you've read this far you might have some suggestions. Feel free to send those or make a merge request.
Find something wrong with these docs? Please send that along as well.
