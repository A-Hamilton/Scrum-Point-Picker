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
 * Given a target number and an array of valid options,
 * returns the closest option by absolute difference.
 */
function closestOption(target: number, options: number[]): number {
  return options.reduce((prev, curr) =>
    Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
  );
}

/**
 * Rounds the median of rawVotes to the closest valid option.
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