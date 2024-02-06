import { Config } from '../config';
import { EntityMatch } from '../interfaces/entity-match';
import { EntitySearcher } from '../interfaces/entity-searcher';
import { EntitySearcherFactory } from './entity-searcher-factory';
import { Query } from '../interfaces/query';
import { TestData } from '../commons/test-data';

const config: Config = Config.createDefaultConfig();
config.normalizerConfig.allowCharacter = (_c: string) => true;
const searcher: EntitySearcher<{ firstName: string; lastName: string }, { firstName: string; lastName: string }> =
  EntitySearcherFactory.createSearcher(config);
searcher.indexEntities(
  TestData.personsNonLatin,
  (person) => person,
  (person) => [person.firstName, person.lastName, `${person.firstName} ${person.lastName}`]
);

test('searcher returns zero matches for empty query', () => {
  expect(searcher.getMatches(new Query('')).matches).toEqual([]);
});

test('can find person by first name test 1', () => {
  expect(searcher.getMatches(new Query('گلپایگانی')).matches[0]).toEqual(
    new EntityMatch({ firstName: 'گلپایگانی', lastName: 'کامبخش' }, 1, 'گلپایگانی')
  );
});

test('can find person by first name test 2', () => {
  expect(searcher.getMatches(new Query('Гроздан')).matches[0]).toEqual(
    new EntityMatch({ firstName: 'Гроздан', lastName: 'Хаџиниколов' }, 1, 'Гроздан')
  );
});

test('can find person by first name test 3', () => {
  expect(searcher.getMatches(new Query('ნათელა')).matches[0]).toEqual(
    new EntityMatch({ firstName: 'ნათელა', lastName: 'ზუბიაშვილი' }, 1, 'ნათელა')
  );
});

test('can find person by first name test 4', () => {
  expect(searcher.getMatches(new Query('結衣')).matches[0]).toEqual(
    new EntityMatch({ firstName: '結衣', lastName: '山口' }, 1, '結衣')
  );
});

test('can find person by last name test 1', () => {
  expect(searcher.getMatches(new Query('کامبخش')).matches[0]).toEqual(
    new EntityMatch({ firstName: 'گلپایگانی', lastName: 'کامبخش' }, 1, 'کامبخش')
  );
});

test('can find person by last name test 2', () => {
  expect(searcher.getMatches(new Query('Хаџиниколов')).matches[0]).toEqual(
    new EntityMatch({ firstName: 'Гроздан', lastName: 'Хаџиниколов' }, 1, 'Хаџиниколов')
  );
});

test('can find person by last name test 3', () => {
  expect(searcher.getMatches(new Query('ზუბიაშვილი')).matches[0]).toEqual(
    new EntityMatch({ firstName: 'ნათელა', lastName: 'ზუბიაშვილი' }, 1, 'ზუბიაშვილი')
  );
});

test('can find person by last name test 4', () => {
  expect(searcher.getMatches(new Query('山口')).matches[0]).toEqual(
    new EntityMatch({ firstName: '結衣', lastName: '山口' }, 1, '山口')
  );
});

test('can find person by full name test 1', () => {
  // Note that for this test to pass, the query has to be 'lastName firstName', as Arabic is written right-to-left.
  expect(searcher.getMatches(new Query('گلپایگانی کامبخش')).matches[0]).toEqual(
    new EntityMatch({ firstName: 'گلپایگانی', lastName: 'کامبخش' }, 1, 'گلپایگانی کامبخش')
  );
});

test('can find person by full name test 2', () => {
  expect(searcher.getMatches(new Query('Гроздан Хаџиниколов')).matches[0]).toEqual(
    new EntityMatch({ firstName: 'Гроздан', lastName: 'Хаџиниколов' }, 1, 'Гроздан Хаџиниколов')
  );
});

test('can find person by full name test 3', () => {
  expect(searcher.getMatches(new Query('ნათელა ზუბიაშვილი')).matches[0]).toEqual(
    new EntityMatch({ firstName: 'ნათელა', lastName: 'ზუბიაშვილი' }, 1, 'ნათელა ზუბიაშვილი')
  );
});

test('can find person by full name test4', () => {
  expect(searcher.getMatches(new Query('結衣 山口')).matches[0]).toEqual(
    new EntityMatch({ firstName: '結衣', lastName: '山口' }, 1, '結衣 山口')
  );
});

test('can find persons with approximate match test 1', () => {
  const matches = searcher.getMatches(new Query('گلپا')).matches;
  expect(matches.length).toBeGreaterThan(0);
  const bestMatch = matches[0];
  expect(bestMatch.matchedString).toBe('گلپایگانی');
  expect(bestMatch.quality).toBeCloseTo((4 / 10) * 0.95, 6);
  // 4 out of 10 n-grams match, 0.05 penalty for hash difference.
});

test('can find persons with approximate match test 2', () => {
  const matches = searcher.getMatches(new Query('џиникол')).matches;
  expect(matches.length).toBeGreaterThan(0);
  const bestMatch = matches[0];
  expect(bestMatch.matchedString).toBe('Хаџиниколов');
  expect(bestMatch.quality).toBeCloseTo((5 / 12) * 0.95, 6);
  // 5 out of 12 n-grams match, 0.05 penalty for hash difference.
});

test('can find persons with approximate match test 3', () => {
  const matches = searcher.getMatches(new Query('ზბიაშვილი')).matches;
  expect(matches.length).toBeGreaterThan(0);
  const bestMatch = matches[0];
  expect(bestMatch.matchedString).toBe('ზუბიაშვილი');
  expect(bestMatch.quality).toBeCloseTo((8 / 11) * 0.95, 6);
  // 8 out of 11 n-grams match, 0.05 penalty for hash difference.
});

test('can find persons with approximate match test 4', () => {
  const matches = searcher.getMatches(new Query('結')).matches;
  expect(matches.length).toBeGreaterThan(0);
  const bestMatch = matches[0];
  expect(bestMatch.matchedString).toBe('結衣');
  expect(bestMatch.quality).toBeCloseTo((1 / 3) * 0.95, 6);
  // 1 out of 3 n-grams match, 0.05 penalty for hash difference.
});
