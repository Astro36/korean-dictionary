const ffi = require('ffi');
const path = require('path');

const DictionaryItem = require('./DictionaryItem');

const lib = ffi.Library(path.join(__dirname, '../target/release/libkorean_dictionary.so'), {
  createDictionaryFromFile: ['pointer', ['string']],
  createDictionaryFromWeb: ['pointer', ['size_t']],
  find: ['string', ['pointer', 'string']],
  findAll: ['string', ['pointer', 'string']],
  has: ['bool', ['pointer', 'string']],
  saveAsTsv: ['void', ['pointer', 'string']],
  size: ['size_t', ['pointer']],
});

class Dictionary {
  constructor(pointer) {
    this.dictionary = pointer;
  }

  static createFromFile(filePath) {
    return new Dictionary(lib.createDictionaryFromFile(filePath));
  }

  static createFromWeb(threadNum) {
    return new Dictionary(lib.createDictionaryFromWeb(threadNum));
  }

  find(wordText) {
    const { dictionary } = this;
    const item = lib.find(dictionary, wordText);
    if (item) {
      const [word, meaning, pos, category] = item.split('\t');
      return new DictionaryItem({
        word, meaning, pos, category,
      });
    }
    return null;
  }

  findAll(wordText) {
    const { dictionary } = this;
    const items = lib.findAll(dictionary, wordText);
    if (items) {
      return items.split('\n').map((item) => {
        const [word, meaning, pos, category] = item.split('\t');
        return new DictionaryItem({
          word, meaning, pos, category,
        });
      });
    }
    return null;
  }

  has(word) {
    const { dictionary } = this;
    return lib.has(dictionary, word);
  }

  saveAsTsv(filePath) {
    const { dictionary } = this;
    lib.saveAsTsv(dictionary, filePath);
  }

  size() {
    const { dictionary } = this;
    return lib.size(dictionary);
  }
}

module.exports = Dictionary;
