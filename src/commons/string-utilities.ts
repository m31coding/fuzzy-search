/**
 * Contains utility functions for normalization.
 */
export class StringUtilities {
  /**
   * Checks whether the character is part of a surrogate pair.
   * @param character The character to check.
   * @returns True if the character is part of a surrogate pair, false otherwise.
   */
  public static isSurrogate(character: string): boolean {
    const charCode = character.charCodeAt(0);
    if (charCode >= 0xd800 && charCode <= 0xdfff) {
      return true;
    }
    return false;
  }

  /**
   * Checks whether the character is alphanumeric.
   * @param character The character to check.
   * @returns True if the character alphanumeric.
   */
  public static isAlphanumeric(character: string): boolean {
    const charCode = character.charCodeAt(0);
    return (
      (charCode >= 0x0030 && charCode <= 0x0039) || // 0-9
      (charCode >= 0x0041 && charCode <= 0x005a) || // A-Z
      (charCode >= 0x0061 && charCode <= 0x007a)
    ); // a-z
  }

  /**
   * Checks whether the character is a lower alpha character.
   * @param character The character to check.
   * @returns True if the character is a lower alpha character.
   */
  public static isLowerAlpha(character: string): boolean {
    const charCode = character.charCodeAt(0);
    return charCode >= 0x0061 && charCode <= 0x007a; // a-z
  }
}
