const mongoose = require('mongoose');
const linkSchema = new mongoose.Schema({
    url: {type:String, required : true, trim: true, },
    code: {type:String, required : true, unique: true,},
    createdAt: {type:Date,	default: Date.now, },
    clicks: {type:Number, default : 0, },
    expiresAt: {type:Date, },

})

module.exports = mongoose.model('Link',linkSchema);