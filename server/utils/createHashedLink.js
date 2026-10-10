const hashCode = require('./hashCode');
const link = require('../models/Link')

async function hashLink(url) {
    const MAX = 5;
    for (let attempt = 0; attempt < MAX; attempt++) {
        const code = hashCode(url, attempt);
         const existing = await link.findOne({code});
        if(!existing){
            await link.create({code,url});
            return { code, created: true } 
        }
        if(existing.url === url){
            return { code, created: false }
        }
    }
        throw new Error('No free code was found after the maximum attempts'); 
}
module.exports = hashLink;