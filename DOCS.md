Groucho Docs
==============

* __[Getting started](#getting-started)__
 * [Install](#install) - dependencies, config, dataLayer.
 * [User data space](#user-space) - standardized and guaranteed.
 * [Page meta data](#meta-data-output) - available properties.
* __[Favorite terms](#favorite-terms)__
 * [Concepts](#concepts) - aggregated profiling at the ready.
 * [Advanced queries](#advanced-queries) - control what data is returned.
* __[Personalize](#personalize)__
 * Adjust page content per user.
* [Pageview tracking](#pageview-tracking)
 * Rich user browsing history.
* [Custom tracking](#custom-tracking)
 * Stash and retrieve your own activities with ease!
* [Local storage](#local-storage) - data storage basics.

## Getting Started
This library uses in-browser localStorage to track people and allow easy personalization. Browsing and client-side activities are stashed, which rely on the presence of on-page meta data in the `dataLayer`. This is useful for working with heavily cached, non-user-unique pages and adding user-specific front-end features on top.

## Install
Include the dependencies on your pages, add groucho configs if you want to deviate from defaults, and output your data layer attributes. Your HTML should look a bit like this...

```html
  <script src="jquery.min.js"></script>
  <script src="json2.min.js"></script>
  <script src="jstorage.min.js"></script>
  <script src="data-layer-helper.js"></script>
  <script src="groucho.min.js"></script>
  <script>
    var groucho = window.groucho || {};
    groucho.config = {
      'trackExtent': 50,
      'taxonomyProperty': 'tags',
      'favThreshold': 1,
      'trackProperties': ['type', 'tags', 'myProperty'],
      'adjustments': [
        {'status': 'user'},
        {'my-category': 'favorites'}
      ]
    };
  </script>
  <script>
    dataLayer = [{
      "pageId" : 123,
      "title" : "My Cool Page",
      "type" : "article",
      "tags" : {
        "my-category" : {
          "123" : "My Term",
          "456" : "My Other Term"
        },
        "my-types" : {
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


### User Space
One of the basic features is just knowing where a user came from. Access data like this...
```javascript
getUserProperty('origin');
getUserProperty('session_origin');
```

The local storage data is organized like this...

```json
console.log($.jStorage.get('user.origin'));
{
  "url" : "http://www.mysite.com/some-great-page?param=value",
  "timestamp" : "398649600",
  "referrer" : "http://www.anothersite.com/their-linking-page"
}

console.log($.jStorage.get('user.session_origin'));
{
  "url" : "http://www.mysite.com/recent-entry-point",
  "timestamp" : "398649999"
}
```
To set your own user property use the `setUserProperty('myProperty', 'value')` function.  To access variables use `getUserProperty('myProperty')`, you get a strcutured return incliding the timestamp if you pass a second param as `true`. _It can be handy to ensure the user object is available; all libraries need to be available, values need to be set, etc. To be super safe, wrap all groucho actions in this deferral._

```javascript
(function ($) {
  // Ensure data availability.
  groucho.userDeferred = groucho.userDeferred || $.Deferred();
  groucho.userDeferred.done(function () {
    // Act on a user property.
    var origin = getUserProperty('origin');
    doSomethingNeato(origin.url);
  }
})(jQuery);
```

### Meta Data Output
In order to do fun and fancy things on the client-side you need easy access to meta data about the pages of your site. Google has created a standard for this called the dataLayer. It's great for working with [Google Tag Manager](http://www.google.com/tagmanager), but is also a solid tool for front-end features on top of cached pages. For more documentation see: [API Reference](https://developers.google.com/tag-manager/android/v3/reference/com/google/tagmanager/DataLayer), [Developer Guide](https://developers.google.com/tag-manager/devguide), [Data Layer Helper](https://github.com/google/data-layer-helper).

If you're using a CMS outputing data might be super easy, eg: Drupal [module](https://www.drupal.org/project/datalayer), WordPress [plugin](https://wordpress.org/plugins/mokusiga-google-tag-manager/), [plugin](http://wordpress.org/plugins/gtm-data-layer/).

You can output whatever you want, but to work with Groucho you'll need it to look something like this...

```javascript
dataLayer = [{
  "language" : "en",
  "pageId" : 123,
  "title" : "My Cool Page",
  "pageType" : "article",
  "authorId" : 555,
  "tags" : {
    "my-category" : {
      "123" : "My Term",
      "456" : "My Other Term"
    },
    "my-types" : {
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


## Favorite Terms

### Concepts
Now that you're locally stashing user activity-- let's use it. One great use is infering a person's favorite terms from their rich browsing history records. Because we know how many times a person has seen specific tags we can return counts. Recall that it's the `taxonomyProperty` from the global config that determines where tags are stored in meta data, this powers favorites.
_NOTE: A vocabulary can have more than one term returned if the hit count is the same._ You can request it, easy as pie...

```javascript
var favTerms = groucho.getFavoriteTerms();
```
Here's what you get back...

```json
{
  "my-category" : [{
    "id" : 123,
    "count" : 12,
    "name" : "My Term"
  }],
  "my-types" : [{
      "id" : 555,
      "count" : 4,
      "name" : "My Type"
    }, {
      "id" : 222,
      "count" : 4,
      "name": "Another Type"
  }]
}
```
The accuracy of user favorites can be improved by adjusting your `favThreshold`, which controls the term view count required to be returned as a favorite. The default is just 1 to allow easily getting setup, but it's recommended to boost that to at least 2 or 3. _You can still manually specify lower thresholds when calling the function._

Once favorites have been built once (on the page, with no arguments) data becomes available via `groucho.favoriteTerms`, or you can run the function again to generate fresh. Use the persistence to build favorites on page-load then access the vocabs you're interested in later.

### Advanced queries
Limit favorites to just the vocabulary you care about with an argument.

```javascript
var favCategoryTerms = groucho.getFavoriteTerms('my-category');
```
```json
[{
  "id": 123, "count": 12, "name": "My Term"
}]
```
You can also request **all term count data**. Default is false. Here shown by vocab...

```javascript
var seenCategoryTerms = groucho.getFavoriteTerms('my-category', true);
```
```json
[
  {"id": 123, "count": 12, "name": "My Term"},
  {"id": 456, "count": 3, "name": "My Other Term"}
]
```
Use a wildcard argument to see **all term count data in all vocabs** from pages seen by the user.

```javascript
var allSeenTerms = groucho.getFavoriteTerms('*', true);
```
```json
{
  "my-category" : [
    {"id": 123, "count": 12, "name": "My Term"},
    {"id": 456, "count": 3, "name": "My Other Term"}
  ],
  "my-types" : [
    {"id": 555, "count": 4, "name": "My Type"},
    {"id": 999, "count": 4, "name": "Another Type"}
    {"id": 876, "count": 1, "name": "Yet Another"}
  ]
}
```
You can also override the global threshold whening requesting favorites data. Example sets a high threshold, while returning pruned favorites only...

```javascript
var favCategoryTerms = groucho.getFavoriteTerms('*', false, 7);
```
```json
{
  "my-category" : [
    {"id": "123", "count": 12, "name": "My Term"}
  ]
}
```


## Personalize

You can easily filter and/or reveal content based on each users' personal preference. The markup allows for both initally hidden and initally shown panes and elements.
```html
<div class="personalize">
  You should
  <span data-groucho-preferred-media="videos">watch</span>
  <span data-groucho-preferred-media="podcasts">listen</span>
  to
  <span data-groucho-genre="pop">Lady Gaga</span>
  <span data-groucho-genre="rock">Led Zeppelin</span>
  and eat
  <span data-groucho-dietary="vegetarian" class="hidden">kale treats</span>
  <span data-groucho-dietary="default">pizza</span>
</div>

<div class="personalize hidden">
  <a href="/order-history" data-groucho-lead-status="customer">Past Orders</a>
</div>
```

When your page is built run the `groucho.personalize()` function. This will find _"panes"_ with the class `personalize` and process each element with any `data-groucho-ADJUSTMENT="VALUE"` data attribute. The suffix must correlate to an adustment registered within: `groucho.config.adjustments`.  You can reference localStorage values in several ways...
```javascript
groucho.config.adjustments = {
  'genre': 'favorites',
  'dietary': 'user',
  'preferred-media': {'key': 'myMediaChoice'},
  'lead-status': {'key': 'CRMConnector', 'property': 'status'}
};
groucho.personalizeInit();
groucho.personalize();
```

Properties of type `user` refer to those set with `setUserProperty()`, while favorites will search for valid Groucho favorites.  With any `storage` adjustments the localStorage key will obtain a user preference from either strings or  objects.

You can provide default content using `data-groucho-ADJUSTMENT="default"` to pick if no preference exists.  Default elements will act if matching content was found.  Default content is a great place to provide actions that populate favorites or user properties.

NOTE: You'll need to run `groucho.personalizeInit()` in order to hide elements, or opt to include a CSS rule like `.personalize.hidden, .personalize .hidden { display:none }` This library is purely JS at this time.

_This config/DOM structure requires data attribute labels to be unique acress sources, but that's a good limitation._


## Custom Tracking
You can register your own tracking activities like this...

```javascript
$('.videos a.play').bind('click', function() {
  groucho.createActivity('watch', {
    'videoId' : $(this).data('videoId'),
    'category' : $(this).data('category'),
    'videoTitle' : $(this).text()
  });
});
```
They will be stored as key/value in jStorage. But can be returned as an array, filtered down to the group specified. Remember to structure the condition.

```javascript
var myActivities = groucho.getActivities('watch');
```

```json
[{
  "_key" : "track.watch.398649600",
  "videoId" : 456,
  "category" : "tutorial",
  "videoTitle" : "Learn About Something"
}, {
  "_key" : "track.watch.398649999",
  "videoId" : 789,
  "category" : "fun",
  "videoTitle" : "Be Entertained"
}]
```
You can work directly with tracking activites and create your own smart functions. This example finds tutorial videos watched in the last week...


```javascript
function recentVideos(timeframe, category) {
  var conditions = [{'type' : [category]}],
      activityList = groucho.getActivities('watch', conditions),
      now = new Date().getTime(),
      recentList = [],
      timestamp;

  for (var i in activityList) {
    timestamp = activityList[i]._key.split('.')[2]);
    if (timestamp > (now - timeframe)) {
      recentList.push({
        'videoTitle' : activityList[i].videoTitle,
        'url' : activityList[i].url
      });
    }
  }

  return recentList;
}

$.each(recentVideos(604800, 'tutorial'), function() {
  newItem = '<li><a href="' + this.url + '">' + this.videoTitle + '</a></li>';
  $('ul.recentlyWatched').append(newItem);
});
```
_...but you shouldn't insert HTML this way._


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
You'll want to stash specific info with each pageview activity record. You can control which dataLayer properties are stored and other options by setting configs on the `groucho.config` object. The tracking extent will be separately used for each type of activity stored.

```javascript
var groucho = window.groucho || {};
groucho.config = {
  'taxonomyProperty' : 'tags',
  'trackExtent' : 50,
  'favThreshold' : 1,
  'trackProperties' : [
    'pageType',
    'authorId',
    'tags'
  ]
}
```

To write your own features, grab browsing history and work with it. You'll need to use a little structure to define the condition, in this case: the name of the tracking group...

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
  "pageValue" : 1,
  "tags" : {
    "my-category" : {
      "123" : "My Term"
    }
  }
},
{
  "_key" : "track.my_activity.398649999",
  "url" : "http://www.mysite.com/another-page",
  "type" : "product",
  "pageValue" : 5,
  "tags" : {
    "my-types" : {
      "555" : "My Type"
    }
  }
}]
```


### Local Storage
This library uses in-browser key/value localStorage with the convenient jStorage abstraction library. If you're new to localStorage, it's no big deal and is a new tool we should all be using.
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

## Tests?
This library uses QUnit via Phantom for unit testing via Grunt and Istambul for code coverage analysis. There are also some moderately behavioral tests used to confirm tracking activities. Istambul is used for code coverage analysis.

## Thanks.
If you've read this far you might have some suggestions. Feel free to send those or make a merge request.
Find something wrong with these docs? Please send that along as well.
