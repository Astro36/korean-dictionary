const Dictionary = require('./Dictionary');
const KoreanDictionaryCrawler = require('../crawler/KoreanDictionaryCrawler');

class KoreanDictionary extends Dictionary {
  constructor(path = ':memory:') {
    super(path);
    this.crawler = new KoreanDictionaryCrawler();
  }

  async loadCrawler() {
    const { crawler, db } = this;
    const words = await crawler.run();
    for (let i = 0, len = words.length; i < len; i += 1) {
      const {
        text, type, theme, meaning,
      } = words[i];
      db.run('INSERT INTO dictionary VALUES(?, ?, ?, ?)', [text, type ? JSON.stringify(type) : null, theme ? JSON.stringify(theme) : null, meaning ? JSON.stringify(meaning) : null]);
    }
  }
}

module.exports = KoreanDictionary;
