import type { Request, Response } from "express";
import Usuario from "../models/Usuario";
import Token from "../models/Token";
import { checkPassword, hashPassword } from "../utils/auth";
import { generar6DigitToken } from "../utils/token";
import { transporter } from "../config/nodemailer";
import { AuthEmail } from "../emails/AuthEmail";
import { generarJWT } from "../utils/jwt";

export class AuthController {

  static crearCuenta = async (req: Request, res: Response) => {
    try {
      const { password, email } = req.body;

      //prevenir duplicados
      const usuarioExiste = await Usuario.findOne({email})
      if (usuarioExiste) {
        const error = new Error('El Usuario ya esta registrado')
        
        res.status(409).json({error: error.message})
         return
      }

      //crea un usuario
      const usuario = new Usuario(req.body);

      //has password
      usuario.password = await hashPassword(password);

      //generar el token
      const token = new Token()
      token.token = generar6DigitToken()
      token.usuario = usuario.id

      //enviar email
      AuthEmail.enviarConfirmacionEmail({
        email: usuario.email,
        nombre: usuario.nombre,
        token: token.token
      })

      await Promise.allSettled([usuario.save(), token.save()])

      res.send("cuenta creada, revisa tu email para confirmar");
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Error en crear cuenta",
        error: error.message || error,
      });
    }
  };

  static confirmarCuenta = async (req: Request, res: Response) => {
    try {
        const {token} = req.body
        const tokenExiste = await Token.findOne({token})
        
        if (!tokenExiste) {
            const error = new Error('Token No Valido')
            res.status(404).json({error: error.message})
            return
        }

        const usuario = await Usuario.findById(tokenExiste.usuario)
        usuario.confirmado = true

        await Promise.allSettled([ usuario.save(), tokenExiste.deleteOne()])
        res.send('Cuenta Confirmada Correctamente')
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
          message: "Error en confirmar cuenta",
          error: error.message || error,
        });
    }
  }


  static login = async (req: Request, res: Response) => {
    try {
       const {email, password} = req.body 
       const usuario = await Usuario.findOne({email})

       if (!usuario) {
        const error = new Error('Usuario no encontrado')
        res.status(404).json({error: error.message})
        return
       }

       if (!usuario.confirmado) {
        const token = new Token()
        token.usuario = usuario.id 
        token.token = generar6DigitToken()
        await token.save()

        //enviar email
      AuthEmail.enviarConfirmacionEmail({
        email: usuario.email,
        nombre: usuario.nombre,
        token: token.token
      })

        const error = new Error('La cuenta no ah sido confirmada, hemos enviado un email de confirmacion')
        res.status(401).json({error: error.message})
        return
       }

       //revisar password
       const isPasswordCorrect = await checkPassword(password, usuario.password)
       if (!isPasswordCorrect) {
        const error = new Error('Password Incorrecto')
        res.status(401).json({error: error.message})
        return
       }

       const token = generarJWT({id: usuario.id})

       res.send(token)
       

    } catch (error) {
        console.error(error);
        res.status(500).json({
        message: "Error en Login",
        error: error.message || error,
      });
    }
  }



  static requestConfirmacionCodigo = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      //usuario existe
      const usuario = await Usuario.findOne({email})
      if (!usuario) {
        const error = new Error('El Usuario no esta registrado')
        
        res.status(404).json({error: error.message})
         return
      }

      if (usuario.confirmado) {
        const error = new Error('El Usuario ya esta confirmado')
        
        res.status(403).json({error: error.message})
         return
      }



      //generar el token
      const token = new Token()
      token.token = generar6DigitToken()
      token.usuario = usuario.id

      //enviar email
      AuthEmail.enviarConfirmacionEmail({
        email: usuario.email,
        nombre: usuario.nombre,
        token: token.token
      })

      await Promise.allSettled([usuario.save(), token.save()])

      res.send("Se envio un nuevo token a tu email");
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Error en requestConfirmacionCodigo",
        error: error.message || error,
      });
    }
  };

  static olvidePassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      //usuario existe
      const usuario = await Usuario.findOne({email})
      if (!usuario) {
        const error = new Error('El Usuario no esta registrado')
        
        res.status(404).json({error: error.message})
         return
      }

      //generar el token
      const token = new Token()
      token.token = generar6DigitToken()
      token.usuario = usuario.id
      await token.save()

      //enviar email
      AuthEmail.enviarPasswordResetearToken({
        email: usuario.email,
        nombre: usuario.nombre,
        token: token.token
      })

     

      res.send("Revisa tu email para instrucciones");
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Error en olvidePassword",
        error: error.message || error,
      });
    }
  };



  static validarToken = async (req: Request, res: Response) => {
    try {
        const {token} = req.body
        const tokenExiste = await Token.findOne({token})
        
        if (!tokenExiste) {
            const error = new Error('Token No Valido')
            res.status(404).json({error: error.message})
            return
        }

        res.send('Token Valido, define tu nuevo password')
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
          message: "Error en validarToken",
          error: error.message || error,
        });
    }
  }



  static actualizarPasswordConToken = async (req: Request, res: Response) => {
    try {
        const {token} = req.params
        const {password} = req.body

        const tokenExiste = await Token.findOne({token})
        
        if (!tokenExiste) {
            const error = new Error('Token No Valido')
            res.status(404).json({error: error.message})
            return
        }

        const usuario = await Usuario.findById(tokenExiste.usuario)
        usuario.password = await hashPassword(password)

        await Promise.allSettled([usuario.save(), tokenExiste.deleteOne()])

        res.send('El password se modifico correctamente')
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
          message: "Error en validarToken",
          error: error.message || error,
        });
    }
  }

  static usuario = async (req: Request, res: Response) => {
     res.json(req.usuario)
     return
  }


}
