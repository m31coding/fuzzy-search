importScripts('../../dist/fuzzy-search.umd.js');
self.fuzzySearch = fuzzySearch;

/**
 * Make sure to build the searcher in the exact same way in both the main thread (index.js) and the worker thread
 * (worker.js).
 */
function createSearcher() {
  return fuzzySearch.SearcherFactory.createDefaultSearcher();

  // If your dataset contains non-latin characters, build the searcher in the following way instead:
  /* const config = fuzzySearch.Config.createDefaultConfig();
    config.normalizerConfig.allowCharacter = (c) => true;
    return fuzzySearch.SearcherFactory.createSearcher(config); */
}

onmessage = async (e) => {
  const searcher = createSearcher();
  const indexingMeta = indexData(searcher, e.data);
  const memento = new fuzzySearch.Memento();
  searcher.save(memento);
  postMessage({
    mementoObjects: memento.objects,
    indexingMeta: indexingMeta.allEntries
  });
};

function indexData(searcher, data) {
  console.log(`indexing ${data.persons.length} persons`);
  const indexingMeta = searcher.indexEntities(
    data.persons,
    (person) => person.id,
    (person) => [person.firstName, person.lastName, `${person.firstName} ${person.lastName}`]
  );
  console.log('finished indexing');
  return indexingMeta;
}
