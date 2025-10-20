/**
 * Holds fuzzy search configuration values.
 */
export class FuzzySearchConfig {
    /**
     * Creates a new instance of the FuzzySearchConfig class.
     * @param paddingLeft The string that is appended to the left of the input string.
     * @param paddingRight The string that is appended to the right of the input string.
     * @param paddingMiddle The string that is inserted for spaces in the input string.
     * @param ngramN The number of characters in each n-gram.
     * @param transformNgram A function for transforming each n-gram. N-grams that are transformed to null will be
     * removed.
     * @param inequalityPenalty The inequality penalty.
     */
    public constructor(
        public paddingLeft: string,
        public paddingRight: string,
        public paddingMiddle: string,
        public ngramN: number,
        public transformNgram: (ngram: string) => string | null,
        public inequalityPenalty: number,
    ) { }

    /**
     * Creates an opinionated default configuration with n=3. Strings are padded with '$$' on the left, '!' on the 
     * right, and '!$$' in the middle. N-grams that end with '$' are removed. N-grams that don't contain '$' are sorted.
     * @returns The default configuration.
     */
    public static createDefaultConfig(): FuzzySearchConfig {
        const transformNgram = (ngram: string): string | null => {
            return ngram.endsWith('$') ? null
                : ngram.indexOf('$') === -1 ? ngram.split('').sort().join('')
                    : ngram
        }
        return new FuzzySearchConfig('$$', '!', '!$$', 3, transformNgram, 0.05);
    }
}