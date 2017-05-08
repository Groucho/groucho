/**
 * @file Adjust DOM based on user values.
 *
 * <section data-groucho-pane="user.genre" class="hidden">
 *   <span data-groucho="pop">Gaga</span>
 *   <span data-groucho="rock">Zeppelin</span>
 * </section>
 */

var groucho = window.groucho || {};

(function ($, groucho) {

  /**
   * Initialize personalzation.
   */
  groucho.personalizeInit = function () {
    $('[data-groucho-pane].hidden').hide();
  };


  /**
   * Filter and/or reveal content based on personal preference.
   */
  groucho.personalize = function () {
    $('[data-groucho-pane]').each(function () {
      var property = $(this).val(),
          overrides = groucho.overrides(property),
          paneHidden = $(this).hasClass('hidden'),
          userPref,
          anyKept;
      // Find value from user or URL param.
      userPref = overrides.hasOwnProperty(property) ? overrides.property
          : groucho.storage.get(property);
      // Check all pane items for perference data attribute value.
      $.each($(this).find('[data-groucho]'), function () {
        // Match found.
        if (userPref === $(this).data('groucho')) {
          anyKept = true;
          // Reveal item if pane is hidden.
          if (paneHidden) {
            $(this).show();
          }
        }
        else if (!paneHidden) {
          // Hide items if pane is not hidden.
          $(this).hide();
        }
      });
      // Reveal pane.
      if (paneHidden && anyKept) {
        $(this).show();
      }
    });
  };


  /**
   * Update user preferences via configured URL param overrides.
   *
   * @return {object}
   */
  groucho.overrides = function () {
    var settings = {};
    // Sanity check.
    if (groucho.config.hasOwnProperty('overrides')) {
      // Discover all configured override values.
      $.each(groucho.config.overrides, function (key, value) {
        var paramVal = groucho.getQueryParam(key),
            property = typeof(value === 'string') ? value : key;
        // Value found, set configured property.
        if (paramVal) {
          settings[property] = paramVal;
        }
      });
      return settings;
    }
    return {};
  };

})(window.jQuery || window.Zepto || window.$, groucho);
