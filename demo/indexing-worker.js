importScripts('../dist/fuzzy-search.umd.js', './fuzzy-demo-commons.js');
self.fuzzySearch = fuzzySearch;

onmessage = async (e) => {
  const searcher = self.createSearcher(e.data.latinOnly);
  const searchDataConfig = self.getSearchDataConfig(e.data.kind);
  const indexingMeta = self.indexData(searcher, e.data.entities, searchDataConfig);
  const memento = new self.fuzzySearch.Memento();
  searcher.save(memento);
  postMessage({ mementoObjects: memento.objects, indexingMeta: indexingMeta.allEntries });
};
