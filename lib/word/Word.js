class Word {
  constructor(text, pos = null, type = null, category = null, meaning = null) {
    this.text = text;
    this.pos = pos;
    this.type = type;
    this.category = category;
    this.meaning = meaning;
  }

  static createFromObject({
    text, pos, type, category, meaning,
  }) {
    return new Word(text, pos, type, category, meaning);
  }

  getCategory() {
    return this.category;
  }

  getMeaning() {
    return this.meaning;
  }

  getPOS() {
    return this.pos;
  }

  getText() {
    return this.text;
  }

  getType() {
    return this.type;
  }

  toObject() {
    return {
      text: this.text,
      pos: this.pos,
      type: this.type,
      category: this.category,
      meaning: this.meaning,
    };
  }
}

module.exports = Word;
