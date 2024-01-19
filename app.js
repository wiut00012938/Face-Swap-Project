let fs = require('fs')
const express = require('express');
const path = require('path')
const app = express();

let PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use('/static', express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    res.render('index')
})

app.listen(PORT, error => {
    if(error) throw error
    console.log(`App is available via http://localhost:${PORT}`)
})