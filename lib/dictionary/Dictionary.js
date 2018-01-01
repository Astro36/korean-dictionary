const sqlite3 = require('sqlite3');

const koreanRegExp = /^[ㄱ-ㅎ가-힣ㆍ^-]+$/;

class Dictionary {
  constructor(path = ':memory:') {
    this.crawler = null;
    this.db = new sqlite3.Database(path);
    this.db.run('CREATE TABLE IF NOT EXISTS dictionary(text TEXT NOT NULL, type TEXT, theme TEXT, meaning TEXT);');
  }

  add(word) {
    const {
      text, type, theme, meaning,
    } = word;
    if (koreanRegExp.test(text)) {
      this.db.run('INSERT INTO dictionary VALUES(?, ?, ?, ?)', [text, type ? JSON.stringify(type) : null, theme ? JSON.stringify(theme) : null, meaning ? JSON.stringify(meaning) : null]);
    }
  }

  findAll(text) {
    if (koreanRegExp.test(text)) {
      return new Promise(resolve => this.db.all('SELECT * FROM dictionary WHERE text = ?', text, (err, rows) => resolve(rows)));
    }
    return null;
  }

  getAllWords() {
    return new Promise(resolve => this.db.all('SELECT * FROM dictionary', (err, rows) => resolve(rows)));
  }

  has(text) {
    if (koreanRegExp.test(text)) {
      return new Promise(resolve => this.db.get('SELECT * FROM dictionary WHERE text = ?', text, (err, row) => resolve(Boolean(row))));
    }
    return false;
  }
}

module.exports = Dictionary;
