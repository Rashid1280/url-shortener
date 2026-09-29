require('dotenv').config();
const PORT= process.env.PORT;
const express = require('express');
const app = express();

app.use(express.json());
const myDB = new Map();

app.get('/',(req, res)=>{
    res.send("shortener is alive baby.");
});

app.post('/shorten', (req, res)=>{
    const url = req.body?.url;
    if(!url) return res.status(400).json({error:"Please enter a valid url"});
    const code = Math.random().toString(36).substring(2,8);
    myDB.set(code,url);
    console.log(myDB);
    return res.status(201).json({code:`${code}`});
});

app.get('/:code', (req, res)=>{
    const code = req.params.code;
    const value = myDB.get(code);
    if(!value) return res.status(404).json({error: "Short link not found"});
    return res.redirect(value);
})


app.listen(PORT,()=>{
    console.log(`listening in port: ${PORT}`);
     
     
});

