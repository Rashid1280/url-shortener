require('dotenv').config();
require('./config/db');
const PORT= process.env.PORT;
const express = require('express');
const app = express();
const Link = require('./models/Link')
const getNextSequence = require('./utils/getNextSequence');
const encodeBase62 = require('./utils/base62');
const hashLink = require('./utils/createHashedLink');

app.use(express.json());

app.get('/',(req, res)=>{
    res.send("shortener is alive baby.");
});

app.post('/shorten', async (req, res)=>{
    const url = req.body?.url;
    if(!url) return res.status(400).json({error:"url cannot be empty"});
    try {
        new URL(url);
    } catch (error) {
       return res.status(400).json({error: "Please enter a valid url"})
    }
 
    try {
        const counter = await getNextSequence();
        const code = encodeBase62(counter);
        await Link.create({code,url});
        return res.status(201).json({code});
    } catch (error) {
        console.error(error)
        return res.status(500).json({error:"Something went wrong in server side"});
    }
});

app.get('/:code', async (req, res)=>{
    const code = req.params.code;
    try {
        const value = await Link.findOne({code});
        if(!value) return res.status(404).json({error: "Short link not found"});
        return res.redirect(value.url);
    } catch (error) {
        console.error(error);
        return res.status(500).json({error:"Something went wrong on server side"});   
    }   
})


app.listen(PORT,()=>{
    console.log(`listening in port: ${PORT}`);
     
     
});

