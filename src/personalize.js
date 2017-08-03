/**
 * @file Adjust DOM based on user values.
 */

var groucho = window.groucho || {};

(function ($, groucho) {

  /**
   * Initialize personalzation.
   *
   * Recommended: hide your personalized elements via CSS also for best UX.
   */
  groucho.personalizeInit = function () {
    groucho.adjustmentSelectors().hide();
  };


  /**
   * Reveal content based on configs.
   */
  groucho.personalize = function () {
    // Process all configs.
    for (var a in groucho.config.adjust) {
      var adjust = groucho.config.adjust[a],
          $elements = $('[' + adjust.dataAttribute + ']');

      // Change the page if any configured elements are present.
      // Bind allows using the iterated element and config context.
      $elements.each(groucho.adjust.bind({}, adjust));
    }
  };

  /**
   * Discover user preference and change the page.
   *
   * @param {object} adjustment
   *   Includes config and element to process.
   */
  groucho.adjust = function (adjustment, $element) {
    var elementValue = $element.data(adjustment.dataAttribute),
        override = groucho.getQueryParam(adjustment.paramOverride),
        userPreference = override || groucho.userGet(elementValue);

    // Check element for corrent preference data attribute value.
    if (userPreference !== elementValue) {
      $element.hide();
    }
    else {
      $element.show();
    }
    // Emit event.
    $(this).trigger('groucho:personalize', [{
      attribute: adjustment.dataAttribute,
      value: elementValue,
      preference: userPreference,
      override: override || null,
      classes: $element.attr('class'),
      url: window.location.href,
    }]);
  };

})(window.jQuery || window.Zepto || window.$, groucho);
