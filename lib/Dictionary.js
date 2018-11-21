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

/**
 * Class representing a dictionary.
 */
class Dictionary {
  /**
   * Do not use this constructor. You can make dictionary instance by using
   * {@link Dictionary.createFromFile} or {@link Dictionary.createFromWeb}.
   * @private
   * @param {Buffer} pointer - A mutable pointer of dictionary for Rust
   */
  constructor(pointer) {
    this.dictionary = pointer;
  }

  /**
   * 사전 TSV 파일을 읽어 Dictionary를 생성합니다.
   * @param {string} filePath
   * @returns {Dictionary}
   */
  static createFromFile(filePath) {
    return new Dictionary(lib.createDictionaryFromFile(filePath));
  }

  /**
   * 웹에서 표준국어대사전을 크롤링해 Dictionary를 생성합니다.
   * @param {number} threadNum - How many threads you use for crawling
   * @returns {Dictionary}
   */
  static createFromWeb(threadNum) {
    return new Dictionary(lib.createDictionaryFromWeb(threadNum));
  }

  /**
   * 사전에 해당 단어가 있는지 확인하고 해당 단어를 반환합니다.
   * @param {string} wordText
   * @returns {DictionaryItem}
   */
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

  /**
   * 사전에 해당 단어가 있는지 확인하고 해당하는 모든 단어를 반환합니다.
   * @param {string} wordText
   * @returns {Array.<DictionaryItem>}
   */
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

  /**
   * 사전에 해당 단어가 있는지 확인합니다.
   * @param {string} wordText
   * @returns {boolean}
   */
  has(wordText) {
    const { dictionary } = this;
    return lib.has(dictionary, wordText);
  }

  /**
   * 사전을 TSV 파일로 저장합니다.
   * @param {string} filePath
   */
  saveAsTsv(filePath) {
    const { dictionary } = this;
    lib.saveAsTsv(dictionary, filePath);
  }

  /**
   * 사전에 포함된 단어 개수를 반환합니다.
   * @returns {number}
   */
  size() {
    const { dictionary } = this;
    return lib.size(dictionary);
  }
}

module.exports = Dictionary;
