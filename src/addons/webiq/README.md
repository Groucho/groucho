Groucho : WebIQ
==============

**How good is this user at internetting.**

This addon uses Groucho to track events which reveal the level of experience users have with web and computer norms. For example: using Ctrl+F on-page or tab in forms a good sign, while having to delete within forms much or doubleclicking on web links is likely a confused, or drunk, user.

## Install
Include the addon source, then update any config settings. Here are the defaults...

```html
  <!-- Base groucho includes -->
  <script src="groucho/addons/webiq/webiq.min.js"></script>
  <script>
  // Can be skipped for defaults.
  groucho.config.addons.webiq = {
    'behaviors': {
      'formsDelete': { 'increment': -1, 'threshold': 3, 'stash': 0 },
      'formsTab': { 'increment': 2 },
      'findOnPage': { 'increment': 4 },
      'doubleClick': { 'increment': -0.5 },
      'repeatPage': { 'increment': -3, 'threshold': 1 }
    }
  };
  </script>
</body>
```
You may have different views on the relative importance of behaviors, as this varies by audience. Free free to change values to suit your needs, or remove listeners altogether when not appropriate.

## Score
All you actually need to worry about is getting the score. This can be obtained whenever you please, here's any example use...

```javascript
$('form').submit(function() {
  $(this).find('.webIQScore').text(groucho.addons.webIQ.getScore());
});
```

## More Examples

You also have access to specific results...

```javascript
if (groucho.addons.webIQ.getScore('repeatPage') < -7) {
  $('.navigation').addClass('.jumbo');
}
```

As well as detailed results...
```javascript
var behaviors = groucho.config.addons.webiq.behaviors,
    scores;

$('form').submit(function() {
  scores = groucho.addons.webIQ.getScore();
  for (var b in behaviors) {
    $(this).find('.webIQScore.' + behaviors[b]).text(scores[behaviors[b]]));
  }
});
```

## New Behaviors
You can add your own scoring behaviors easily. Add the name and settings to the `behaviors` config within Groucho addons. The name will be used to call a coresponding function. You're responsible for: creating the matching function on the `groucho.adds.webIQ` object, listening for events and adding activities. The increment value will tell `getScore` how to tally your activity records. Here's an example...
```html
  <!-- Base groucho includes -->
  <script src="groucho/addons/webiq/webiq.min.js"></script>
  <script>
    /**
     * Listen: Clicking on non-link table headers.
     */
    groucho.config.addons.webIQ.behaviors.myBehavior = { 'increment': -5 };
    groucho.adds.webIQ.myTableBehavior = function myTableBehavior() {
      $('th').click(function() {
        if (!$(this).children('a').length) {
          groucho.createActivity('webIQ', { 'type': this.name });
        }
      });
    }
  </script>
</body>
```
