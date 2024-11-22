import { DefaultNormalizer } from './default-normalizer.js';
import { NormalizerConfig } from './normalizer-config.js';

const config = NormalizerConfig.createDefaultConfig();
config.paddingLeft = '';
config.paddingRight = '';
config.paddingMiddle = ' ';
config.allowCharacter = (_c: string) => true;
const normalizer = DefaultNormalizer.create(config);

/**
 * We test that the default normalizer does not exclude characters from
 * non-latin languages if configured such that all characters are allowed.
 * For each language from Faker.js, we test the normalization
 * of person names (first name + last name).
 */

test('Arabic test 1', () => testNormalization('راشد سعيد'));
test('Arabic test 2', () => testNormalization('جهاد السقاط'));
test('Arabic test 3', () => testNormalization('حكيم جاوحدو'));
test('Farsi/Persian test 1', () => testNormalization('کامبخش گلپایگانی'));
test('Farsi/Persian test 2', () => testNormalization('مهراندخت محمدی'));
test('Farsi/Persian test 3', () => testNormalization('گلناز مجتهدی'));
test('Urdu test 1', () => testNormalization('عثمان آفریدی'));
test('Urdu test 2', () => testNormalization('عادل نیازی'));
test('Urdu test 3', () => testNormalization('حمزہ احمد'));
test('Armenian test 1', () => testNormalization('Ռուբեն Մնացականյան'));
test('Armenian test 2', () => testNormalization('Գևորգ Ստեփանյան'));
test('Armenian test 3', () => testNormalization('Գոռ Համբարձումյան'));
test('Macedonian test 1', () => testNormalization('Гроздан Хаџиниколов'));
test('Macedonian test 2', () => testNormalization('Јулијана Спасов'));
test('Macedonian test 3', () => testNormalization('Милица Неделковска'));
test('Russian test 1', () => testNormalization('Валерия'));
test('Russian test 2', () => testNormalization('Юрий'));
test('Russian test 3', () => testNormalization('Элеонора'));
test('Ukrainian test 1', () => testNormalization('Пантелеймон'));
test('Ukrainian test 2', () => testNormalization('Поляна'));
test('Ukrainian test 3', () => testNormalization('В’ячеслава'));
test('Georgian test 1', () => testNormalization('ნათელა ზუბიაშვილი'));
test('Georgian test 2', () => testNormalization('ქეთათო დარბაისელი'));
test('Georgian test 3', () => testNormalization('ნანა დარბაისელი'));
test('Greek test 1', () => testNormalization('Κώστας Κοντολέων'));
test('Greek test 2', () => testNormalization('Παναγιωτα Βλαβιανός'));
test('Greek test 3', () => testNormalization('Μαρια Αγγελίδης'));
test('Chinese (China) test 1', () => testNormalization('昊然 邵'));
test('Chinese (China) test 2', () => testNormalization('智辉 杨'));
test('Chinese (China) test 3', () => testNormalization('鹏涛 陶'));
test('Chinese (Taiwan) test 1', () => testNormalization('正豪 朱'));
test('Chinese (Taiwan) test 2', () => testNormalization('健雄 於'));
test('Chinese (Taiwan) test 3', () => testNormalization('紹齊 蕭'));
test('Hebrew test 1', () => testNormalization('עלמא שפע'));
test('Hebrew test 2', () => testNormalization('דורון דורי'));
test('Hebrew test 3', () => testNormalization('צוק דוידי'));
test('Japanese test 1', () => testNormalization('結衣 山口'));
test('Japanese test 2', () => testNormalization('杏 松本'));
test('Japanese test 3', () => testNormalization('海翔 小林'));
test('Korean test 1', () => testNormalization('형민 함'));
test('Korean test 2', () => testNormalization('예환 옥'));
test('Korean test 3', () => testNormalization('하록 국'));
test('Maldivian test 1', () => testNormalization('އިލްޔާސް ފާއިޤު'));
test('Maldivian test 2', () => testNormalization('ޖަމީލާ ސާމިޤާ'));
test('Maldivian test 3', () => testNormalization('ޖުވައިރިއްޔާ މަދާ'));
test('Thai test 1', () => testNormalization('สมตระกูล'));
test('Thai test 2', () => testNormalization('มณีจันทึก'));
test('Thai test 3', () => testNormalization('งามจันทึก'));

function testNormalization(string: string) {
  const normalized = normalizer.normalize(string);
  const normalizedSimple = string.toLowerCase().normalize('NFKD');
  expect(normalized).toBe(normalizedSimple);
}
