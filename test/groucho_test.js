(function($) {
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
    ok($.jStorage.storageAvailable(), 'Storage object exists');
    ok((typeof $.jStorage === "object"), 'Storage object is an object');
    ok((typeof $.jStorage.index()), 'Index is available');
    ok(groucho, 'Main namespace exists');
    ok((typeof groucho === "object"), 'Namespace object is an object');
  });


  module('User');

  test('Origins', 3, function() {
    var origin = $.jStorage.get('user.origin'),
        session_origin = $.jStorage.get('user.session_origin');

    // @todo Could perform param slice first or parse the URL for real.
    strictEqual(
      JSON.parse(origin).url.split('?')[0].slice(-12),
      'groucho.html',
      'Origin should be test file.'
    );
    strictEqual(
      JSON.parse(session_origin).url.split('?')[0].slice(-12),
      'groucho.html',
      'Session origin should be test file.'
    );
    strictEqual(
      typeof groucho.userDeferred.resolve,
      'function',
      'UserDeferred is a deferred object'
    );
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

  test('Pageview activities', 5, function() {
    var myResults = groucho.getActivities('browsing');

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
    history.pushState('', 'New Page Title', window.location + '#another-page');
    // Manually create another browsing record.
    groucho.trackHit();
    myResults = groucho.getActivities('browsing');
    strictEqual(
      myResults.length,
      2,
      'Second activity recorded'
    );
    ok(
      !myResults[1][groucho.config.taxonomyProperty].my_types.hasOwnProperty(14),
      'Second activity does not include removed taxonomy term.'
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
      'Both terms from first vocab are included in results'
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
      2,
      'Both terms in first vocab present'
    );
    strictEqual(
      favDataAll.my_types.length,
      2,
      'Both terms in second vocab present'
    );

  });

}(jQuery));
