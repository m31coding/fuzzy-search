// import { Config } from './config';
import { Query } from './interfaces/query.js';
import { SearcherFactory } from './searcher-factory.js';

class Person {
  constructor(
    public id: number,
    public firstName: string,
    public lastName: string
  ) {}
}

const searcher = SearcherFactory.createDefaultSearcher<Person, number>();

// If your dataset contains non-latin characters, build the searcher in the following way instead:
/* const config = Config.createDefaultConfig();
config.normalizerConfig.allowCharacter = (_c) => true;
const searcher = SearcherFactory.createSearcher<Person, number>(config); */

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
console.dir(indexingMeta);

const result = searcher.getMatches(new Query('alice kign'));
console.dir(result);

const removalResult = searcher.removeEntities([99234, 5823]);
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
console.dir(upsertMeta);

const result2 = searcher.getMatches(new Query('allie'));
console.dir(result2);
