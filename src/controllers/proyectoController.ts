import { Request, Response } from "express";
import Proyecto from "../models/Proyecto";
import cloudinary from "../config/cloudinaryConfig";
import { IGaleriaType } from "../models/Galeria";
import { GaleriaController } from "./galeriaController";



export class ProyectoController {
  // Crear un nuevo proyecto
  static crearProyecto = async (req: Request, res: Response): Promise<void> => {
    try {
        // Crear la nueva instancia de Proyecto con los datos del body de la solicitud
        const nuevoProyecto = new Proyecto(req.body);

        // Asignar el ID del usuario que realiza la solicitud como el manager del proyecto
        nuevoProyecto.manager = req.usuario.id;

        // Guardar el proyecto en la base de datos
        const proyectoGuardado = await nuevoProyecto.save();

        // Enviar la respuesta exitosa
        res.status(201).json({
            message: "Proyecto creado con éxito",
            proyecto: proyectoGuardado,
        });
    } catch (error) {
        // Manejo de errores
        console.error(error);
        res.status(500).json({
            message: "Error al crear el proyecto",
            error: error.message || error,
        });
    }
};


static obtenerProyectosPage = async (req: Request, res: Response): Promise<void> => {
  try {
    // Obtener los parámetros 'page' y 'limit' desde la query string
    const page = parseInt(req.query.page as string) || 1;  // Si no se pasa 'page', se usa 1 por defecto
    const limit = parseInt(req.query.limit as string) || 10;  // Si no se pasa 'limit', se usa 10 por defecto

    // Calcular el número de registros a saltar (skip) para la paginación
    const skip = (page - 1) * limit;

    // Obtener los proyectos de la base de datos con paginación y ordenación descendente
    const proyectos = await Proyecto.find({
      $or: [
        {manager: {$in: req.usuario.id}} // Filtrar por proyectos asociados al usuario
      ]
    })
      .skip(skip)
      .limit(limit)
      .sort({ orden: -1 }) // Ordenar por 'orden' de manera descendente (más reciente primero)
      .populate({
        path: "galerias",
        select: "-createdAt -updatedAt -__v",  // Excluir estos campos de 'galerias'
      });

    // Contar el total de proyectos en la base de datos
    const totalProyectos = await Proyecto.countDocuments({
      manager: { $in: req.usuario.id } // Contar solo los proyectos del usuario
    });

    // Calcular el total de páginas disponibles (asegurarse de que no sea 0)
    const totalPages = Math.max(1, Math.ceil(totalProyectos / limit));

    res.status(200).json({
      proyectos,        // Los proyectos obtenidos para la página solicitada
      currentPage: page,  // Página actual
      totalPages,         // Total de páginas (asegurado mínimo de 1)
      totalProyectos,     // Total de proyectos disponibles
    });
  } catch (error) {
    console.error("Error al obtener los proyectos paginados:", error);
    res.status(500).json({
      message: "Error al obtener los proyectos",
      error: error.message || error,
    });
  }
}

  

  // Obtener todos los proyectos
  static obtenerProyectos = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const proyectos = await Proyecto.find({}).populate({
        path: "galerias",
        select: "-createdAt -updatedAt -__v", // Excluir estos campos de 'galerias'
      })
      res.status(200).json(proyectos); // Respondemos con los datos y status 200
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Error al obtener los proyectos",
        error: error.message || error,
      });
    }
  };

  // Obtener un proyecto por su ID
  static obtenerProyecto = async (
    req: Request<{ id: string }>,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const proyecto = await Proyecto.findById(id)
        .populate({
          path: "galerias",
          select: "-createdAt -updatedAt -__v", // Excluir estos campos de 'galerias'
        })
        

      if (!proyecto) {
        const error = new Error('Proyecto No encontrado')
        res.status(404).json({ error: error.message });
        return;
      }

      if (proyecto.manager.toString() !== req.usuario.id.toString()) {
        const error = new Error('Accion no valida')
        res.status(404).json({ error: error.message });
        return;
      }

      res.status(200).json(proyecto);
    } catch (error) {
      console.error("Error al obtener el proyecto: ", error);
      res.status(500).json({
        message: "Error al obtener el proyecto",
        error: error.message || error,
      });
    }
  };

  // Editar un proyecto por su ID
  static editarProyecto = async (
    req: Request<{ id: string }>,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const proyecto = await Proyecto.findById(id);
      
      if (!proyecto) {
        const error = new Error('Proyecto No encontrado')
        res.status(404).json({ error: error.message });
        return;
      }

      if (proyecto.manager.toString() !== req.usuario.id.toString()) {
        const error = new Error('Solo la cuenta que creeo el proyecto puede editarla')
        res.status(404).json({ error: error.message });
        return;
      }

      // Actualizamos el proyecto con los datos del cuerpo de la solicitud
      Object.assign(proyecto, req.body);

      // Guardar el proyecto actualizado
      await proyecto.save();

      res.status(200).json({
        message: "Proyecto Actualizado Correctamente",
        proyecto: proyecto, // También puedes devolver el proyecto actualizado si lo deseas
      });
    } catch (error) {
      console.error("Error al editar el proyecto: ", error);
      res.status(500).json({
        message: "Error al editar el proyecto",
        error: error.message || error,
      });
    }
  };

  

  static eliminarProyecto = async (
    req: Request<{ id: string }>,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
  
      // Poblamos las galerías y especificamos el tipo de cada galería
      const proyecto = await Proyecto.findById(id)
        .populate<{ galerias: IGaleriaType[] }>('galerias');  // Aquí indicamos explícitamente que galerias es un array de IGaleriaType
  
      if (!proyecto) {
        const error = new Error('Proyecto No encontrado')
        res.status(404).json({ error: error.message });
        return;
      }

      if (proyecto.manager.toString() !== req.usuario.id.toString()) {
        const error = new Error('solo el que creeo el proyecto puede eliminarlo')
        res.status(404).json({ error: error.message });
        return;
      }
  
      // Ahora TypeScript sabe que `galerias` tiene un campo `imagenes`
      if (proyecto.galerias && proyecto.galerias.length > 0) {
        const eliminarGaleriasPromises = proyecto.galerias.map(async (galeria) => {
          if (galeria.imagenes && galeria.imagenes.length > 0) {
            const eliminarImagenesPromises = galeria.imagenes.map(async (imagen) => {
              const publicId = GaleriaController.obtenerPublicIdDesdeUrl(imagen.url);
              if (publicId) {
                try {
                  await GaleriaController.eliminarImagenDeCloudinary(publicId); // Elimina la imagen de Cloudinary
                } catch (error) {
                  console.error(`Error al eliminar la imagen con publicId ${publicId}:`, error);
                }
              }
            });
  
            // Esperar que todas las imágenes sean eliminadas antes de continuar
            await Promise.allSettled(eliminarImagenesPromises);
          }
  
          // Eliminar la galería de la base de datos
          await galeria.deleteOne();
        });
  
        // Esperar a que todas las galerías sean eliminadas
        await Promise.allSettled(eliminarGaleriasPromises);
      }
  
      // Eliminar la imagen del proyecto (si tiene alguna) de Cloudinary
      if (proyecto.url) {
        const publicId = obtenerPublicIdDesdeUrl(proyecto.url); // Extraemos el public_id de la URL
        await eliminarImagenDeCloudinary(publicId); // Eliminamos la imagen de Cloudinary
      }
  
      // Ahora eliminamos el proyecto de la base de datos
      await proyecto.deleteOne();
  
      res.json({ message: "Proyecto Eliminado Correctamente" });
    } catch (error) {
      console.error("Error al eliminar el proyecto: ", error);
      res.status(500).json({
        message: "Error al eliminar el proyecto",
        error: error.message || error,
      });
    }
  };

  



}

// Función para extraer el public_id desde la URL de Cloudinary
const obtenerPublicIdDesdeUrl = (url: string): string => {
  const match = url.match(/\/upload\/[^/]+\/([^/]+\/[^/]+)\.(jpg|jpeg|png|gif|webp)$/);
  const publicId = match ? match[1] : '';
  return publicId;  // Devuelve el public_id extraído de la URL
};

// Función para eliminar la imagen de Cloudinary usando el SDK
const eliminarImagenDeCloudinary = async (publicId: string): Promise<void> => {
  try {
    const result = await cloudinary.v2.uploader.destroy(publicId);  // Usamos el SDK para eliminar la imagen
    console.log('Imagen eliminada de Cloudinary:', result);
  } catch (error) {
    console.error('Error al eliminar imagen de Cloudinary:', error);
    throw new Error('No se pudo eliminar la imagen de Cloudinary');
  }
};



