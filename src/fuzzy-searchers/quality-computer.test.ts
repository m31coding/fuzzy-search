import { QualityComputer } from './quality-computer';

test('can compute Jaccard coefficient test 1', () => {
  expect(QualityComputer.ComputeJaccardCoefficient(3, 5, 0)).toEqual(0);
});

test('can compute Jaccard coefficient test 2', () => {
  expect(QualityComputer.ComputeJaccardCoefficient(2, 2, 2)).toEqual(1);
});

test('can compute Jaccard coefficient test 3', () => {
  expect(QualityComputer.ComputeJaccardCoefficient(3, 5, 2)).toBeCloseTo(1 / 3, 6);
});

test('can compute Jaccard coefficient test 4', () => {
  expect(QualityComputer.ComputeJaccardCoefficient(3, 4, 2)).toBeCloseTo(2 / 5, 6);
});

test('can compute overlap max coefficient test 1', () => {
  expect(QualityComputer.ComputeOverlapMaxCoefficient(3, 5, 0)).toEqual(0);
});

test('can compute overlap max coefficient test 2', () => {
  expect(QualityComputer.ComputeOverlapMaxCoefficient(2, 2, 2)).toEqual(1);
});

test('can compute overlap max coefficient test 3', () => {
  expect(QualityComputer.ComputeOverlapMaxCoefficient(3, 5, 2)).toEqual(2 / 5);
});

test('can compute overlap max coefficient test 4', () => {
  expect(QualityComputer.ComputeOverlapMaxCoefficient(3, 4, 2)).toEqual(2 / 4);
});
