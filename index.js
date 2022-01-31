const express = require('express')
const authRoutes = require('./routes/auth.js')
const cors = require('cors');
require('dotenv').config()

const mongoose = require('mongoose')

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.1cxkz.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Conectado a la base de datos')
  })
  .catch((e) => {
    console.log('Database error', e)
  })

const app = express()

// Creamos la variable de configuración
let corsOptions = {
    origin: 'http://localhost:3000', // Aqui debemos reemplazar el * por el dominio de nuestro front
    optionsSuccessStatus: 200 // Es necesario para navegadores antiguos o algunos SmartTVs
}

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/user', authRoutes)

app.get('/', (req, res) => {
    res.json({ mensaje: 'My Auth Api Rest' })
})

const PORT = process.env.PORT || 8002
app.listen(PORT, () => {
    console.log(`Tu servidor está corriendo en el puerto: ${PORT}`)
})
