import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { conectarDB } from './config/db'

import authRoute from './routes/authRoutes'
import proyectoRoute from './routes/proyectoRoutes'


import { corsConfig } from './config/cors'


dotenv.config()
conectarDB()
const app = express()
app.use(cors(corsConfig))
app.use(express.json())

//ROUTES

app.use('/api/auth', authRoute)
app.use('/api/proyectos', proyectoRoute)

//console.log('Cloudinary Config Loaded:', process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_API_SECRET);


export default app