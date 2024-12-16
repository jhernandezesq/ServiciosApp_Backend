import { Request, Response } from "express";
import Proyecto from "../models/Proyecto";
import cloudinary from "../config/cloudinaryConfig";

export class ProyectoController {
  // Crear un nuevo proyecto
  static crearProyecto = async (req: Request, res: Response): Promise<void> => {
    try {
      const nuevoProyecto = new Proyecto(req.body); // Usar directamente req.body
      const proyectoGuardado = await nuevoProyecto.save();
      res.status(201).json({
        message: "Proyecto creado con éxito",
        proyecto: proyectoGuardado,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Error al crear el proyecto",
        error: error.message || error,
      });
    }
  };

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
        res.status(404).json({ message: "Proyecto No Encontrado" });
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
        res.status(404).json({ message: "Proyecto no encontrado" });
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

  // Eliminar un proyecto y su imagen asociada en Cloudinary
  static eliminarProyecto = async (
    req: Request<{ id: string }>,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const proyecto = await Proyecto.findById(id);

      if (!proyecto) {
        res.status(404).json({ message: "Proyecto No Encontrado" });
        return;
      }

      // Si el proyecto tiene una imagen, la eliminamos de Cloudinary
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

  static obtenerProyectosPaginados = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      // Parámetros de consulta (query parameters) con valores por defecto
      const limit = parseInt(req.query.limit as string) || 5; // Limitar a 5 registros por defecto
      const page = parseInt(req.query.page as string) || 1; // Página 1 por defecto

      // Calcular el "skip" (cuántos registros saltar) basado en la página
      const skip = (page - 1) * limit;

      // Obtener los proyectos con paginación
      const proyectos = await Proyecto.find({})
        .skip(skip) // Saltamos los primeros "skip" registros
        .limit(limit); // Limitar la cantidad de registros devueltos

      // Devolver los proyectos obtenidos
      res.status(200).json(proyectos);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Error al obtener los proyectos",
        error: error.message || error,
      });
    }
  };
}

// Función para extraer el public_id desde la URL de Cloudinary
const obtenerPublicIdDesdeUrl = (url: string): string => {
  const match = url.match(/\/upload\/[^/]+\/([^/]+)\.(jpg|jpeg|png|gif|webp)$/); // Ajuste para capturar la imagen y la extensión
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



