import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { autenticado } from "../middleware/auth";


const router = Router()

router.post('/crear-cuenta', 
    body('nombre')
        .notEmpty().withMessage('El Nombre no puede ir vacio'),
    body('password')
        .isLength({min: 6}).withMessage('La contrasena debe tener al menos 6 caracteres'),
    body('password_confirmacion').custom((value, {req}) => {
        
        if (value !== req.body.password) {
            throw new Error('Los Passwords no coinciden')    
        }

        return true
    }),
    body('email')
        .isEmail().withMessage('Correo no valido'),
    handleInputErrors,
    AuthController.crearCuenta
)

router.post('/confirmar-cuenta',
    body('token')
        .notEmpty().withMessage('El Token no puede ir vacio'),
    handleInputErrors,
    AuthController.confirmarCuenta
)

router.post('/login',
    body('email')
        .isEmail().withMessage('Correo no valido'),
    body('password')
        .notEmpty().withMessage('El password no puede ir vacio'),
    handleInputErrors,
    AuthController.login
)

router.post('/request-code',
    body('email')
        .isEmail().withMessage('Correo no valido'),
    handleInputErrors,
    AuthController.requestConfirmacionCodigo
)

router.post('/olvide-password',
    body('email')
        .isEmail().withMessage('Correo no valido'),
    handleInputErrors,
    AuthController.olvidePassword
)


router.post('/validar-token',
    body('token')
        .notEmpty().withMessage('El Token no puede ir vacio'),
    handleInputErrors,
    AuthController.validarToken
)



router.post('/actualizar-password/:token',
    param('token')
            .isNumeric().withMessage('Token No Valido'),
    body('password')
             .isLength({min: 6}).withMessage('La contrasena debe tener al menos 6 caracteres'),
    body('password_confirmacion').custom((value, {req}) => {
    
    if (value !== req.body.password) {
        throw new Error('Los Passwords no coinciden')    
    }

    return true
}),
    handleInputErrors,
    AuthController.actualizarPasswordConToken
)

router.get('/usuario',
    autenticado,
    AuthController.usuario
  )


export default router