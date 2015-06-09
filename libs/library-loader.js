/**
 * @file Dynamically load libraries, allows multi-version and alt library testing.
 */

(function libraryLoader() {

  /**
   * Load some version of some library.
   */
  function libraryParamInclude(libraries) {
    var version = false,
        found = false,
        paths = [];

    // Check for library params (honored in order).
    for (var lib in libraries) {
      version = location.search.match(new RegExp('[?&]' + lib + '=(.*?)(?=&|$)'));
      if (version) {
        found = true;
        // Use each path mask to add another include to the list.
        libraries[lib].map(function (pathMask) {
          paths.push(pathMask.replace('__VERSION__', version[1]));
        });
      }
    }

    // Use the default.
    if (!found) {
      paths.push(libraries.default);
    }

    // Put it on the page.
    for (var p in paths) {
      document.write('<script src="' + paths[p] + '"></script>');
    }
  }


  // Selector library.
  libraryParamInclude({
    'default': ['../libs/jquery/jquery.js'],
    'jquery': ['http://code.jquery.com/jquery-__VERSION__.js'],
    'zepto': [
      'http://rawgit.com/madrobby/zepto/v__VERSION__/src/zepto.js',
      'http://rawgit.com/madrobby/zepto/v__VERSION__/src/callbacks.js',
      'http://rawgit.com/madrobby/zepto/v__VERSION__/src/deferred.js'
    ],
    'sizzle': ['http://rawgit.com/jquery/sizzle/__VERSION__/src/sizzle.js']
  });

  // Storage library.
  libraryParamInclude({
    'default': ['../libs/jstorage/jstorage.js'],
    'storage': [],
    'jstorage': ['http://rawgit.com/andris9/jStorage/v__VERSION__/jstorage.min.js'],
    'store.js': ['http://rawgit.com/marcuswestin/store.js/v__VERSION__/store.min.js'],
    'simplestorage': ['//rawgit.com/andris9/simpleStorage/v__VERSION__/simpleStorage.js'],
    'lawnchair': ['//rawgit.com/brianleroux/lawnchair/__VERSION__/src/Lawnchair.js']
  });

}());
