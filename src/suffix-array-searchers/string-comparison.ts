/**
 * Provides string comparison utilities.
 */
export class StringComparison {
  /**
   * Compares two substrings of the given strings using ordinal comparison.
   *
   * @param strA - The first string.
   * @param indexA - The starting index of the substring in the first string.
   * @param strB - The second string.
   * @param indexB - The starting index of the substring in the second string.
   * @param length - The maximum length of the substrings to compare.
   * @returns A negative number if the first substring comes before the second,
   *          a positive number if the first substring comes after the second,
   *          or zero if they are equal.
   */
  public static compareOrdinal(strA: string, indexA: number, strB: string, indexB: number, length: number): number {
    const endA = Math.min(indexA + length, strA.length);
    const endB = Math.min(indexB + length, strB.length);

    let iA = indexA;
    let iB = indexB;

    while (iA < endA && iB < endB) {
      const codeA = strA.charCodeAt(iA);
      const codeB = strB.charCodeAt(iB);

      if (codeA < codeB) {
        return -1;
      }
      if (codeA > codeB) {
        return 1;
      }

      iA++;
      iB++;
    }

    const lenComparedA = endA - indexA;
    const lenComparedB = endB - indexB;

    if (lenComparedA === lenComparedB) {
      return 0;
    }
    return lenComparedA < lenComparedB ? -1 : 1;
  }
}
