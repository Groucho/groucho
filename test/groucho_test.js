/**
 * @file QUnit tests.
 */

(function ($, groucho) {
  /*
    ======== A Handy Little QUnit Reference ========
    http://api.qunitjs.com/

    Test methods:
      module(name, {[setup][ ,teardown]})
      test(name, callback)
      expect(numberOfAssertions)
      stop(increment)
      start(decrement)
    Test assertions:
      ok(value, [message])
      equal(actual, expected, [message])
      notEqual(actual, expected, [message])
      deepEqual(actual, expected, [message])
      notDeepEqual(actual, expected, [message])
      strictEqual(actual, expected, [message])
      notStrictEqual(actual, expected, [message])
      throws(block, [expected], [message])
  */

  module('jQuery#groucho', {
    // This will run before each test in this module.
    setup: function() {
      this.elems = $('#qunit-fixture').children();
    }
  });


  module('Basics');

  test('Init', 5, function () {
    ok((typeof groucho.storage === "object"), 'Storage object is an object');
    if (typeof groucho.storage.available === 'function') {
      ok(groucho.storage.available(), 'Storage available function exists');
    }
    else {
      ok(groucho.storage.available, 'Storage available property exists');
    }
    ok((typeof groucho.storage.index()), 'Index is available');
    ok(groucho, 'Main namespace exists');
    ok((typeof groucho === "object"), 'Namespace object is an object');
  });


  module('Tracking');

  test('Scafolding', function() {
    var functions = [
      'getFavoriteTerms',
      'getActivities',
      'createActivity',
    ];
    expect(functions.length);

    for (var f in functions) {
      strictEqual(
        typeof groucho[functions[f]],
        'function',
        'Function exists: ' + functions[f]
      );
    }
  });

  test('Pageview activities', function() {
    var myResults = groucho.getActivities('browsing'),
        fakeData = { 'meainingLess': 'info' },
        timeout = 0,
        origin = groucho.storage.get('user.origin');

    strictEqual(
      myResults.length,
      1,
      'Page load activity recorded'
    );
    strictEqual(
      myResults[0].url.split('?')[0].slice(-12),
      'groucho.html',
      'Recorded url is present and correct'
    );
    strictEqual(
      myResults[0][groucho.config.taxonomyProperty].my_types['13'],
      'Some Tag',
      'Taxonomy term hit record is present on first tracking activity record'
    );

    // Alter page meta data for testable activity results.
    delete dataLayer[0][groucho.config.taxonomyProperty].my_types[14];
    dataLayer[0][groucho.config.taxonomyProperty].my_category['27'] = 'Yet Another';
    history.pushState('', 'New Page Title', window.location + '#another-page');

    // Attempt a second origin track, which should do nothing.
    groucho.trackOrigins();
    deepEqual(origin, groucho.storage.get('user.origin'), 'Origin remains intact');

    stop();

    window.setTimeout(function () {

      // Manually create another browsing record.
      groucho.trackHit();
      myResults = groucho.getActivities('browsing');
      strictEqual(
        myResults.length,
        2,
        'Second activity recorded'
      );

      start();

      ok(
        !myResults[1][groucho.config.taxonomyProperty].my_types.hasOwnProperty(14),
        'Second activity does not include removed taxonomy term.'
      );
    }, 1000);

    // Limited tracking extext.
    for (var i = 0; i < (groucho.config.trackExtent + 3); i++) {
      // Prevent clobbering.
      timeout = i * 150;
      stop();
      setTimeout(function () {
          groucho.createActivity('fake_thing', fakeData);
        start();
      }, timeout);
    }

    // Wait till records are created.
    stop();
    setTimeout(function () {

      strictEqual(
        groucho.getActivities('fake_thing').length,
        groucho.config.trackExtent,
        'Tracking activities are kept within the configured extent'
      );
      ok(
        groucho.getActivities().length > groucho.config.trackExtent,
        'All activies together are more than extent due to multiple types'
      );

      // Return all activities.
      strictEqual(
        groucho.getActivities().length,
        groucho.storage.index().length,
        'All storage items returned with general activity call'
      );

      start();
    }, 1500);

  });

  test('External localStorage use', 1, function () {
    // Set an unexpected localStorage value to attempt to gum up the works.
    groucho.storage.set('nonStandardValue', 'junk');
    strictEqual(
      typeof groucho.getActivities(),
      'object',
      'All activities returned as array even with non-standard value set'
    );
  });


  module('Favorites');

  // @todo Need a test for ascending counts in favorites list.

  test('Default', 7, function () {
    var favData = groucho.getFavoriteTerms();

    deepEqual(
      Object.prototype.toString.call(favData),
      "[object Object]",
      'Default function call returns an object'
    );
    deepEqual(
      Object.keys(favData),
      [ "my_category", "my_types" ],
      'All vocabs listed within favorites default function call'
    );
    strictEqual(
      typeof favData.my_types[0].count,
      'number',
      'Count number present on at least first favorite term'
    );
    strictEqual(
      favData.my_category[0].count,
      2,
      'Count number on first favorite term is two'
    );
    strictEqual(
      favData.my_category.length,
      2,
      'Both, but only two, terms from first vocab are included in results'
    );
    strictEqual(
      favData.my_types.length,
      1,
      'Only one term from second vocab is included in results'
    );
    ok(
      favData.my_types[0].id !== 14,
      'Second term from second vocab is not returned'
    );
  });

  test('One vocab', 4, function () {
    var favDataMyTypes = groucho.getFavoriteTerms('my_types');

    deepEqual(
       Object.prototype.toString.call(favDataMyTypes),
      "[object Array]",
      'Vocab argument function call returns an array'
    );
    strictEqual(
      favDataMyTypes[0].count,
      2,
      'Count number on first favorite term is two'
    );
    deepEqual(
      favDataMyTypes,
      [{ "id" : "13", "count" : 2, "name" : "Some Tag" }],
      'Correct term is returned within requested vocab function call'
    );
    strictEqual(
      Object.keys(favDataMyTypes).length,
      1,
      'Only one term is returned within requested vocab function call'
    );
  });

  test('One vocab, all data', 4, function () {
    var favDataMyTypesAll = groucho.getFavoriteTerms('my_types', true);

    deepEqual(
       Object.prototype.toString.call(favDataMyTypesAll),
      "[object Array]",
      'Requested vocab two argument function call returns an array'
    );
    strictEqual(
      favDataMyTypesAll.length,
      2,
      'Both terms are returned with two argument function call'
    );
    strictEqual(
      favDataMyTypesAll[0].count,
      2,
      'Count number on first favorite term is two'
    );
    strictEqual(
      favDataMyTypesAll[1].count,
      1,
      'Count number on second favorite term is one'
    );
  });

  test('All vocabs, all data', 3, function () {
    var favDataAll = groucho.getFavoriteTerms('*', true);

    deepEqual(
      Object.keys(favDataAll),
      [ "my_category", "my_types" ],
      'All vocabs listed within favorites all data, all vocabs function call'
    );
    strictEqual(
      favDataAll.my_category.length,
      3,
      'Both terms in first vocab present, plus extra'
    );
    strictEqual(
      favDataAll.my_types.length,
      2,
      'Both terms in second vocab present'
    );
  });

  test('Threshold enforced', 2, function () {
    var favDataThreshold;

    // Alter page meta data for testable activity results.
    delete dataLayer[0][groucho.config.taxonomyProperty].my_category[25];
    delete dataLayer[0][groucho.config.taxonomyProperty].my_types[13];
    history.pushState('', 'Another Page Title', window.location + '#yet-another');
    // Manually create another browsing record.
    groucho.trackHit();

    // Threshold increase.
    favDataThreshold = groucho.getFavoriteTerms('*', false, 3);

    // Avoid returning empty vocabs with no items.
    strictEqual(
      typeof favDataThreshold.my_types,
      'undefined',
      'Vocab removed due to threshold limit'
    );

    // Threshold increase.
    favDataThreshold = groucho.getFavoriteTerms('*', false, 4);
    strictEqual(
      Object.keys(favDataThreshold).length,
      0,
      'Threshold increased beyond term counts, results empty'
    );
  });


  module('User');

  test('Origins', 3, function() {
    var origin = groucho.storage.get('user.origin'),
        sessionOrigin = groucho.storage.get('user.sessionOrigin'),
        splitURL;

    // @todo Could perform param slice first or parse the URL for real.
    // @note cli testing includes "?", while in-browser does not.
    strictEqual(
      origin.url.split('?')[0].slice(-12),
      'groucho.html',
      'Origin should be test file.'
    );
    splitURL = sessionOrigin.url.split('?');
    splitURL = (splitURL.length > 1) ? splitURL[1] : splitURL[0];
    strictEqual(
      splitURL.slice(-12),
      'another-page',
      'Session origin should be test file.'
    );
    strictEqual(
      typeof groucho.userDeferred.resolve,
      'function',
      'UserDeferred is a deferred object'
    );
  });

  test('Properties', 6, function () {
    var userProperties;

    // Set user property, attempt to set again without overriding.
    groucho.userSet({thing: 'yulp'});
    groucho.userSet({thing: 'neato'});
    strictEqual(
      groucho.storage.get('user.thing'),
      'yulp',
      'User property was properly set and not overridden'
    );

    // Overwrite the user property.
    groucho.userSet({thing: 'indeed'}, true);
    strictEqual(
      groucho.storage.get('user.thing'),
      'indeed',
      'User property was overridden when desired'
    );

    // Full property lookup checks.
    userProperties = groucho.userGet();
    ok(
      userProperties.hasOwnProperty('origin'),
      'User property "origin" exists'
    );
    ok(
      userProperties.hasOwnProperty('sessionOrigin'),
      'User property "sessionOrigin" exists'
    );
    ok(
      userProperties.hasOwnProperty('thing'),
      'User property "thing" exists'
    );

    // Single propety lookup.
    strictEqual(
      groucho.userGet('thing'),
      'indeed',
      'Single user property lookup successful'
    );
  });

}(window.jQuery || window.Zepto || window.$, groucho));
