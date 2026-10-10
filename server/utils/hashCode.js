const crypto = require('crypto');
const base62 = require('./base62');

function hashCode(url, attempt=0){

    const hash = crypto.createHash('sha256').update(`${url} | ${attempt}`).digest('hex');
    const trimHash = hash.slice(0,10);
    const numberHash = parseInt(trimHash,16);
    return base62(numberHash);
    
}

module.exports = hashCode;