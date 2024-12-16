import mongoose, {Schema, Document, Types} from "mongoose";


export interface IGaleriaType extends Document  {
  comentarios: string;
  imagenes: { _id: Types.ObjectId; url: string }[];  // Ahora cada imagen tiene un `_id` y un `url`
  fechaGaleria: Date;
  proyecto: Types.ObjectId;
};


const galeriaSchema : Schema = new mongoose.Schema({
    
  comentarios: {
      type: String,
      trim: true,
  },
  imagenes: [
      {
        url: { type: String},
      },
    ],
    fechaGaleria: {
      type: Date,
      default: Date.now(),
      required: true
    },
  proyecto: {
    type: Types.ObjectId,
    ref: 'Proyecto'
  }
  
},  {
  timestamps: true,
  }
);

const Galeria = mongoose.model<IGaleriaType>('Galeria', galeriaSchema );

export default Galeria;
