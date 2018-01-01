const jsdom = require('jsdom');

const DictionaryCrawler = require('./DictionaryCrawler');
const { requestParallelAsync } = require('../Utils');

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
      const responses = await requestParallelAsync(this.urls, { gzip: true });
      const words = [];
      for (let i = 0, len = responses.length; i < len; i += 1) {
        const [error, response, body] = responses[i];
        if (!error && response && response.statusCode === 200 && body) {
          const html = body.split('\n').join('');
          const { document } = (new JSDOM(html.substring(html.search('<span id="print_area">'), html.search('<!-- paging.jsp --><table width="100%" border="0" cellspacing="0" cellpadding="0">')))).window;
          const elements = document.querySelectorAll('span#print_area p.exp');
          if (elements) {
            for (let j = 0, len2 = elements.length; j < len2; j += 1) {
              const element = elements[j];
              const text = element.querySelector('strong font').innerHTML;
              if (text) {
                const word = { text: text.trim().replace(/[ㆍ^-]/g, '') };
                const content = element.innerHTML;
                const type = content.match(/「<font face="새굴림" style="font-size:13px">[ㄱ-ㅎ가-힣]+<\/font>」/g);
                const theme = content.match(/『<font face="새굴림" style="font-size:13px">[ㄱ-ㅎ가-힣]+<\/font>』/g);
                const meaning = content.match(/<br>(?:<span class="NumNO">「\d+」<\/span>(?:『<font face="새굴림" style="font-size:13px">[ㄱ-ㅎ가-힣]+<\/font>』)?)?<font face="새굴림" style="font-size:13px">(?:[^/]|\/(?!font>))+<\/font>/g);
                if (type) {
                  word.type = type.map(value => value.replace(/「<font face="새굴림" style="font-size:13px">|<\/font>」/g, '').trim()) || null;
                } else {
                  word.type = null;
                }
                if (theme) {
                  word.theme = theme.map(value => value.replace(/『<font face="새굴림" style="font-size:13px">|<\/font>』/g, '').trim()) || null;
                } else {
                  word.theme = null;
                }
                if (meaning) {
                  word.meaning = meaning.map(value => value.replace(/<span class="NumNO">「\d+」<\/span>|<font face="새굴림" style="font-size:13px">|<\/font>|<\/?br>/g, '').trim()) || null;
                } else {
                  word.meaning = null;
                }
                words.push(word);
              }
            }
          }
        }
      }
      resolve(words);
    });
  }
}

module.exports = KoreanDictionaryCrawler;
