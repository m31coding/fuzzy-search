import { StringUtilities } from './commons/string-utilities.js';
import { Config } from './config.js';
import { Query } from './interfaces/query.js';
import { FuzzySearcher, PrefixSearcher, SubstringSearcher } from './interfaces/searcher-spec.js';
import { SearcherType } from './interfaces/searcher-type.js';
import { LatinReplacements } from './normalization/latin-replacements.js';
import { SearcherFactory } from './searcher-factory.js';
import { SortOrder } from './sort-order.js';

///
/// Indexing configuration
///

const config = Config.createDefaultConfig();
// make adjustments as needed
const searcher = SearcherFactory.createSearcher(config);

/**
 * The default configuration has been chosen carefully. There are only a few specific scenarios that require
 * adjustments (see below).
 */

config.searcherTypes = [SearcherType.Fuzzy, SearcherType.Substring, SearcherType.Prefix];
config.maxQueryLength = 150;
config.sortOrder = SortOrder.QualityAndMatchedString;

config.normalizerConfig.replacements = [LatinReplacements.Value];
const spaceEquivalentCharacters = new Set(['_', '-', '–', '/', ',', '\t']);
config.normalizerConfig.treatCharacterAsSpace = (c) => spaceEquivalentCharacters.has(c);
config.normalizerConfig.allowCharacter = (c) => {
  return StringUtilities.isAlphanumeric(c);
};

config.fuzzySearchConfig!.paddingLeft = '$$';
config.fuzzySearchConfig!.paddingRight = '!';
config.fuzzySearchConfig!.paddingMiddle = '!$$';
config.fuzzySearchConfig!.ngramN = 3;
config.fuzzySearchConfig!.transformNgram = (ngram) =>
  ngram.endsWith('$') ? null
  : ngram.indexOf('$') === -1 ? ngram.split('').sort().join('')
  : ngram;
config.fuzzySearchConfig!.inequalityPenalty = 0.05;

config.substringSearchConfig!.suffixArraySeparator = '$';

/**
 * If the data terms contain characters and strings in non-latin scripts (such as Arabic, Cyrillic, Greek, Han, ...),
 * adjust the normalizer config to allow those characters as well.
 */

config.normalizerConfig.allowCharacter = (_c) => true;

/**
 * Remove a searcher type if it is undesired. This will improve indexing performance.
 */

config.searcherTypes = [SearcherType.Substring, SearcherType.Prefix];

/**
 * Change the padding and separator characters ('$' and '!') if they appear in your data terms or are relevant for
 * searching. Choose characters that do not occur in your data terms and are not relevant for searching. Here, we use
 * the Greekcharacters 'μ' and 'ν'. Of course, choose different characters if you are indexing Greek terms.
 */

config.fuzzySearchConfig!.paddingLeft = 'μμ';
config.fuzzySearchConfig!.paddingRight = 'ν';
config.fuzzySearchConfig!.paddingMiddle = 'νμμ';
config.fuzzySearchConfig!.ngramN = 3;
config.fuzzySearchConfig!.transformNgram = (ngram) =>
  ngram.endsWith('μ') ? null
  : ngram.indexOf('μ') === -1 ? ngram.split('').sort().join('')
  : ngram;
config.fuzzySearchConfig!.inequalityPenalty = 0.05;

config.substringSearchConfig!.suffixArraySeparator = 'μ';

///
/// Query configuration
///

/**
 * The following two query instances are equivalent:
 */

const query = new Query('alice kign');

const defaultQuery = new Query('alice kign', 10, [
  new FuzzySearcher(0.3),
  new SubstringSearcher(0),
  new PrefixSearcher(0)
]);

/**
 * Adjust the topN parameter as needed, to obtain more or fewer matches:
 */

const queryTop25 = new Query('alice kign', 25);

/**
 * The quality thresholds are well chosen for general purpose searching. Quality 0 for the substring and prefix
 * searchers express that any match is relevant. The fuzzy searcher threshold of 0.3 is a good trade-off between recall
 * and precision. A lower value will result in matches that are most likely irrelevant.
 */
