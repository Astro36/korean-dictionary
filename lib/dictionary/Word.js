class Word {
  constructor(text, type = null, theme = null, meaning = null) {
    this.text = text;
    this.type = type;
    this.theme = theme;
    this.meaning = meaning;
  }

  getMeaning() {
    return this.meaning;
  }

  getText() {
    return this.text;
  }

  getTheme() {
    return this.theme;
  }

  getType() {
    return this.type;
  }
}

module.exports = Word;
