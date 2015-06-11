/**
 * @file QUnit tests for failed storage backend.
 */

(function ($, g) {

  // Clear out past tests, unless explicitly not.
  if (!location.href.match(/\?noflush\=|&noflush\=/)) {
    groucho.storage.clear();
  }

  module('jQuery#groucho', {
    // This will run before each test in this module.
    setup: function() {
      this.elems = $('#qunit-fixture').children();
    }
  });


  module('Errors handled');

  test('Init', 12, function () {
    var storageFunc = [
      'set',
      'get',
      'remove',
      'index',
      'available',
      'clear',
      'index'
    ];

    ok(g, 'Main namespace exists');
    ok((typeof g === "object"), 'Namespace object is an object');
    ok((typeof g.storage === "object"), 'Storage object is an object');

    ok((typeof g.storage.available()), 'Storage available function exists');
    equal(g.storage.available(), false, 'Storage returns not available');

    for (var f in storageFunc) {
      ok((typeof g.storage[storageFunc[f]]()), 'Storage function ' + storageFunc[f] + 'exists');
    }
  });

}(window.jQuery || window.Zepto || window.$, groucho));
