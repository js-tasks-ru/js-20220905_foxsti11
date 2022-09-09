/**
 * omit - creates an object composed of enumerable property fields
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to omit
 * @returns {object} - returns the new object
 */
export const omit = (obj, ...fields) => {
  let object = JSON.parse(JSON.stringify(obj));

  object = Object.fromEntries(
    Object.entries(object).filter(([key]) => !fields.includes(key))
  );

  return object;
};
