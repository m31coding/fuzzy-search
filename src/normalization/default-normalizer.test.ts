import { DefaultNormalizer } from './default-normalizer.js';
import { NormalizerConfig } from './normalizer-config.js';

const normalizer = DefaultNormalizer.create(NormalizerConfig.createDefaultConfig());

const config = NormalizerConfig.createDefaultConfig();
config.paddingLeft = '';
config.paddingRight = '';
config.paddingMiddle = ' ';
const noPaddingNormalizer = DefaultNormalizer.create(config);

test('normalization test 1', () => {
  expect(normalizer.normalize('Mikael Håkansson')).toBe('$$mikael!$$haakansson!');
});

test('normalization test 2', () => {
  expect(normalizer.normalize('Klara Åberg')).toBe('$$klara!$$aaberg!');
});

test('normalization test 3', () => {
  expect(normalizer.normalize('Andel Hadžić')).toBe('$$andel!$$hadzic!');
});

test('normalization test 4', () => {
  expect(normalizer.normalize('Lenni Gilliéron')).toBe('$$lenni!$$gillieron!');
});

test('normalization test 5', () => {
  expect(normalizer.normalize('Julieta Nieto Ríos')).toBe('$$julieta!$$nieto!$$rios!');
});

test('normalization test 6', () => {
  expect(normalizer.normalize('Æstrid Ærenlund')).toBe('$$aestrid!$$aerenlund!');
});

test('normalization test 7', () => {
  expect(normalizer.normalize('Ømer Østergaard')).toBe('$$omer!$$ostergaard!');
});

test('normalization test 8', () => {
  expect(normalizer.normalize('Sơn Lâm Đặng')).toBe('$$son!$$lam!$$dang!');
});

test('normalization test 9', () => {
  expect(normalizer.normalize('Thanh Việt Đoàn')).toBe('$$thanh!$$viet!$$doan!');
});

test('normalization test 10', () => {
  expect(normalizer.normalize('Thiên Duyên Tô')).toBe('$$thien!$$duyen!$$to!');
});

test('German Eszett', () => {
  expect(noPaddingNormalizer.normalize('Fußball')).toBe('fussball');
});

test('German umlauts', () => {
  expect(noPaddingNormalizer.normalize('ä ö ü')).toBe('ae oe ue');
});

test('variatons of a', () => {
  // source: https://en.wiktionary.org/wiki/Appendix:Latin_script
  expect(
    noPaddingNormalizer.normalize(
      'Áá Àà Ââ Ǎǎ Ăă Ãã Ảả Ȧȧ Ạạ Ää Åå Ḁḁ Āā Ąą ᶏ Ⱥⱥ Ȁȁ Ấấ Ầầ Ẫẫ Ẩẩ Ậậ Ắắ Ằằ Ẵẵ Ẳẳ Ặặ Ǻǻ Ǡǡ Ǟǟ Ȃȃ Ɑɑ ᴀ Ɐɐ ɒ Ａａ' +
        ' Ææ ᴁ ᴭ ᵆ Ǽǽ Ǣǣ ᴂ'
    )
  ).toBe(
    'aa aa aa aa aa aa aa aa aa aeae aaaa aa aa aa a aa aa aa aa aa aa aa aa aa aa aa aa aa aa aa aa aa a aa a aa' +
      ' aeae ae ae ae aeae aeae ae'
  );
});

test('variatons of u', () => {
  // source: https://en.wiktionary.org/wiki/Appendix:Latin_script
  expect(
    noPaddingNormalizer.normalize(
      'Úú Ùù Ŭŭ Ûû Ǔǔ Ůů Üü Ǘǘ Ǜǜ Ǚǚ Ǖǖ Űű Ũũ Ṹṹ Ųų Ūū Ṻṻ Ủủ Ȕȕ Ȗȗ Ưư Ứứ Ừừ Ữữ Ửử Ựự Ụụ Ṳṳ Ṷṷ Ṵṵ Ʉʉ Ʊʊ Ȣȣ ᵾ ᶙ ᴜ Ｕｕ' +
        ' ᵫ ɯ'
    )
  ).toBe(
    'uu uu uu uu uu uu ueue uu uu uu uu uu uu uu uu uu uu uu uu uu uu uu uu uu uu uu uu uu uu uu uu uu ouou u u u uu' +
      ' ue m'
  );
});

test('variatons of s', () => {
  // source: https://en.wiktionary.org/wiki/Appendix:Latin_script
  expect(noPaddingNormalizer.normalize('ſ ẞß Śś Ṥṥ Ŝŝ Šš Ṧṧ Ṡṡẛ Şş Ṣṣ Ṩṩ Șș S̩s̩ ᵴ ᶊ ʂ ȿ ꜱ Ʃʃ Ｓｓ')).toBe(
    's ssss ss ss ss ss ss sss ss ss ss ss ss s s s s s ss ss'
  );
});
