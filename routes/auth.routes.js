const router = require("express").Router();
const UserModel = require("../models/User.model.js")

const bcryptjs = require("bcryptjs")
const jwt = require("jsonwebtoken")
const isAuthenticated = require("../middlewares/isAuthenticated.js")

// ... nuestras 3 rutas de auth

// POST "/api/auth/signup" => registrar un usuario
router.post("/signup", async (req, res, next) => {

  const { email, password, username } = req.body

  // Validaciones de backend
  if (!email || !password || !username) {
    res.status(400).json({ errorMessage: "Los campos no estan completos" })
    return; // no continues con la funcion
  }

  // aqui podrian haber otras validaciones como complejidad de contraseña o formato de email.
  // no se les olvide implementar en sus proyectos ;)

  try {
    
    // podrian hacer esta funcionalidad más compleja, como tener dos checkeos separados por email o username
    const foundUser = await UserModel.findOne({ email })
    if (foundUser !== null) {
      res.status(400).json({ errorMessage: "Usuario ya registrado" });
      return;
    }

    const salt = await bcryptjs.genSalt(10)
    const hashPassword = await bcryptjs.hash(password, salt)

    await UserModel.create({
      username,
      email,
      password: hashPassword
    })

    res.json("todo bien, usuario creado")

  } catch (error) {
    next(error)
  }
})

// POST "/api/auth/login" => verificar las credenciales del usuario y abrirle "sesion"
router.post("/login", async (req, res, next) => {

  const { email, password } = req.body;

  // todas nuestras validaciones de backend. NO SE LES OLVIDEN!

  try {

    const foundUser = await UserModel.findOne({email})
    if (foundUser === null) {
      res.status(400).json({ errorMessage: "Usuario no registrado" })
      return;
    }

    // el usuario ha sido validado
    const passwordMatch = await bcryptjs.compare(password, foundUser.password)
    console.log(passwordMatch) // true o false

    if (passwordMatch === false) {
      res.status(401).json({ errorMessage: "La contraseña no es correcta" })
      return;
    }

    // el usuario es quien dice ser. Y tienes sus credenciales correctas.

    // aqui es donde creariamos una session
    // peeeeero... en vez de eso, aqui es donde empezamos a implementar el nuevo sistema de auth.

    const payload = {
      _id: foundUser._id,
      email: foundUser.email,
      username: foundUser.username
    } 
    // recomendacion es no guardar la contraseña
    // si hubiesen propiedades de isAdmin o isVip se recomienda agregarlas para navegacion de FE
    
    const authToken = jwt.sign(
      payload,
      process.env.TOKEN_SECRET,
      { algorithm: "HS256", expiresIn: "12h" } 
    )

    res.json({ authToken: authToken })

  } catch (error) {
    next(error)
  }


})

// GET "/api/auth/verify" => checkea que el token es valido, la ruta se usa para flujo de FE
router.get("/verify", isAuthenticated, (req, res, next) => {

  // checkear que el token es valido
  // enviar al frontend la info del usuario del token
  console.log(req.payload) // ! ESTO ES el req.session.user de M3
  console.log("Pasando por la ruta, todo bien con el middleware")
  res.json(req.payload)

})

module.exports = router;