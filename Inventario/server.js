const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/productos', require('./routes/productos'));

app.listen(3000, () => {
    console.log('Servidor en http://localhost:3000');
});