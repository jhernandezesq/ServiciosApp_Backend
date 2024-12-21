import { CorsOptions, CorsRequest } from 'cors';

export const corsConfig: CorsOptions = {
    origin: 'https://grupopaxservice.netlify.app',  // Permite solo solicitudes desde el frontend de Netlify
    methods: ['GET', 'POST', 'PUT', 'DELETE'],     // Los métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos
    credentials: true,  // Permitir cookies si es necesario
};

