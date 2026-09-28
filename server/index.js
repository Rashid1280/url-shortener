const express = require('express');
const app = express();

app.get('/',(req, res)=>{
    res.send("shortener is alive baby.");
})

app.listen(3000,()=>{
    console.log("listening in port 3000");
    
})

