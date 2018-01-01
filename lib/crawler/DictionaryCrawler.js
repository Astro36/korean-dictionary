class DictionaryCrawler {
  constructor(urls = []) {
    this.urls = urls;
  }

  getUrls() {
    return this.urls;
  }

  setUrls(urls) {
    this.urls = urls;
  }
}

module.exports = DictionaryCrawler;
