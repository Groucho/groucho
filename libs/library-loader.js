/**
 * @file Dynamically load libraries, allows multi-version and alt library testing.
 */

/* jslint browser:true */
/* jshint -W060 */
/* globals Promise:false */

/**
 * Add event, used for waiting to run tests.
 */
function addEvent(elem, event, fn) {
  if (elem.addEventListener) {
    elem.addEventListener(event, fn, false);
  }
  else {
    elem.attachEvent('on' + event, function() {
      // set the this pointer same as addEventListener when fn is called
      return(fn.call(elem, window.event));
    });
  }
}

/**
 * File loader with promise emitter.
 *
 * @param {string} path
 */
function simpleInclude(path) {
  return new Promise(function (resolve, reject) {
    var script = document.createElement('script');

    script.src = path;
    document.head.appendChild(script);
    //console.log('loading: ' + path);

    script.onload = function() {
      //console.log('loaded: ' + path);
      resolve();
    };
    script.addEventListener('error', function() {
      reject();
    }, true);
  });
}


/**
 * Load required libraries based on params.
 *
 * @param {array} dependencies
 *   List of dependencies, which can contain mulitple files to load.
 *
 * @return {Promise}
 */
function libraryLoader(dependencies) {
  var libPromise,
      current,
      previous;

  /**
   * Load some version of some library.
   *
   * @param {array}
   */
  function libraryParamInclude(libraries) {
    var version = false,
        paths = [],
        loadedPromise,
        current,
        previous;

    /**
     * Replace version mask with actual version in filepath.
     *
     * @param {string} pathMask
     * @param {string} version
     *
     * @return {string}
     */
    function replaceVersion(pathMask, version) {
      return pathMask.replace('__VERSION__', version);
    }

    // Check for library params (honored in order).
    for (var lib in libraries) {
      version = window.location.search.match(new RegExp('[?&]' + lib + '=(.*?)(?=&|$)'));

      if (version && version.length) {
        // Use each path mask to add another include to the list.
        libraries[lib].map(function (pathMask) {
          paths.push(replaceVersion(pathMask, version[1]));
        });
      }
    }

    // Use the default.
    if (!paths.length) {
      paths.push(libraries.default);
    }

    // Sequential file loading.
    loadedPromise = paths.reduce(function (previous, current) {
      return previous.then(function () {
        if (current) {
          return simpleInclude(current);
        }
        else {
          return Promise.resolve(true);
        }
      });
      // Initial promise to kick off the chain.
    }, Promise.resolve(true));

    // All paths loaded.
    return loadedPromise;
  }

  // Sequential library loading.
  libPromise = dependencies.reduce(function (previous, current) {
    return previous.then(function () {
      return libraryParamInclude(current);
    });
    // Initial promise to kick off the chain.
  }, Promise.resolve(true));

  return libPromise;
}
