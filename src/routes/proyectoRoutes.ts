import { Router } from "express";
import { body } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { ProyectoController } from "../controllers/proyectoController";
import { GaleriaController } from "../controllers/galeriaController";
import multer from "multer"; // Importamos multer
import { autenticado } from "../middleware/auth";

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
}).array("imagenes", 10);

const router = Router();

router.use(autenticado);


router.post(
  "/",
  // Validaciones para campos obligatorios y fechas válidas
  body("orden").notEmpty().withMessage('El campo "orden" es obligatorio'),
  body("nombre").notEmpty().withMessage('El campo "nombre" es obligatorio'),
  
  // Validaciones para las fechas
  body("solicitud_fecha")
    .notEmpty().withMessage('El campo "solicitud_fecha" es obligatorio'),
  body("visita_fecha")
    .notEmpty().withMessage('El campo "visita_fecha" es obligatorio'),

  body("visita_fecha_servicios")
    .notEmpty().withMessage('El campo "visita_fecha_servicios" es obligatorio'),

  // Middleware para manejar errores de validación
  handleInputErrors,

  // Controlador que maneja la creación del proyecto
  ProyectoController.crearProyecto
);

router.get("/", ProyectoController.obtenerProyectos);

router.get("/pagina", ProyectoController.obtenerProyectosPage);

router.get("/:id", ProyectoController.obtenerProyecto);

router.put("/:id", ProyectoController.editarProyecto);

router.delete("/:id", ProyectoController.eliminarProyecto);


/* RUTAS PARA LA GALERIA */

router.post(
  "/:proyectoId/galeria",

  GaleriaController.crearGaleria
);

router.get("/:proyectoId/galeria", GaleriaController.obtenerGaleria);

router.get(
  "/:proyectoId/galeria/:galeriaId",
  GaleriaController.obtenerGaleriaId
);

router.put(
  "/:proyectoId/galeria/:galeriaId",
  GaleriaController.actualizarGaleria
);

router.delete(
  "/:proyectoId/galeria/:galeriaId",
  GaleriaController.eliminarGaleria
);

router.delete(
  "/:proyectoId/galeria/:galeriaId/imagen/:imagenId",
  GaleriaController.eliminarImagenIndividual
);



export default router;
