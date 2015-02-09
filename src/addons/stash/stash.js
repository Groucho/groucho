/**
 * @file Cold-storage and retrival.
 */

/*jshint forin: false */
/*global Firebase, CryptoJS */

groucho.addons = groucho.addons || {};
groucho.config.addons = groucho.config.addons || {};

(function ($, groucho) {

  // Defaults.
  var config = groucho.config.addons.stash;
  config.lifetime = (config.lifetime * 1000) || 45000;
  config.firebaseAppId = config.firebaseAppId || 'abc123';
  config.fingerprintCDN = true;


  // Main.
  groucho.addons.stash = {
    'storage': false,


    /**
     * Do some data transfering (overridable).
     */
    'setup': config.setup || function setup() {
      var defer = $.Deferred();
      $.getScript('//cdn.firebase.com/js/client/2.0.4/firebase.js', function() {
        groucho.addons.stash.storage = new Firebase(
          '//' + config.firebaseAppId + '.firebaseio.com/groucho-stash/' +
              groucho.addons.stash.getId()
        );
        defer.resolve();
      });
      return defer.promise();
    },


    /**
     * Stash user state (overridable).
     *
     * @param {string} id
     * @param {object} data
     */
    'set': config.set || function set(id, data) {
      groucho.addons.stash.storage.set({'id': id, 'data': data});
    },


    /**
     * Retreive stashed state (overridable).
     *
     * @param {string} id
     *
     * @return {object}
     */
    'get': config.get || function get(id) {
      groucho.addons.stash.storage.once(id, function(data) {
        return data.val();
      });
    },


    /**
     * Retrieve user identification (overridable).
     *
     * @return {string}
     */
    'getId': config.getId || function getId() {
      return groucho.addons.stash.fingerprint();
    },


    /**
     * Attempt state save.
     */
    'save': function save() {
      var now = Date.now(),
          timePassed = now - groucho.getUserProperty('stashTime');

      if ((timePassed > groucho.config.addons.stash.lifetime)) {
        groucho.addons.stash.fingerprint().done(function(print) {
          groucho.addons.stash.set(print, groucho.getActivities());
          groucho.setUserProperty('lastStash', now);
        });
      }
    },


    /**
     * Attempt to restore a previous session, merge/overwrite current.
     *
     * @param {string} id
     */
    'restore': function restore() {
      var data;
      groucho.addons.stash.fingerprint().done(function(print) {
        data = groucho.addons.stash.get(print);
        // Add records to storage on-top of existing.
        for (var record in data) {
          $.jStorage.set(record, data[record]);
        }
      });
    },


    /**
     * Obtain anoymous unique indentifier.
     *
     * @return {string}
     */
    'fingerprint': function fingerprint() {
      var print = groucho.getUserProperty('fingerprint');

      function makePrint() {
        var navigatorLite,
            data;

        // Client-side indicators.
        for (var member in navigator) {
          switch (typeof navigator[member]) {
            case 'object':
            case 'string':
            case 'boolean':
              navigatorLite[member] = navigator[member];
              break;

            case 'function':
              break;
          }
        }
        // Managable data representation hash.
        navigatorLite = JSON.prune(navigatorLite);
        data.navHash = CryptoJS.MD5(navigatorLite);
        data.UA = navigator.userAgent;
        data.userId = groucho.getUserProperty('id');

        // Server-side indicators.
        $.ajax({
          url: '//freegeoip.net/json/', type: 'POST', dataType: 'jsonp',
          success: function(loc) {
            data.ip = loc.ip;
            data.loc = loc.country_name + loc.region_code + loc.region_name + loc.time_zone;
            // Save print.
            print = CryptoJS.MD5(data);
            groucho.setUserProperty('fingerprint', print);
            // Return new fingerprint.
            return print;
          }
        });
      }

      // Quickly return a fingerprint.
      if (print !== null) {
        return print;
      }
      else {
        // Easy CDN dependencies.
        if (config.fingerprintCDN) {
          $.when(
            $.getScript('//cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/rollups/md5.js'),
            $.getScript('http://dystroy.org/JSON.prune/JSON.prune.js')).done(function() {
              makePrint();
          });
        }
        else {
          // Created fresh.
          makePrint();
        }
      }
    }

  };


  groucho.addons.stash.setup().done(function() {
    setTimeout(groucho.addons.stash.save(), config.lifetime + 500);
  });

})(jQuery, groucho);


/**
 * Polyfill.
 */
if (!Date.now) {
  Date.now = function now() {
    return new Date().getTime();
  };
}
