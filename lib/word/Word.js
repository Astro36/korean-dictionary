/* KoreanDictionary
Copyright (C) 2017  Astro

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>. */

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
