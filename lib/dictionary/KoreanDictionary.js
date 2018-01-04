const Dictionary = require('./Dictionary');
const KoreanDictionaryCrawler = require('../crawler/KoreanDictionaryCrawler');

class KoreanDictionary extends Dictionary {
  constructor(path = ':memory:') {
    super(path);
    this.crawler = new KoreanDictionaryCrawler();
  }
}

module.exports = KoreanDictionary;
