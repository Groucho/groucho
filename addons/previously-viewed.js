
var groucho = window.groucho || {};

/**
 * Get pages previously viewed by the user.
 *
 * @param  string property
 *   Page history item property to check.
 * @param  array values
 *   Values to accept for return list.
 * @param  string activityType
 *   [Optional] Type of groucoh activity to look through.
 *
 * @return array
 *   List of history items matching conditions.
 */
groucho.getPreviouslyViewed = function getPreviouslyViewed(property, values, activityType) {
  var history = groucho.getActivities(activityType),
      historyReturns = [];

  // Default to browsing history, optional param.
  activityType = activityType || 'browsing';

  // Search history using property named.
  for (var h in history) {
    if (history[h].hasOwnProperty(property)) {
      for (var v in values) {
        // Matching value on property in question.
        if (values[v] === history[h][property]) {
          historyReturns.push(history[h]);
        }
        // One is enough.
        break;
      }
    }
  }

  return historyReturns;
};
