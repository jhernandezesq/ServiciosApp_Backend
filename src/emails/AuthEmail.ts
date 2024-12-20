import { transporter } from "../config/nodemailer"

interface IEmail {
    email: string
    nombre: string
    token: string
}

export class AuthEmail {
    static enviarConfirmacionEmail = async (usuario : IEmail) => {
       const info = await transporter.sendMail({
            from: 'ServiciosApp <admin@admin.com>',
            to: usuario.email,
            subject: 'ServiciosApp - Confirma tu cuenta',
            text: 'ServiciosApp - Confirma tu cuenta',
            html: `<p>Hola: ${usuario.nombre}, has creado tu cuenta de ServiciosAPP, ya casi esta todo listo, solo debes confirmar tu cuenta</p>
                    <p>Visita el siguiente enlace</p>
                    <a href="${process.env.FRONTEND_URL}auth/confirmar-cuenta">Confirma cuenta</a>
                    <p>E ingresa el codigo: <b>${usuario.token}</b></p>
                    <p>Este token expira en 10 min</p>
                    `
          })

          console.log('Mensaje Enviado', info.messageId);
          
    }


    static enviarPasswordResetearToken = async (usuario : IEmail) => {
        const info = await transporter.sendMail({
             from: 'ServiciosApp <admin@admin.com>',
             to: usuario.email,
             subject: 'ServiciosApp - Restablece tu password',
             text: 'ServiciosApp - Restablece tu password',
             html: `<p>Hola: ${usuario.nombre}, has solicitado restablecer tu password.</p>
                     <p>Visita el siguiente enlace</p>
                     <a href="${process.env.FRONTEND_URL}auth/nuevo-password">Restablecer Password</a>
                     <p>E ingresa el codigo: <b>${usuario.token}</b></p>
                     <p>Este token expira en 10 min</p>
                     `
           })
 
           console.log('Mensaje Enviado', info.messageId);
           
     }
}