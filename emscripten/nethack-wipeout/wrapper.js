"use strict"

function wipeout_text (text, count, seed) {
  const ptr = stringToNewUTF8(text);

  _wipeout_text(ptr, count, seed);

  result = UTF8ToString(ptr);
  _free(ptr);
  return result;
}

Module["wipeout_text"] = wipeout_text;
