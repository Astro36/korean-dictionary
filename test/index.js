const assert = require('assert');
const path = require('path');

const { Dictionary, DictionaryItem } = require('../lib');

describe('Dictionary', () => {
  const dictionary = Dictionary.createFromFile(path.join(__dirname, './dictionary.tsv'));

  describe('.createFromFile()', () => {
    it('사전 TSV 파일을 읽어 Dictionary를 생성합니다.', () => {
      assert(dictionary instanceof Dictionary);
    });
  });

  describe('.createFromWeb()', () => {
    it('웹에서 표준국어대사전을 크롤링해 Dictionary를 생성합니다.', () => {
      assert(typeof Dictionary.createFromWeb === 'function');
    });
  });

  describe('#find()', () => {
    it('사전에 해당 단어가 있는지 확인하고 해당 단어를 반환합니다.', () => {
      assert(dictionary.find('사과') instanceof DictionaryItem);
    });
  });

  describe('#findAll()', () => {
    it('사전에 해당 단어가 있는지 확인하고 해당하는 모든 단어를 반환합니다.', () => {
      assert(Array.isArray(dictionary.findAll('사과')));
    });
  });

  describe('#has()', () => {
    it('사전에 해당 단어가 있는지 확인합니다.', () => {
      assert(dictionary.has('사과'));
      assert(!dictionary.has('배추'));
    });
  });

  describe('#saveAsTsv()', () => {
    it('사전을 TSV 파일로 저장합니다.', () => {
      assert(typeof dictionary.saveAsTsv === 'function');
    });
  });

  describe('#size()', () => {
    it('사전에 포함된 단어 개수를 반환합니다.', () => {
      assert(typeof dictionary.size() === 'number');
    });
  });
});
