/**
 * Contains utility functions for arrays.
 */
export class ArrayUtilities {
  /**
   * Converts a number array to an Int32Array.
   * @param numberArray The number array to convert.
   * @returns The Int32Array.
   */
  public static ToInt32Array(numberArray: number[]): Int32Array {
    const int32Array = new Int32Array(numberArray.length);
    for (let i = 0, l = numberArray.length; i < l; i++) {
      int32Array[i] = numberArray[i];
    }
    return int32Array;
  }
}
