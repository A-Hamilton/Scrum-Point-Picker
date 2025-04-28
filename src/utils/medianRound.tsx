// src/utils/medianRound.ts

/**
 * Given a sorted array of numbers, return the median.
 * If even length, returns the lower middle of the two.
 */
function median(values: number[]): number {
    const mid = Math.floor(values.length / 2);
    if (values.length % 2 === 1) {
      return values[mid];
    } else {
      // lower-middle: average then rounded down
      return Math.floor((values[mid - 1] + values[mid]) / 2);
    }
  }
  
  /**
   * From a list of allowed options, pick the one closest to `n`.
   */
  function closestOption(n: number, options: number[]): number {
    return options.reduce((prev, curr) =>
      Math.abs(curr - n) < Math.abs(prev - n) ? curr : prev
    );
  }
  
  /**
   * Compute the “median story point” given raw votes array.
   * - Filters out nulls
   * - Sorts
   * - Computes median
   * - Snaps to closest valid option
   *
   * @param rawVotes Array of numbers or null (unvoted)
   * @param validOptions List of Fibonacci-ish options
   * @returns nearest valid option, or null if no votes
   */
  export default function medianRound(
    rawVotes: Array<number | null>,
    validOptions: number[] = [1, 2, 3, 5, 8, 13, 21]
  ): number | null {
    const nums = rawVotes
      .filter((v): v is number => v !== null)
      .sort((a, b) => a - b);
  
    if (nums.length === 0) return null;
  
    const med = median(nums);
    return closestOption(med, validOptions);
  }
  