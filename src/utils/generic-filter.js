const toLower = string =>
  String(string).toLowerCase();

const match = (item, query) =>
  ~(toLower(item).indexOf(toLower(query)));

/**
 * Returns a new of list strings that match the given substring
 * @param  {String} query    Substring to match against each string in provided list
 * @param  {Array} list      List of strings or objects to be filtered
 * @param  {String} searchOn (optional) Key of value to be searched (if object supplied as second argument)
 * @return {Array}           Filtered array of strings
 */
const defaultFilter = (query, list = [], searchOn) => {
  if (!query) return list;

  if (!(Array.isArray(list))) {
    throw new Error('Second argument must be an array');
  }

  return list.filter(el => {
    if (typeof el === 'object') {
      const searchKey = (searchOn in el) && searchOn;

      if (!searchKey) return false;

      return match(el[searchKey], query);
    }

    return match(el, query);
  });

};

export default defaultFilter;
