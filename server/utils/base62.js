const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function encodeBase62(n) {
  if (n === 0) return ALPHABET[0];

  let result = '';
  while (n > 0) {
    const remainder = n % 62;
    result = ALPHABET[remainder] + result;
    n = Math.floor(n / 62);
  }
  return result;
}

module.exports = encodeBase62;