import { Router } from 'express';
import { body } from 'express-validator';
import { handleInputErrors } from '../middleware/validation';
import { ProyectoController } from '../controllers/proyectoController';

const router = Router();


router.post('/',
    // Validaciones:
    body('orden').notEmpty().withMessage('El campo "orden" es obligatorio'),
    body('nombre').notEmpty().withMessage('El campo "nombre" es obligatorio'),
    
    // Middleware para manejar errores de validación
    handleInputErrors, 
  
    // Controlador que maneja la creación del proyecto
    ProyectoController.crearProyecto
  );

router.get('/',
    ProyectoController.obtenerProyectos
);

router.get('/:id', ProyectoController.obtenerProyecto); 

router.put('/:id', ProyectoController.editarProyecto); 

router.delete('/:id', ProyectoController.eliminarProyecto); 






export default router;
