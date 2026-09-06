export function convertBase(num, fromBase, toBase) {
  const numIn10 = parseInt(num, fromBase);
  if (!Number.isSafeInteger(numIn10)) {
    throw new RangeError('Number exceeds safe range');
  }
  return numIn10.toString(toBase);
}
