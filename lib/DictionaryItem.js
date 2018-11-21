class DictionaryItem {
  constructor({
    word, meaning, pos, category,
  }) {
    this.word = word;
    this.meaning = meaning;
    this.pos = pos;
    this.category = category;
  }
}

module.exports = DictionaryItem;
