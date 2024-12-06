import mongoose, {Schema, Document, ObjectId} from "mongoose";
import { object } from "zod";

const estatusSchema = {
    ENPROCESO: 'EN_PROCESO',
    COMPLETADO: 'COMPLETADO',
    CANCELADO: 'CANCELADO'
}

export type ProyectoType = Document & {
  orden: string;
  nombre: string;
  direccion: string;
  numero: string;
  interior: string;
  colonia: string;
  ciudad: string;
  tel: string;
  cp: string;
  estado: string;
  solicitud_fecha: Date;  // Usar Date para las fechas
  hora: string;
  visita_fecha: Date;  // Usar Date para las fechas
  visita_fecha_servicios: Date;  // Usar Date para las fechas
  hora_entrada: string;
  hora_salida: string;
  reporte_cliente: string;
  acciones_realizadas: string;
  seguimiento: string;
  material_utilizado: string;
  comentarios_cliente: string;
  firma_pax: string;
  firma_cliente: string;
  hora_sr: string;
  reporto_sr: string;
  reportopax_sr: string;
  
  url: string;
  prioridad: string;
};


const proyectoSchema : Schema = new mongoose.Schema({
  orden: {
      type: String,
      trim: true,
      required: true
  },
  nombre: {
      type: String,
      trim: true,
      required: true,
  },
  direccion: {
      type: String,
      trim: true,
  },
  numero: {
      type: String,
      trim: true,
  },
  interior: {
      type: String,
      trim: true,
  },
  colonia: {
      type: String,
      trim: true,
  },
  ciudad: {
      type: String,
      trim: true,
  },
  tel: {
      type: String,
      trim: true,
  },
  cp: {
      type: String,
      trim: true,
  },
  estado: {
      type: String,
      trim: true,
  },
  solicitud_fecha: {
      type: Date,
      default: Date.now(),
  },
  hora: {
      type: String,
      trim: true,
      
  },
  visita_fecha: {
      type: Date,
      default: Date.now(),
  },
  visita_fecha_servicios: {
      type: Date,
      default: Date.now(),
  },
  hora_entrada: {
      type: String,
      trim: true,
  },
  hora_salida: {
      type: String,
      trim: true,
  },
  reporte_cliente: {
      type: String,
      trim: true,
  },
  acciones_realizadas: {
      type: String,
      trim: true,
  },
  seguimiento: {
      type: String,
      trim: true,
  },
  material_utilizado: {
      type: String,
      trim: true,
  },
  comentarios_cliente: {
      type: String,
      trim: true,
  },
  firma_pax: {
      type: String,
      trim: true,
  },
  firma_cliente: {
      type: String,
      trim: true,
  },
  hora_sr: {
      type: String,
      trim: true,
  },
  reporto_sr: {
      type: String,
      trim: true,
  },
  reportopax_sr: {
      type: String,
      trim: true,
  },
  
  url: {
      type: String,
      trim: true,
  },
  prioridad: {
      type: String,
      required: true,
      enum: Object.values(estatusSchema),
      default: estatusSchema.ENPROCESO
  }
},  {
  timestamps: true,
  }
);

const Proyecto = mongoose.model<ProyectoType>('Proyecto', proyectoSchema );

export default Proyecto;
