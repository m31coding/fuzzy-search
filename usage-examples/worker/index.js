/**
 * Illustrates how a searcher can be indexed in a web worker.
 */

import * as fuzzySearch from '../../dist/fuzzy-search.module.js';

/**
 * Make sure to build the searcher in the exact same way in both the main thread (index.js) and the worker thread
 * (indexing-worker.js).
 */
function createSearcher() {
  return fuzzySearch.SearcherFactory.createDefaultSearcher();

  // If your dataset contains non-latin characters, build the searcher in the following way instead:
  /* const config = fuzzySearch.Config.createDefaultConfig();
    config.normalizerConfig.allowCharacter = (c) => true;
    return fuzzySearch.SearcherFactory.createSearcher(config); */
}

const persons = [
  { id: 23501, firstName: 'Alice', lastName: 'King' },
  { id: 99234, firstName: 'Bob', lastName: 'Bishop' },
  { id: 5823, firstName: 'Carol', lastName: 'Queen' },
  { id: 11923, firstName: 'Charlie', lastName: 'Rook' }
];

function createSearcherWithData(data) {
  const worker = new Worker('./indexing-worker.js');
  worker.onmessage = (e) => {
    console.log('indexing meta:');
    console.dir(e.data.indexingMeta);
    const memento = new fuzzySearch.Memento(e.data.mementoObjects);
    searcher = createSearcher();
    searcher.load(memento);
    console.log('ready to search');

    const result = searcher.getMatches(new fuzzySearch.Query('alice kign'));
    console.log('query result:');
    console.dir(result);
  };

  worker.postMessage(data);
}

let searcher = null;
createSearcherWithData({ persons: persons });
