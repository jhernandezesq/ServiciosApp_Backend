import mongoose from "mongoose";
import { exit } from 'node:process';

export const conectarDB = async () => {
    try {
        const conexion = await mongoose.connect(process.env.BASE_URL)
        const url = `${conexion.connection.host}:${conexion.connection.port}`
        console.log(`Mongo conectado en ${url}`);
        
    } catch (error) {
        //console.log(error.message);
        console.log(('Error al conectar BD'));
        
        exit(1)
    }
}