require('dotenv').config();
require('./config/db');
const RESERVED = [
  'shorten', 'admin', 'login', 'logout', 'signup', 'register',
  'dashboard', 'stats', 'analytics', 'health', 'status',
  'static', 'assets', 'public', 'account', 'profile',
  'settings', 'support', 'contact', 'privacy', 'terms'
];
const PORT= process.env.PORT;
const express = require('express');
const app = express();
const Link = require('./models/Link')
const getNextSequence = require('./utils/getNextSequence');
const encodeBase62 = require('./utils/base62');

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

    //Custom Alias check
  const alias = req.body?.alias;
if (alias) {
  if (typeof alias !== 'string') {
    return res.status(400).json({ error: "Custom alias can only be a string" });
  }
  if (!/^[a-zA-Z0-9-]{5,15}$/.test(alias)) {
    return res.status(400).json({ error: "Alias must be 5-15 characters: letters, numbers, hyphens" });
  }
  if (RESERVED.includes(alias.toLowerCase())) {
    return res.status(400).json({ error: "That alias is reserved" });
  }
  try {
    await Link.create({ code: alias, url });
    return res.status(201).json({ code: alias });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: "That alias is already taken" });
    }
    console.error(error);
    return res.status(500).json({ error: "Something went wrong on the server" });
  }
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

