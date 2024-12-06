import { CorsOptions, CorsRequest } from 'cors';

export const corsConfig: CorsOptions = {
    origin: '*',  // Esto permite todos los orígenes
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Asegúrate de permitir los métodos que necesites
    allowedHeaders: ['Content-Type', 'Authorization'],  // Agrega los encabezados necesarios
    credentials: true,  // Si estás trabajando con cookies o autenticación, deberías ajustar esto
};

