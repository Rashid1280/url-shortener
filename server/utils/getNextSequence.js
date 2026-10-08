const Counter = require('../models/Counter');

async function getNextSequence() {
    const doc = await Counter.findOneAndUpdate(
        {name: 'counter'},
        {$inc: {
            seq:1
        }},
        {upsert:true, returnDocument: 'after'},
    )
    return doc.seq;
}
module.exports = getNextSequence;