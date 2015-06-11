/**
 * @file Dynamically load libraries, allows multi-version and alt library testing.
 */

/* jslint browser:true */
/* jshint -W060 */

function simpleInclude(path) {
  return new Promise(function (resolve, reject) {
    var script = document.createElement('script');
    script.src = path;
    document.head.appendChild(script);


console.log(path);


    script.onload = function() {
      console.log('loaded: ' + path);
      resolve();
    };
  });
}

function libraryLoader() {
  return new Promise(function (resolve, reject) {

    /**
     * Load some version of some library.
     */
    function libraryParamInclude(libraries) {
      var version = false,
          paths = [],
          promises = [];

      function replaceVersion(pathMask, version) {
        return pathMask.replace('__VERSION__', version);
      }

      // Check for library params (honored in order).
      for (var lib in libraries) {
        version = window.location.search.match(new RegExp('[?&]' + lib + '=(.*?)(?=&|$)'));

        if (version && version.length) {
          // Use each path mask to add another include to the list.
          libraries[lib].map(function(pathMask) {
            paths.push(replaceVersion(pathMask, version[1]));
          });
        }
      }

      // Use the default.
      if (!paths.length) {
        paths.push(libraries.default);
      }

      // Load library file(s).
      for (p in paths) {
        promises.push(simpleInclude(paths[p]));
      }

      // All paths loaded.
      return Promise.all(promises);
    }

    // Selector libraries to allow (returns promise).
    libraryParamInclude({
      'default': '../libs/jquery/jquery.js',
      'jquery': ['http://code.jquery.com/jquery-__VERSION__.js'],
      'zepto': [
        'http://rawgit.com/madrobby/zepto/v__VERSION__/src/zepto.js',
        'http://rawgit.com/madrobby/zepto/v__VERSION__/src/callbacks.js',
        'http://rawgit.com/madrobby/zepto/v__VERSION__/src/deferred.js'
      ]
      //'sizzle': ['http://rawgit.com/jquery/sizzle/__VERSION__/src/sizzle.js']
    })
    .then(function() {
      // Storage libraries to allow (returns promise).
      return libraryParamInclude({
        'default': '../libs/jstorage/jstorage.js',
        'storage': [],
        'jstorage': ['http://rawgit.com/andris9/jStorage/v__VERSION__/jstorage.min.js'],
        'store.js': ['http://rawgit.com/marcuswestin/store.js/v__VERSION__/store.min.js'],
        'simplestorage': ['//rawgit.com/andris9/simpleStorage/v__VERSION__/simpleStorage.js'],
        'lawnchair': ['//rawgit.com/brianleroux/lawnchair/__VERSION__/src/Lawnchair.js']
      });
    })
    .then(resolve);

  });
};
