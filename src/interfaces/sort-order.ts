/**
 * Specifies the sort order for the entity matches.
 */
export enum SortOrder {
  /**
   * Sort by quality first, then by index.
   */
  QualityAndIndex = 'qualityAndIndex',

  /**
   * Sort by quality first, then by matched string.
   */
  QualityAndMatchedString = 'qualityAndMatchedString'
}
