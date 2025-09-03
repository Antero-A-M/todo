// server/index.js
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'      
import todoRouter from './routes/todoRouter.js'
import userRouter from './routes/userRouter.js' 

const app = express()
const port = process.env.PORT || 3001

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true, 
}))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.use('/', todoRouter)
app.use('/user', userRouter)

app.use((err, req, res, next) => {
  const status = err.status || 500
  res.status(status).json({ error: { message: err.message, status } })
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
