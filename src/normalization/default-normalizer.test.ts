import { DefaultNormalizer } from './default-normalizer.js';
import { NormalizerConfig } from './normalizer-config.js';

const config = NormalizerConfig.createDefaultConfig();
const normalizer = DefaultNormalizer.create(config);

test('German Eszett', () => {
  expect(normalizer.normalize('Fußball')).toBe('fussball');
});

test('German umlauts', () => {
  expect(normalizer.normalize('ä ö ü')).toBe('ae oe ue');
});

test('variatons of a', () => {
  // source: https://en.wiktionary.org/wiki/Appendix:Latin_script
  expect(
    normalizer.normalize(
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
    normalizer.normalize(
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
  expect(normalizer.normalize('ſ ẞß Śś Ṥṥ Ŝŝ Šš Ṧṧ Ṡṡẛ Şş Ṣṣ Ṩṩ Șș S̩s̩ ᵴ ᶊ ʂ ȿ ꜱ Ʃʃ Ｓｓ')).toBe(
    's ssss ss ss ss ss ss sss ss ss ss ss ss s s s s s ss ss'
  );
});
