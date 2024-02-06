/**
 * Illustrates the basic usage of the library: create a searcher, index entities, remove and upsert entities.
 */

import * as fuzzySearch from '../../dist/fuzzy-search.module.js';

const searcher = fuzzySearch.SearcherFactory.createDefaultSearcher();

// If your dataset contains non-latin characters, build the searcher in the following way instead:
/* const config = fuzzySearch.Config.createDefaultConfig();
config.normalizerConfig.allowCharacter = (_c) => true;
const searcher = fuzzySearch.SearcherFactory.createSearcher(config); */

const persons = [
  { id: 23501, firstName: 'Alice', lastName: 'King' },
  { id: 99234, firstName: 'Bob', lastName: 'Bishop' },
  { id: 5823, firstName: 'Carol', lastName: 'Queen' },
  { id: 11923, firstName: 'Charlie', lastName: 'Rook' }
];

const indexingMeta = searcher.indexEntities(
  persons,
  (e) => e.id,
  (e) => [e.firstName, e.lastName, `${e.firstName} ${e.lastName}`]
);
console.log('indexing meta:');
console.dir(indexingMeta);

const result = searcher.getMatches(new fuzzySearch.Query('alice kign'));
console.log('query result:');
console.dir(result);

const removalResult = searcher.removeEntities([99234, 5823]);
console.log('removal result:');
console.dir(removalResult);

const persons2 = [
  { id: 723, firstName: 'David', lastName: 'Knight' }, // new
  { id: 2634, firstName: 'Eve', lastName: 'Pawn' }, // new
  { id: 23501, firstName: 'Allie', lastName: 'King' }, // updated
  { id: 11923, firstName: 'Charles', lastName: 'Rook' } // updated
];

const upsertMeta = searcher.upsertEntities(
  persons2,
  (e) => e.id,
  (e) => [e.firstName, e.lastName, `${e.firstName} ${e.lastName}`]
);
console.log('upsert meta:');
console.dir(upsertMeta);

const result2 = searcher.getMatches(new fuzzySearch.Query('allie'));
console.log('query result:');
console.dir(result2);
