import { DefaultEntitySearcher } from './default-entity-searcher.js';
import { EntityMatch } from '../interfaces/entity-match.js';
import { EntitySearcher } from '../interfaces/entity-searcher.js';
import { LiteralSearcher } from '../string-searchers/literal-searcher.js';
import { Query } from '../interfaces/query.js';
import { StringSearcher } from '../interfaces/string-searcher.js';

const literalSearcher: StringSearcher = new LiteralSearcher();
const entitySearcher: EntitySearcher<{ id: number; name: string }, number> = new DefaultEntitySearcher(literalSearcher);
const entities = [
  { id: 23501, name: 'Alice' },
  { id: 99234, name: 'Bob' },
  { id: 5823, name: 'Carol' },
  { id: 11923, name: 'Charlie' }
];
entitySearcher.indexEntities(
  entities,
  (e) => e.id,
  (e) => [e.name]
);

test('can match entity', () => {
  expect(entitySearcher.getMatches(new Query('Alice')).matches).toEqual([
    new EntityMatch<{ id: number; name: string }>(entities[0], 3, 'Alice')
  ]);
});

test("can't find entity match for unindexed term", () => {
  expect(entitySearcher.getMatches(new Query('David')).matches).toEqual([]);
});

class Person {
  public constructor(
    public id: number,
    public name: string,
    public job: string
  ) { }
}

const literalSearcher2: StringSearcher = new LiteralSearcher();
const entitySearcher2: EntitySearcher<Person, number> = new DefaultEntitySearcher(literalSearcher2);
const entities2 = [
  new Person(23501, 'Alice', 'Programmer'),
  new Person(99234, 'Bob', 'Teacher'),
  new Person(5823, 'Carol', 'Plumber'),
  new Person(11923, 'Charlie', 'Waiter')
];
entitySearcher2.indexEntities(
  entities2,
  (e) => e.id,
  (e) => [e.name, e.job]
);

test('can match entity with first term', () => {
  expect(entitySearcher2.getMatches(new Query('Alice')).matches).toEqual([
    new EntityMatch<Person>(entities2[0], 3, 'Alice')
  ]);
});

test('can match entity with second term', () => {
  expect(entitySearcher2.getMatches(new Query('Programmer')).matches).toEqual([
    new EntityMatch<{ id: number; name: string; job: string }>(entities2[0], 3, 'Programmer')
  ]);
});

test("can't find entity match for unindexed second term", () => {
  expect(entitySearcher2.getMatches(new Query('Nurse')).matches).toEqual([]);
});
