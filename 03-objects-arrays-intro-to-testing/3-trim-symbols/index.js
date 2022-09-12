/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size >= 0) {
    let newString = "";

    for (let index = 0; index < string.length; index++) {
      let tempString = string[index];

      while (tempString[0] === string[index + 1]) {
        tempString += string[index++];
      }

      newString += tempString.slice(0, size);
    }

    string = newString;
  }

  return string;
}
