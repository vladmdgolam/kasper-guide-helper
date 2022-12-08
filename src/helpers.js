export function closestFraction(aspect, fractions) {
  // Calculate the absolute difference between the given aspectber and each fraction in the list
  const diffs = fractions.map(([fr]) => {
    const fraction = fr.split(":").reduce((a, b) => a / b)
    return Math.abs(fraction - aspect)
  })

  // Find the index of the smallest difference (the closest fraction)
  const closestIndex = diffs.indexOf(Math.min(...diffs))

  // Return the value of the closest fraction
  const closest = fractions[closestIndex]
  return [closest[0], closest[1]]
}
