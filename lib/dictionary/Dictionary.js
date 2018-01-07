const sqlite3 = require('sqlite3');

const Utils = require('../Utils');
const Word = require('../word/Word');

const koreanRegExp = /^[\sㄱ-ㅎ가-힣ㆍ^-]+$/;

class Dictionary {
  constructor(path = ':memory:') {
    this.crawler = null;
    this.db = new sqlite3.Database(path);
    this.db.run('CREATE TABLE IF NOT EXISTS dictionary(text TEXT NOT NULL, pos TEXT, type TEXT, category TEXT, meaning TEXT);');
    this.path = path;
  }

  add(word) {
    const text = word.getText();
    if (koreanRegExp.test(text)) {
      const pos = word.getPOS();
      const type = word.getType();
      const category = word.getCategory();
      const meaning = word.getMeaning();
      this.db.run('INSERT INTO dictionary VALUES(?, ?, ?, ?, ?)', Utils.toRowData({
        text, pos, type, category, meaning,
      }));
    }
  }

  async fetch() {
    const { db } = this;
    const words = await this.crawler.run();
    db.serialize(() => {
      db.run('BEGIN TRANSACTION;');
      for (let i = 0, len = words.length; i < len; i += 1) {
        db.run('INSERT INTO dictionary VALUES(?, ?, ?, ?, ?)', Utils.toRowData(words[i].toObject()));
      }
      db.run('END TRANSACTION;');
    });
  }

  findAll(text) {
    if (koreanRegExp.test(text)) {
      return new Promise(resolve => this.db.all('SELECT * FROM dictionary WHERE text = ?', text, (err, rows) => resolve(rows.map(row => Word.createFromObject(Utils.toWordObject(row))))));
    }
    return null;
  }

  getAll() {
    return new Promise(resolve => this.db.all('SELECT * FROM dictionary', (err, rows) => resolve(rows.map(row => Word.createFromObject(Utils.toWordObject(row))))));
  }

  getDB() {
    return this.db;
  }

  getDictionaryPath() {
    return this.path;
  }

  has(text) {
    if (koreanRegExp.test(text)) {
      return new Promise(resolve => this.db.get('SELECT * FROM dictionary WHERE text = ?', text, (err, row) => resolve(Boolean(row))));
    }
    return false;
  }
}

module.exports = Dictionary;
