import { Router } from 'express';
import { body } from 'express-validator';
import { handleInputErrors } from '../middleware/validation';
import { ProyectoController } from '../controllers/proyectoController';
import { GaleriaController } from '../controllers/galeriaController';
import multer from 'multer';  // Importamos multer

// Configuración de Multer para manejar la carga de archivos (en memoria)
const storage = multer.memoryStorage(); // Guardar en memoria
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limitar el tamaño de cada archivo a 10MB
}).array('imagenes', 10); // Esperamos que se envíen hasta 10 imágenes

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

router.get('/pagina',
  ProyectoController.obtenerProyectosPage
);



router.get('/:id', ProyectoController.obtenerProyecto); 

router.put('/:id', ProyectoController.editarProyecto); 

router.delete('/:id', ProyectoController.eliminarProyecto); 


/* RUTAS PARA LA GALERIA */

  router.post('/:proyectoId/galeria',
    
    GaleriaController.crearGaleria  
  );

router.get('/:proyectoId/galeria',
  GaleriaController.obtenerGaleria
)



router.get('/:proyectoId/galeria/:galeriaId',
  GaleriaController.obtenerGaleriaId
);

router.put('/:proyectoId/galeria/:galeriaId',
  GaleriaController.actualizarGaleria
);

router.delete('/:proyectoId/galeria/:galeriaId',
  GaleriaController.eliminarGaleria
);

router.delete('/:proyectoId/galeria/:galeriaId/imagen/:imagenId',
  GaleriaController.eliminarImagenIndividual
);


export default router;
