import mongoose, {Schema, Document, Types} from "mongoose";


export interface IUsuario extends Document  {
  _id: Types.ObjectId
  email: string;
  password: string
  nombre: string
  confirmado: boolean
};


const usuarioSchema : Schema = new mongoose.Schema({
    
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  nombre: {
    type: String,
    required: true,
  },
  confirmado: {
    type: Boolean,
    default: false,
  },
},  {
  timestamps: true,
  }
);

const Usuario = mongoose.model<IUsuario>('Usuario', usuarioSchema );

export default Usuario;
