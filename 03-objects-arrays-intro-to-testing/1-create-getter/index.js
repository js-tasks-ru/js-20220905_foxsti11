/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const arrayPath = path.split(".");

  return function (obj) {
    let result = obj;

    for (const keyPath of arrayPath) {
      if (result) result = result[keyPath];
    }

    return result;
  };
}
