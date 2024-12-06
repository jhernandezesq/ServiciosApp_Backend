import type { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const handleInputErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Devolvemos los errores de validación como una respuesta con código 400 (Bad Request)
    res.status(400).json({ errors: errors.array() });
    return; // Terminamos el ciclo de la petición
  }

  next(); // Si no hay errores, pasamos al siguiente middleware o controlador
};


