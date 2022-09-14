/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = "asc") {
  const collator = new Intl.Collator("ru", { caseFirst: "upper" });
  const typeSort = {
    asc: 1,
    desc: -1,
  };
  const currentTypeSort = typeSort[param];

  return [...arr].sort(
    (str1, str2) => currentTypeSort * collator.compare(str1, str2)
  );
}
