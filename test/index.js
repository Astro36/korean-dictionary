const { KoreanDictionary } = require('../lib');

const dictionary = new KoreanDictionary('dictionary.sqlite3');
dictionary.fetch();
