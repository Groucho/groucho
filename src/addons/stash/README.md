# Stash
Store and retreive users' behavioral state.

**Dependencies** _(see fingerprint)_
* [JSON.prune](https://github.com/Canop/JSON.prune)
* [CryptoJS](https://code.google.com/p/crypto-js)

### Interval
You can customize the save interval by setting `groucho.config.addons.stash.lifetime` to a number other than `45` seconds.


### Storage
This addon is written to use [FireBase][firebase] by default.  This is an easy to use, easy to test backend for client-side data storage.  Create an account, set a few configs, and you're off!
```javascript
groucho.config.addons.stash.firebaseAppId = 'abc123';
```

However, you can use any storage backend you want to save user states; just provide these three functions and the library will prefer them.

```javascript
groucho.config.addons.stash = {
  'setup': function() {
    var defer = $.Deferred();
    $.getScript('//cdn.example.com/myStorageBackend.js', function() {
      groucho.addons.stash.storage = new myStorageBackend();
      defer.resolve();
    });
  },
  'set': function(id, data) {
    groucho.addons.storage.mySet(id, data);
  },
  'get': function(id) {
    return groucho.addons.storage.myGet(id);
  }
}
```


### Indentity
By default, this addon uses a combination of server-side and client-side identifiers to "fingerprint" users; this requires two JS dependencies.  By default they are loaded asyncronously, which you can disable and host yourself by setting the `groucho.config.addons.stash.fingerprintCDN = false` variable.

If you'd like to use actual user accounts to attach behavior to, then you should override the `getId` function and simply use an ID as your  identifier.
```javascript
groucho.config.addons.stash.getId = function() {
  return myApp.user.userId;
};
```

Attach these override functions to the config object to be picked up by the addon.

[firebase]: https://www.firebase.com
