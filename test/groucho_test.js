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

  test('Collection class', 3, function () {
    var testObj = {
      'thing': 'blah',
      'another': 5,
      'final': 'yup'
    },
    testAry = ['thing', 'another', 'final'],
    stuff = new groucho.Collection(testObj);

    ok(
      stuff.size() === 3,
      'Collection size function reports correctly'
    );
    deepEqual(
      stuff.keys(),
      testAry.sort(),
      'Collection keys function reports correctly'
    );
    deepEqual(
      stuff.get(),
      testObj,
      'Collection getter return correctly'
    );
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

  test('Tracking scafolding', function() {
    var functions = [
      'getFavoriteTerms',
      'getActivities',
      'createActivity',
      'Collection'
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

  test('Tracking activities', 5, function() {
    var myResults = new groucho.Collection(groucho.getActivities('browsing'));

    ok(
      myResults.size() === 1,
      'Page load activity recorded'
    );
    strictEqual(
      myResults.get()[myResults.keys()[0]].url.split('?')[0].slice(-12),
      'groucho.html',
      'Recorded url is present and correct'
    );
    strictEqual(
      myResults.get()[myResults.keys()[0]][groucho.config.taxonomyProperty].my_types['13'],
      'Some Tag',
      'Taxonomy term hit record is present on first tracking activity record'
    );

    // Alter page meta data for testable activity results.
    delete dataLayer[0][groucho.config.taxonomyProperty].my_types[14];
    history.pushState('', 'New Page Title', window.location + '#another-page');
    // Manually create another browsing record.
    groucho.trackHit();
    myResults = new groucho.Collection(groucho.getActivities('browsing'));
    strictEqual(
      myResults.size(),
      2,
      'Second activity recorded'
    );
    ok(
      !myResults.get()[myResults.keys()[1]][groucho.config.taxonomyProperty].my_types.hasOwnProperty(14),
      'Second activity does not include removed taxonomy term.'
    );

  });

  test('Favorites', 14, function () {
    var favData = new groucho.Collection(groucho.getFavoriteTerms()),
        termFavData = new groucho.Collection(favData.get()[favData.keys()[0]]),
        favDataMyTypes = new groucho.Collection(groucho.getFavoriteTerms('my_types')),
        termFavDataMyTypes = new groucho.Collection(favDataMyTypes.get()[favDataMyTypes.keys()[0]]),
        favDataMyTypesAll = new groucho.Collection(groucho.getFavoriteTerms('my_types', true)),
        termFavDataMyTypesAll = new groucho.Collection(favDataMyTypesAll.get()[favDataMyTypesAll.keys()[0]]),
        favDataAll = new groucho.Collection(groucho.getFavoriteTerms('*', true)),
        termFavDataAll = new groucho.Collection(favDataAll.get()[favDataAll.keys()[1]]);

    // Default request.
    deepEqual(
      favData.keys(),
      [ "my_category", "my_types" ],
      'All vocabs listed within favorites default function call'
    );
    strictEqual(
      typeof termFavData.get()[termFavData.keys()[0]].count,
      'number',
      'Count number present on at least first favorite term'
    );
    strictEqual(
      termFavData.get()[termFavData.keys()[0]].count,
      2,
      'Count number on first favorite term is two'
    );
    ok(
      !favData.get().my_types.hasOwnProperty(14),
      'Second term is not returned'
    );

    // One vocab requested.
    deepEqual(
      favDataMyTypes.keys(),
      ["my_types"],
      'Only requested vocab listed with argument function call'
    );
    strictEqual(
      termFavDataMyTypes.get()[termFavDataMyTypes.keys()[0]].count,
      2,
      'Count number on first favorite term is two'
    );
    deepEqual(
      termFavDataMyTypes.get(),
      { "13": { "count" : 2, "name" : "Some Tag" } },
      'Correct term is returned within requested vocab function call'
    );
    strictEqual(
      termFavDataMyTypes.size(),
      1,
      'Only one term is returned within requested vocab function call'
    );

    // All data requested within one vocab.
    deepEqual(
      favDataMyTypesAll.keys(),
      [ "my_types" ],
      'Only requested vocab listed with two argument function call'
    );
    strictEqual(
      termFavDataMyTypesAll.size(),
      2,
      'Both terms are returned with two argument function call'
    );
    strictEqual(
      termFavDataMyTypesAll.get()[termFavDataMyTypesAll.keys()[0]].count,
      2,
      'Count number on first favorite term is two'
    );
    strictEqual(
      termFavDataMyTypesAll.get()[termFavDataMyTypesAll.keys()[1]].count,
      1,
      'Count number on second favorite term is one'
    );

    // All data requested for all vocabs.
    deepEqual(
      favDataAll.keys(),
      [ "my_category", "my_types" ],
      'All vocabs listed within favorites all data, all vocabs function call'
    );
    strictEqual(
      termFavDataAll.size(),
      2,
      'Both terms in second vocab present'
    );

  });

}(jQuery));
