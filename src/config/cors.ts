import { CorsOptions, CorsRequest } from 'cors';

export const corsConfig: CorsOptions = {
    origin: 'https://grupopaxservice.netlify.app',  
    methods: ['GET', 'POST', 'PUT', 'DELETE'],     
    allowedHeaders: ['Content-Type', 'Authorization'], 
    credentials: true,  
};

/* export const corsConfig: CorsOptions = {
    origin: '*',  
    methods: ['GET', 'POST', 'PUT', 'DELETE'],     
    allowedHeaders: ['Content-Type', 'Authorization'], 
    credentials: true,  
}; */

