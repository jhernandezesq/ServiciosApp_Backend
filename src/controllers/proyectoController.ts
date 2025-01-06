import { Request, Response } from "express";
import Proyecto from "../models/Proyecto";
import cloudinary from "../config/cloudinaryConfig";
import { IGaleriaType } from "../models/Galeria";
import { GaleriaController } from "./galeriaController";

export class ProyectoController {
  static crearProyecto = async (req: Request, res: Response): Promise<void> => {
    try {
      const nuevoProyecto = new Proyecto(req.body);

      nuevoProyecto.manager = req.usuario.id;

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

  /* static obtenerProyectosPage = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const skip = (page - 1) * limit;

      const proyectos = await Proyecto.find({
        $or: [{ manager: { $in: req.usuario.id } }],
      })
        .skip(skip)
        .limit(limit)
        .sort({ orden: -1 })
        .populate({
          path: "galerias",
          select: "-createdAt -updatedAt -__v",
        });

      const totalProyectos = await Proyecto.countDocuments({
        manager: { $in: req.usuario.id },
      });

      const totalPages = Math.max(1, Math.ceil(totalProyectos / limit));

      res.status(200).json({
        proyectos,
        currentPage: page,
        totalPages,
        totalProyectos,
      });
    } catch (error) {
      console.error("Error al obtener los proyectos paginados:", error);
      res.status(500).json({
        message: "Error al obtener los proyectos",
        error: error.message || error,
      });
    }
  }; */

  static obtenerProyectosPage = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const searchQuery = req.query.search as string || "";  // Término de búsqueda
  
      const skip = (page - 1) * limit;
  
      // Función para quitar acentos
      function quitarAcentos(str: string): string {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      }
  
      // Filtrar solo si hay un término de búsqueda
      const filter: any = {};
      if (searchQuery) {
        const searchNormalized = quitarAcentos(searchQuery); // Normalizamos el término de búsqueda
        filter.nombre = {
          $regex: quitarAcentos(searchNormalized), // Normalizamos también el término a comparar
          $options: "i",  // Insensible a mayúsculas/minúsculas
        };
      }
  
      // Obtener solo los proyectos de la página actual (con paginación)
      const proyectos = await Proyecto.find({
        $or: [{ manager: { $in: req.usuario.id } }],
        ...filter,  // Aplicar el filtro solo aquí
      })
        .skip(skip)
        .limit(limit)
        .sort({ orden: -1 })
        .populate({
          path: "galerias",
          select: "-createdAt -updatedAt -__v",
        });
  
      // Obtener el número total de proyectos que coinciden con el filtro de búsqueda
      const totalProyectos = await Proyecto.countDocuments({
        manager: { $in: req.usuario.id },
        ...filter,  // Incluir filtro para el conteo
      });
  
      // Calcular el número total de páginas
      const totalPages = Math.max(1, Math.ceil(totalProyectos / limit));
  
      res.status(200).json({
        proyectos,
        currentPage: page,
        totalPages,
        totalProyectos,
      });
    } catch (error) {
      console.error("Error al obtener los proyectos paginados:", error);
      res.status(500).json({
        message: "Error al obtener los proyectos",
        error: error.message || error,
      });
    }
  };
  
  

  static obtenerProyectos = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const proyectos = await Proyecto.find({}).populate({
        path: "galerias",
        select: "-createdAt -updatedAt -__v",
      });
      res.status(200).json(proyectos);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Error al obtener los proyectos",
        error: error.message || error,
      });
    }
  };

  static obtenerProyecto = async (
    req: Request<{ id: string }>,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const proyecto = await Proyecto.findById(id).populate({
        path: "galerias",
        select: "-createdAt -updatedAt -__v",
      });

      if (!proyecto) {
        const error = new Error("Proyecto No encontrado");
        res.status(404).json({ error: error.message });
        return;
      }

      if (proyecto.manager.toString() !== req.usuario.id.toString()) {
        const error = new Error("Accion no valida");
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

  static editarProyecto = async (
    req: Request<{ id: string }>,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const proyecto = await Proyecto.findById(id);

      if (!proyecto) {
        const error = new Error("Proyecto No encontrado");
        res.status(404).json({ error: error.message });
        return;
      }

      if (proyecto.manager.toString() !== req.usuario.id.toString()) {
        const error = new Error(
          "Solo la cuenta que creeo el proyecto puede editarla"
        );
        res.status(404).json({ error: error.message });
        return;
      }

      Object.assign(proyecto, req.body);

      await proyecto.save();

      res.status(200).json({
        message: "Proyecto Actualizado Correctamente",
        proyecto: proyecto,
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

      const proyecto = await Proyecto.findById(id).populate<{
        galerias: IGaleriaType[];
      }>("galerias");

      if (!proyecto) {
        const error = new Error("Proyecto No encontrado");
        res.status(404).json({ error: error.message });
        return;
      }

      if (proyecto.manager.toString() !== req.usuario.id.toString()) {
        const error = new Error(
          "solo el que creeo el proyecto puede eliminarlo"
        );
        res.status(404).json({ error: error.message });
        return;
      }

      if (proyecto.galerias && proyecto.galerias.length > 0) {
        const eliminarGaleriasPromises = proyecto.galerias.map(
          async (galeria) => {
            if (galeria.imagenes && galeria.imagenes.length > 0) {
              const eliminarImagenesPromises = galeria.imagenes.map(
                async (imagen) => {
                  const publicId = GaleriaController.obtenerPublicIdDesdeUrl(
                    imagen.url
                  );
                  if (publicId) {
                    try {
                      await GaleriaController.eliminarImagenDeCloudinary(
                        publicId
                      );
                    } catch (error) {
                      console.error(
                        `Error al eliminar la imagen con publicId ${publicId}:`,
                        error
                      );
                    }
                  }
                }
              );

              await Promise.allSettled(eliminarImagenesPromises);
            }

            await galeria.deleteOne();
          }
        );

        await Promise.allSettled(eliminarGaleriasPromises);
      }

      if (proyecto.url) {
        const publicId = obtenerPublicIdDesdeUrl(proyecto.url);
        await eliminarImagenDeCloudinary(publicId);
      }

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

const obtenerPublicIdDesdeUrl = (url: string): string => {
  const match = url.match(
    /\/upload\/[^/]+\/([^/]+\/[^/]+)\.(jpg|jpeg|png|gif|webp)$/
  );
  const publicId = match ? match[1] : "";
  return publicId;
};

const eliminarImagenDeCloudinary = async (publicId: string): Promise<void> => {
  try {
    const result = await cloudinary.v2.uploader.destroy(publicId);
    console.log("Imagen eliminada de Cloudinary:", result);
  } catch (error) {
    console.error("Error al eliminar imagen de Cloudinary:", error);
    throw new Error("No se pudo eliminar la imagen de Cloudinary");
  }
};
