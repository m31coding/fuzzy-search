import { DynamicSearcher } from '../interfaces/dynamic-searcher.js';
import { EntityMatch } from '../interfaces/entity-match.js';
import { Query } from '../interfaces/query.js';
import { SearcherFactory } from '../searcher-factory.js';

class Person {
  public constructor(
    public id: number,
    public name: string,
    public favoriteHobby: string
  ) {}
}

function createSearcher(): DynamicSearcher<Person, number> {
  return SearcherFactory.createDefaultSearcher<Person, number>();
}

function createEntities(): Person[] {
  return [
    new Person(23501, 'Alice', 'Chess'),
    new Person(99234, 'Bob', 'Cooking'),
    new Person(5823, 'Carol', 'Skiing'),
    new Person(11923, 'Charlie', 'Reading')
  ];
}

test('can index and query dynamic searcher', () => {
  const searcher = createSearcher();
  const entities = createEntities();
  searcher.indexEntities(
    entities,
    (e) => e.id,
    (e) => [e.name]
  );
  expect(searcher.tryGetEntity(99234)).toEqual(entities[1]);
  expect(searcher.tryGetEntity(10)).toEqual(null);
  expect(searcher.getEntities()).toEqual(entities);
  expect(searcher.tryGetTerms(23501)).toEqual(['Alice']);
  expect(searcher.tryGetTerms(10)).toEqual(null);
  expect(searcher.tryGetTerms(11923)).toEqual(['Charlie']);
  expect(searcher.getTerms()).toEqual(['Alice', 'Bob', 'Carol', 'Charlie']);
  expect(searcher.getMatches(new Query('Carol')).matches[0]).toEqual(
    new EntityMatch(entities.find((e) => e.name === 'Carol')!, 3, 'Carol')
  );
});

test('can remove entities', () => {
  const searcher = createSearcher();
  const entities = createEntities();
  searcher.indexEntities(
    entities,
    (e) => e.id,
    (e) => [e.name]
  );
  expect(searcher.removeEntities([23501, 10, 5823]).removedEntities).toEqual([23501, 5823]);
  expect(searcher.tryGetEntity(23501)).toEqual(null);
  expect(searcher.tryGetEntity(5823)).toEqual(null);
  expect(searcher.getEntities()).toEqual(entities.filter((e) => e.id !== 23501 && e.id !== 5823));
  expect(searcher.getTerms()).toEqual(['Bob', 'Charlie']);
  expect(searcher.getMatches(new Query('Carol', 10)).matches).toEqual([]);
  expect(searcher.getMatches(new Query('Bob', 10)).matches[0]).toEqual(
    new EntityMatch(entities.find((e) => e.name === 'Bob')!, 3, 'Bob')
  );
});

test('can update non-indexed properties.', () => {
  const searcher = createSearcher();
  const entities = createEntities();
  searcher.indexEntities(
    entities,
    (e) => e.id,
    (e) => [e.name]
  );
  const alice = { id: 23501, name: 'Alice', favoriteHobby: 'Programming' };
  const bob: Person = entities[1];
  bob.favoriteHobby = 'Writing';
  const _meta = searcher.upsertEntities(
    [alice, bob],
    (e) => e.id,
    (e) => [e.name]
  );
  expect(searcher.tryGetEntity(23501)).toEqual(alice);
  expect(searcher.tryGetEntity(bob.id)).toEqual(bob);
  expect(searcher.getEntities()).toEqual([alice, bob, entities[2], entities[3]]);
  expect(searcher.getMatches(new Query('Alice')).matches[0]).toEqual(new EntityMatch(alice, 3, 'Alice'));
  expect(searcher.getMatches(new Query('Bob')).matches[0]).toEqual(new EntityMatch(bob, 3, 'Bob'));
});

test('can update indexed properties.', () => {
  const searcher = createSearcher();
  const entities = createEntities();
  searcher.indexEntities(
    entities,
    (e) => e.id,
    (e) => [e.name]
  );
  const alice = { id: 23501, name: 'Alice Queen', favoriteHobby: 'Chess' };
  const bob: Person = entities[1];
  bob.name = 'Bob Bishop';
  const _meta = searcher.upsertEntities(
    [alice, bob],
    (e) => e.id,
    (e) => [e.name]
  );
  expect(searcher.tryGetEntity(23501)).toEqual(alice);
  expect(searcher.tryGetEntity(bob.id)).toEqual(bob);
  expect(searcher.getEntities().sort((e1, e2) => e1.id - e2.id)).toEqual(
    [alice, bob, entities[2], entities[3]].sort((e1, e2) => e1.id - e2.id)
  );
  expect(searcher.getMatches(new Query('Alice Queen')).matches[0]).toEqual(new EntityMatch(alice, 3, 'Alice Queen'));
  expect(searcher.getMatches(new Query('Bob Bishop')).matches[0]).toEqual(new EntityMatch(bob, 3, 'Bob Bishop'));
});
