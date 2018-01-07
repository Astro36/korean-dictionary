const fs = require('fs');
const jsdom = require('jsdom');
const parallel = require('parallel-tasks');
const path = require('path');
const request = require('request');

const DictionaryCrawler = require('./DictionaryCrawler');
const Word = require('../word/Word');

const { JSDOM } = jsdom;

class KoreanDictionaryCrawler extends DictionaryCrawler {
  constructor() {
    const consonants = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
    const consonantWordCount = [65485, 17667, 31225, 9581, 26772, 39505, 55909,
      69587, 50896, 19530, 5419, 9760, 12667, 28377];
    super(consonants.map((value, index) => {
      const arr = [];
      for (let i = 1, max = Math.floor(consonantWordCount[index] / 500) + 1; i <= max; i += 1) {
        arr.push(`http://stdweb2.korean.go.kr/search/List_dic.jsp?setJaso=${encodeURIComponent(value)}&PageRow=500&SearchPart=Index&go=${i}`);
      }
      return arr;
    }).reduce((previousValue, currentValue) => previousValue.concat(currentValue)));
  }

  run() {
    return new Promise(async (resolve) => {
      const tempDirPath = path.join(__dirname, 'temp');
      const tempPath = path.join(tempDirPath, 'dictionary.temp');
      const createTask = (url, index) => () => new Promise((resolve2) => {
        request({ url, gzip: true }, (error, response, body) => {
          const words = [];
          if (!error && response && response.statusCode === 200 && body) {
            const html = body.split('\n').join('');
            const { document } = (new JSDOM(html.substring(html.search('<span id="print_area">'), html.search('<!-- paging.jsp --><table width="100%" border="0" cellspacing="0" cellpadding="0">')))).window;
            const elements = document.querySelectorAll('span#print_area p.exp');
            if (elements) {
              for (let j = 0, len2 = elements.length; j < len2; j += 1) {
                const element = elements[j];
                const text = element.querySelector('strong font').innerHTML;
                if (text && /^[\sㄱ-ㅎ가-힣ㆍ^-]+$/.test(text)) {
                  const word = {
                    text: text.trim().replace(/[ㆍ^-]/g, ''),
                    pos: null,
                    type: null,
                    category: null,
                    meaning: null,
                  };
                  const content = element.innerHTML;
                  const pos = content.match(/「<font face="새굴림" style="font-size:13px">[ㄱ-ㅎ가-힣]+<\/font>」/g);
                  const typeNCategory = content.match(/『<font face="새굴림" style="font-size:13px">[ㄱ-ㅎ가-힣]+<\/font>』/g);
                  const meaning = content.match(/(?:』|<br>)(?:<span class="NumNO">「\d+」<\/span>(?:『<font face="새굴림" style="font-size:13px">[ㄱ-ㅎ가-힣]+<\/font>』)?)?<font face="새굴림" style="font-size:13px">(?:[^/]|\/(?!font>))+<\/font>/g);
                  if (pos) {
                    word.pos = pos.map(value => value.replace(/「<font face="새굴림" style="font-size:13px">|<\/font>」/g, '').trim());
                  }
                  if (typeNCategory) {
                    const typeNCategoryTexts = typeNCategory.map(value => value.replace(/『<font face="새굴림" style="font-size:13px">|<\/font>』/g, '').trim());
                    if (typeNCategoryTexts) {
                      word.type = typeNCategoryTexts.filter(value => ['방언', '옛말', '북한어'].indexOf(value) >= 0);
                      word.category = typeNCategoryTexts.filter(value => ['방언', '옛말', '북한어'].indexOf(value) < 0);
                    }
                  }
                  if (meaning) {
                    word.meaning = meaning.map(value => value.replace(/^』|<span class="NumNO">「\d+」<\/span>|<font face="새굴림" style="font-size:13px">|<\/font>|<\/?br>/g, '').trim());
                  }
                  if (word.pos !== null && word.pos.length === 0) {
                    word.pos = null;
                  }
                  if (word.type !== null && word.type.length === 0) {
                    word.type = null;
                  }
                  if (word.category !== null && word.category.length === 0) {
                    word.category = null;
                  }
                  if (word.meaning !== null && word.meaning.length === 0) {
                    word.meaning = null;
                  }
                  words.push(word);
                }
              }
            }
          }
          fs.writeFileSync(`${tempPath}${index}`, JSON.stringify(words));
          resolve2();
        });
      });

      if (!fs.existsSync(tempDirPath)) {
        fs.mkdirSync(tempDirPath);
      }

      await parallel.run(this.urls.map((url, index) => createTask(url, index)));
      resolve(this.urls.map((value, index) => {
        const words = JSON.parse(fs.readFileSync(`${tempPath}${index}`)).map(obj => Word.createFromObject(obj));
        fs.unlinkSync(`${tempPath}${index}`);
        return words;
      }).reduce((previousValue, currentValue) => previousValue.concat(currentValue)));
    });
  }
}

module.exports = KoreanDictionaryCrawler;
