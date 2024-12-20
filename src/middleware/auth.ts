import {Request, Response, NextFunction } from 'express'
import jwt from "jsonwebtoken"
import Usuario, { IUsuario } from '../models/Usuario'

declare global {
    namespace Express {
        interface Request {
            usuario?: IUsuario
        }
    }
}


export const autenticado = async (req: Request, res: Response, next: NextFunction ) => {
    const bearer = req.headers.authorization
    if (!bearer) {
        const error = new Error('No Autorizado')
        res.status(401).json({error: error.message})
        return
    }

    const token = bearer.split(' ')[1]
    /* console.log(token); */

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
       
        if (typeof decoded === 'object' && decoded.id) {
            const usuario = await Usuario.findById(decoded.id).select('_id nombre email')
            
            if (usuario) {
                req.usuario = usuario
                next()
            } else {
                res.status(500).json({error: 'Token No Valido'});
            }
        }
        
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
          message: "Token No Valido",
          error: error.message || error,
        });
    }
    
    
}