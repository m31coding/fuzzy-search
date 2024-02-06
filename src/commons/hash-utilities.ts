/**
 * Hash utility functions.
 */
export class HashUtilities {
  /**
   * Computes a 32 bit hash code for the given string.
   * @param input The string.
   * @returns The 32 bit hash code.
   */
  public static getHashCode(input: string): number {
    // Implementation follows https://stackoverflow.com/questions/36845430/persistent-hashcode-for-strings.
    let hash1 = 5381;
    let hash2 = hash1;

    for (let i = 0, l = input.length; i < l && input[i] != '\0'; i += 2) {
      hash1 = ((hash1 << 5) + hash1) ^ input.charCodeAt(i);
      if (i === l - 1 || input[i + 1] === '\0') {
        break;
      }
      hash2 = ((hash2 << 5) + hash2) ^ input.charCodeAt(i + 1);
    }
    return (hash1 + hash2 * 1566083941) | 0;
  }
}
