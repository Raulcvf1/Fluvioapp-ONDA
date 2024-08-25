const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');

//importa o driver do mysql
const mysql = require('mysql');

const app = express();

//O express permite que sejam enviados arquivos. js para o front-end
app.use(express.static('js'));

//quando for enviado um texto json no corpo da requisição o expresse irá transformar isso em um objeto json
//em request.body, ou seja request.body é um objeto json contendo o texto json recebido no corpo da requisição.
app.use(express.json())

app.use(fileUpload());
app.use(express.static(path.join(__dirname, 'view')));

var banco = mysql.createPool({
    connectionLimit: 128,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'colegiosunivap'
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`http://localhost:${PORT}/`)
    console.log(`http://localhost:${PORT}/home.html`)
    console.log(`http://localhost:${PORT}/medidores.html`)
    console.log(`http://localhost:${PORT}/login.html`)
    console.log(`http://localhost:${PORT}/teste.html`)
});
