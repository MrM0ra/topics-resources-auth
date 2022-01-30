const router = require('express').Router();
const User = require('../models/user')
// Traemos la dependencia que vamos a utilizar
const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// Creamos un esquema de registro usando las validaciones de Joi 
const schemaRegister = Joi.object({
	email: Joi.string().min(6).max(255).required().email(),
	password: Joi.string().min(6).max(1024).required()
})

//SIGN-IN
router.post('/register', async (req, res) => {
    // Dentro del método que invoca POST 
    // Usaremos la propiedad error del objeto que nos entrega schemaRegister.validate()
    const { error } = schemaRegister.validate(req.body)

    // Si este error existe, aqui se termina la ejecución devolviedonos el error
    if (error) {
        return res.status(400).json(
            { error: error.details[0].message }
        )
    }

    //Validación correo existente
    const isEmailExist = await User.findOne({ email: req.body.email });
	if (isEmailExist) {
		return res.status(400).json(
        	{error: 'Email ya registrado'}
		)
	}

    const salt = await bcrypt.genSalt(10)
    const password = await bcrypt.hash(req.body.password, salt)

    // Creamos el objeto usando el model que creaos anteriormente
    const user = new User({
        email: req.body.email,
        password: password
    });
    // Usamos .save() del model para almacenar los datos en Mongo
    try {
        const savedUser = await user.save()
        res.json({
            error: null,
            data: savedUser
        })
    } catch (error) {
        res.status(400).json({error})
    }
})

// Esquema del login
const schemaLogin = Joi.object({
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required()
})

// LOGIN
router.post('/login', async (req, res) => {
    // Validaciones de login
    const { error } = schemaLogin.validate(req.body)
    if(error) return res.status(400).json({error: error.details[0].message})
    
    // Validaciond e existencia
    const user = await User.findOne({email: req.body.email})
    if(!user) return res.status(400).json({error: 'Usuario no encontrado'})

    // Validacion de password en la base de datos
    const validPassword = await bcrypt.compare(req.body.password, user.password)
    if(!validPassword) return res.status(400).json({error: 'Constraseña invalida'})

    // Creando token
	const token = jwt.sign({
		name: user.name,
		id: user._id
	}, process.env.TOKEN_SECRET)

	// Colocando el token en el header y el cuerpo de la respuesta
	res.header('auth-token', token).json({
		error: null,
		data: { token },
		message: 'Bienvenido'
	})
})


module.exports = router