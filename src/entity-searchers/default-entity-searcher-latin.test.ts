import { Config } from '../config.js';
import { EntityMatch } from '../interfaces/entity-match.js';
import { EntitySearcher } from '../interfaces/entity-searcher.js';
import { EntitySearcherFactory } from './entity-searcher-factory.js';
import { Query } from '../interfaces/query.js';
import { TestData } from '../commons/test-data.js';

const persons = TestData.persons.concat(TestData.emptyPersons);

const emptySearcher: EntitySearcher<{ firstName: string; lastName: string }, { firstName: string; lastName: string }> =
  EntitySearcherFactory.createSearcher(Config.createDefaultConfig());

test('empty searcher returns zero matches for empty query', () => {
  expect(emptySearcher.getMatches(new Query('')).matches).toEqual([]);
});

test('empty searcher returns zero matches', () => {
  expect(emptySearcher.getMatches(new Query('alice')).matches).toEqual([]);
});

const searcher: EntitySearcher<{ firstName: string; lastName: string }, { firstName: string; lastName: string }> =
  EntitySearcherFactory.createSearcher(Config.createDefaultConfig());
searcher.indexEntities(
  persons,
  (person) => person,
  (person) => [person.firstName, person.lastName, `${person.firstName} ${person.lastName}`]
);

test('searcher returns zero matches for empty query', () => {
  expect(searcher.getMatches(new Query('')).matches).toEqual([]);
});

test('can find person by first name', () => {
  expect(searcher.getMatches(new Query('Sarah')).matches[0]).toEqual(
    new EntityMatch({ firstName: 'Sarah', lastName: 'Wolff' }, 1, 'Sarah')
  );
});

test('can find person by last name', () => {
  expect(searcher.getMatches(new Query('Wolff')).matches[0]).toEqual(
    new EntityMatch({ firstName: 'Sarah', lastName: 'Wolff' }, 1, 'Wolff')
  );
});

test('can find person by full name', () => {
  expect(searcher.getMatches(new Query('Sarah Wolff')).matches[0]).toEqual(
    new EntityMatch({ firstName: 'Sarah', lastName: 'Wolff' }, 1, 'Sarah Wolff')
  );
});

test('can find person by full name with non-basic characters test 1', () => {
  expect(searcher.getMatches(new Query('Jesús Berríos Araña')).matches[0]).toEqual(
    new EntityMatch({ firstName: 'Jesús', lastName: 'Berríos Araña' }, 1, 'Jesús Berríos Araña')
  );
});

test('can find person by full name with non-basic characters test 2', () => {
  expect(searcher.getMatches(new Query('Božica Jagrić')).matches[0]).toEqual(
    new EntityMatch({ firstName: 'Božica', lastName: 'Jagrić' }, 1, 'Božica Jagrić')
  );
});

test('can find person by full name with non-basic characters test 3', () => {
  expect(searcher.getMatches(new Query('Marie Løken')).matches[0]).toEqual(
    new EntityMatch({ firstName: 'Marie', lastName: 'Løken' }, 1, 'Marie Løken')
  );
});

test('can find persons with approximate match test1', () => {
  const matches = searcher.getMatches(new Query('Sar')).matches;
  expect(matches.length).toBeGreaterThan(1);

  const bestMatch = matches[0];
  expect(bestMatch.matchedString).toBe('Sarah');
  expect(bestMatch.quality).toBeCloseTo((3 / 6) * 0.95, 6);
  // 3 out of 6 n-grams match, 0.05 penalty for hash difference.

  const secondMatch = matches[1];
  expect(secondMatch.matchedString).toBe('Sauer');
  expect(secondMatch.quality).toBeCloseTo((2 / 6) * 0.95, 6);
  // 2 out of 6 n-grams match, 0.05 penalty for hash difference.
});

test('can find persons with approximate match test2', () => {
  const matches = searcher.getMatches(new Query('arah')).matches;
  expect(matches.length).toBeGreaterThan(0);
  const bestMatch = matches[0];
  expect(bestMatch.matchedString).toBe('Sarah');
  expect(bestMatch.quality).toBeCloseTo((3 / 6) * 0.95, 6);
  // 3 out of 6 n-grams match, 0.05 penalty for hash difference.
});

test('can find persons with approximate match test3', () => {
  const matches = searcher.getMatches(new Query('sarha')).matches;
  expect(matches.length).toBeGreaterThan(0);
  const bestMatch = matches[0];
  expect(bestMatch.matchedString).toBe('Sarah');
  expect(bestMatch.quality).toBeCloseTo((5 / 6) * 0.95, 6);
  // 5 out of 6 n-grams match, 0.05 penalty for hash difference.
});

test("don't return results below min quality", () => {
  const matches = searcher.getMatches(new Query('Sar', 10, 0.3)).matches;
  expect(matches.filter((m) => m.quality < 0.3)).toEqual([]);
});

test('every entity is returned only once', () => {
  const matches = searcher.getMatches(new Query('Sarah')).matches;
  const matchedEntities = new Set(matches.map((m) => m.entity));
  expect(matches.length).toEqual(matchedEntities.size);
});

const reindexedSearcher: EntitySearcher<
  { firstName: string; lastName: string },
  { firstName: string; lastName: string }
> = EntitySearcherFactory.createSearcher(Config.createDefaultConfig());
reindexedSearcher.indexEntities(
  TestData.personsNonLatin,
  (person) => person,
  (person) => [person.firstName, person.lastName, `${person.firstName} ${person.lastName}`]
);
reindexedSearcher.indexEntities(
  persons,
  (person) => person,
  (person) => [person.firstName, person.lastName, `${person.firstName} ${person.lastName}`]
);

test('can find person by first name with reindexed searcher', () => {
  expect(reindexedSearcher.getMatches(new Query('Sarah')).matches[0]).toEqual(
    new EntityMatch({ firstName: 'Sarah', lastName: 'Wolff' }, 1, 'Sarah')
  );
});

test('can find person by last name with reindexed searcher', () => {
  expect(reindexedSearcher.getMatches(new Query('Wolff')).matches[0]).toEqual(
    new EntityMatch({ firstName: 'Sarah', lastName: 'Wolff' }, 1, 'Wolff')
  );
});

test('can find person by full name with reindexed searcher', () => {
  expect(searcher.getMatches(new Query('Sarah Wolff')).matches[0]).toEqual(
    new EntityMatch({ firstName: 'Sarah', lastName: 'Wolff' }, 1, 'Sarah Wolff')
  );
});
