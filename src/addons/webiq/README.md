Groucho : WebIQ
==============

**Know the general web experience of your users.**

This add on uses Groucho to track events revealing to the level of experience users have with web and computer norms. For example: using Ctrl+F on-page or tab in forms a good sign, while having to delete in forms much or doubleclicking on web pages is likely an confused, or drunk, user.

## Installation
Register the addon within Groucho config, then alter your behavior settings.
```html
<head>
  <script src="groucho/addons/webiq/webiq.min.js"></script>
  <script>
  groucho.config.addons.webiq = {
    'startScore': 0,
    'behaviors': {
      'formsDelete': { 'increment': '-1', 'theshold': 3, 'stash': 0 },
      'formsTab': { 'increment': '2' },
      'findOnPage': { 'increment': '4' },
      'doubleClick': { 'increment': '.5' }
    }
  };
  </script>
</head>
<body>
```
## Score

All you actually need to worry about it getting the score. This can be obtained whenever you please with the following function: `groucho.addons.webiq.getScore()`.

## Adjusting Settings
You may have different views on the relative importance of behaviors. This may also vary by audience. Free free to change values to suit your needs, or remove listeners altogether when not appropriate.

## New Behaviors
You can add your own scoring behaviors easily. Add the name and settings to the `behaviors` config within Groucho addons. The name will be used to call a coresponding function. You're responsible then for creating the function, listening for events and adding activities. Be sure to add an increment value or the `getScore` function won't know how to make use of your activity records. Use existing functions as a template.
