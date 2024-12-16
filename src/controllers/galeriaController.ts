import { Request, Response } from "express";
import Proyecto from "../models/Proyecto";
import Galeria from "../models/Galeria";
import cloudinary from '../config/cloudinaryConfig'; // Importar la configuración de Cloudinary

export class GaleriaController {

  
  // Función para extraer el public_id desde la URL de Cloudinary
// Función para extraer el public_id desde la URL de Cloudinary
static obtenerPublicIdDesdeUrl = (url: string): string => {
  // Ajustamos la expresión regular para extraer correctamente el public_id, incluyendo la carpeta "galeria"
  const match = url.match(/\/upload\/[^/]+\/([^/]+\/[^/]+)\.(jpg|jpeg|png|gif|webp)$/);
  const publicId = match ? match[1] : '';
  return publicId;  // Devuelve el public_id extraído de la URL
};



  // Función para eliminar la imagen de Cloudinary usando el SDK
  static eliminarImagenDeCloudinary = async (publicId: string): Promise<void> => {
    try {
      const result = await cloudinary.v2.uploader.destroy(publicId);  // Usamos el SDK para eliminar la imagen
      console.log('Imagen eliminada de Cloudinary:', result);
    } catch (error) {
      console.error('Error al eliminar imagen de Cloudinary:', error);
      throw new Error('No se pudo eliminar la imagen de Cloudinary');
    }
  };

  static eliminarImagenIndividual = async (req: Request, res: Response): Promise<void> => {
    const { proyectoId, galeriaId, imagenId } = req.params;

    const proyecto = await Proyecto.findById(proyectoId);
    if (!proyecto) {
      res.status(404).json({ message: "Proyecto No Encontrado" });
      return;
    }

    try {
      const galeria = await Galeria.findById(galeriaId);
      if (!galeria) {
        res.status(404).json({ message: "Galería No Encontrada" });
        return;
      }

      if (galeria.proyecto.toString() !== proyecto.id) {
        res.status(400).json({ message: "Acción No Válida" });
        return;
      }

      // Buscar la imagen que queremos eliminar dentro de la galería
      const imagen = galeria.imagenes.find((img) => img._id.toString() === imagenId);
      if (!imagen) {
        res.status(404).json({ message: "Imagen No Encontrada" });
        return;
      }

      // Extraer el publicId de la URL de la imagen
      const publicId = GaleriaController.obtenerPublicIdDesdeUrl(imagen.url);
      if (!publicId) {
        res.status(400).json({ message: "No se pudo obtener el public_id de la imagen" });
        return;
      }

      // Eliminar la imagen de Cloudinary
      await GaleriaController.eliminarImagenDeCloudinary(publicId);

      // Eliminar la referencia de la imagen en la galería
      galeria.imagenes = galeria.imagenes.filter((img) => img._id.toString() !== imagenId);

      // Guardar los cambios en la base de datos
      await galeria.save();

      res.json({ message: "Imagen eliminada correctamente de la galería", galeria });
    } catch (error) {
      console.error("Error al eliminar imagen individual:", error);
      res.status(500).json({
        message: "Error al eliminar la imagen de la galería",
        error: error.message || error,
      });
    }
  };

  // Crear Galería
  static crearGaleria = async (req: Request, res: Response): Promise<void> => {
    const { proyectoId } = req.params;
    console.log("ID del proyecto recibido:", proyectoId);  // Log para verificar el ID del proyecto
  
    const proyecto = await Proyecto.findById(proyectoId);
  
    if (!proyecto) {
      res.status(404).json({ message: 'Proyecto No Encontrado' });
      return;
    }
  
    try {
      console.log("Datos recibidos en el body:", req.body);
  
      const imagenes = req.body.imagenes;
      if (!imagenes || imagenes.length === 0) {
        res.status(400).json({ message: "No se han enviado imágenes" });
        return;
      }
  
      const galeria = new Galeria({
        comentarios: req.body.comentarios,
        imagenes: imagenes,  
        fechaGaleria: req.body.fechaGaleria,
        proyecto: proyecto.id,
      });
  
      console.log("Datos de la galería a guardar:", galeria);
  
      proyecto.galerias.push(galeria.id);
  
      await Promise.allSettled([galeria.save(), proyecto.save()]);
  
      console.log("Galería guardada con éxito:", galeria);
      res.json({ message: 'Galería guardada correctamente', data: galeria });
  
    } catch (error) {
      console.error("Error al crear la galería:", error);
      res.status(500).json({
        message: 'Error al crear la galeria',
        error: error.message || error,
      });
    }
  };

  // Obtener Galería por proyecto
  static obtenerGaleria = async (req: Request, res: Response) => {
    const { proyectoId } = req.params;
    const proyecto = await Proyecto.findById(proyectoId);

    if (!proyecto) {
      res.status(404).json({ message: "Proyecto No Encontrado" });
      return;
    }

    try {
      const galeria = await Galeria.find({proyecto: proyecto.id});
      res.json(galeria);

    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Error al obtener la galeria",
        error: error.message || error,
      });
    }
  };

  // Obtener una galería por su ID
  static obtenerGaleriaId = async (req: Request, res: Response) => {
    const { proyectoId, galeriaId } = req.params;
    const proyecto = await Proyecto.findById(proyectoId);

    if (!proyecto) {
      res.status(404).json({ message: "Proyecto No Encontrado" });
      return;
    }

    try {
      const galeria = await Galeria.findById(galeriaId);

      if (!galeria) {
        res.status(404).json({ error: 'Galeria No Encontrada' });
        return;
      }

      if (galeria.proyecto.toString() !== proyecto.id) {
        res.status(400).json({ error: 'Acción No Válida' });
        return;
      }

      res.json(galeria);

    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Error al obtener la galeria",
        error: error.message || error,
      });
    }
  };

  // Actualizar Galería
  static actualizarGaleria = async (req: Request, res: Response) => {
    const { proyectoId, galeriaId } = req.params;
    const proyecto = await Proyecto.findById(proyectoId);

    if (!proyecto) {
      res.status(404).json({ message: "Proyecto No Encontrado" });
      return;
    }

    try {
      const galeria = await Galeria.findById(galeriaId);

      if (!galeria) {
        res.status(404).json({ error: 'Galeria No Encontrada' });
        return;
      }

      if (galeria.proyecto.toString() !== proyecto.id) {
        res.status(400).json({ error: 'Acción No Válida' });
        return;
      }

      galeria.comentarios = req.body.comentarios;
      galeria.imagenes = req.body.imagenes;
      galeria.fechaGaleria = req.body.fechaGaleria;

      await galeria.save();

      res.json({ message: 'Galería actualizada correctamente' });

    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Error al actualizar la galeria",
        error: error.message || error,
      });
    }
  };

  // Eliminar Galería
static eliminarGaleria = async (req: Request, res: Response) => {
  const { proyectoId, galeriaId } = req.params;
  const proyecto = await Proyecto.findById(proyectoId);

  if (!proyecto) {
    res.status(404).json({ message: "Proyecto No Encontrado" });
    return;
  }

  try {
    const galeria = await Galeria.findById(galeriaId);

    if (!galeria) {
      res.status(404).json({ message: "Galería No Encontrada" });
      return;
    }

    // Comparar correctamente ObjectId (usando toString() para ambos)
    if (galeria.proyecto.toString() !== proyecto._id.toString()) {
      res.status(400).json({ message: "Acción No Válida" });
      return;
    }

    // Eliminar imágenes de Cloudinary
    if (galeria.imagenes && galeria.imagenes.length > 0) {
      const eliminarImagenesPromises = galeria.imagenes.map(async (imagen) => {
        const publicId = GaleriaController.obtenerPublicIdDesdeUrl(imagen.url);
        if (publicId) {
          try {
            await GaleriaController.eliminarImagenDeCloudinary(publicId); // Elimina la imagen si se obtuvo un public_id válido
          } catch (error) {
            console.error(`Error al eliminar la imagen con publicId ${publicId}:`, error);
            // Aquí puedes continuar con la eliminación de las demás imágenes, si es necesario.
          }
        } else {
          console.error("No se pudo extraer el public_id de la URL:", imagen.url);
        }
      });

      // Esperar que todas las imágenes sean eliminadas antes de continuar
      await Promise.allSettled(eliminarImagenesPromises);
    }

    // Eliminar la galería de la base de datos
    await galeria.deleteOne();

    // Eliminar la galería de la lista de galerías del proyecto
    proyecto.galerias = proyecto.galerias.filter(
      (galeriaIdDB) => galeriaIdDB.toString() !== galeriaId.toString() // Comparar correctamente
    );
    await proyecto.save();

    res.json({ message: "Galería eliminada correctamente" });

  } catch (error) {
    console.error("Error al eliminar la galería:", error);
    res.status(500).json({
      message: "Error al eliminar la galería",
      error: error.message || error,
    });
  }
};


}


