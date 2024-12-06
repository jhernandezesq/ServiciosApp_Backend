import { z } from "zod";

// Definición del esquema Zod para validar los campos de un proyecto
export const proyectoSchema = z.object({
  orden: z.string().min(1, "El campo 'orden' es obligatorio"),
  nombre: z.string().min(1, "El campo 'nombre' es obligatorio"),
  direccion: z.string().optional(),
  numero: z.string().optional(),
  interior: z.string().optional(),
  colonia: z.string().optional(),
  ciudad: z.string().optional(),
  tel: z.string().optional(),
  cp: z.string().optional(),
  estado: z.string().optional(),
  solicitud_fecha: z.date().optional(),  // Si no se pasa, se asigna la fecha por defecto en el backend
  hora: z.string().optional(),
  visita_fecha: z.date().optional(),
  visita_fecha_servicios: z.date().optional(),
  hora_entrada: z.string().optional(),
  hora_salida: z.string().optional(),
  reporte_cliente: z.string().optional(),
  acciones_realizadas: z.string().optional(),
  seguimiento: z.string().optional(),
  material_utilizado: z.string().optional(),
  comentarios_cliente: z.string().optional(),
  firma_pax: z.string().optional(),
  firma_cliente: z.string().optional(),
  hora_sr: z.string().optional(),
  reporto_sr: z.string().optional(),
  reportopax_sr: z.string().optional(),
  
  url: z.string().url().optional(),
  prioridad: z.enum(["En Proceso", "Completado", "Cancelado"], {
    errorMap: () => ({ message: "El campo 'prioridad' debe ser 'En Proceso', 'Completado' o 'Cancelado'" }),
  }),
});

// Inferir el tipo de datos del proyecto basado en el esquema Zod
export type ProyectoInput = z.infer<typeof proyectoSchema>;
