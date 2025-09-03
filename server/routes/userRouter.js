// server/routes/userRouter.js
import { Router } from 'express'
import { pool } from '../helper/db.js'
import { hash, compare } from 'bcrypt'
import jwt from 'jsonwebtoken'
const { sign } = jwt

const router = Router()

// POST /user/signup  — rekisteröinti
router.post('/signup', (req, res, next) => {
  const { user } = req.body
  if (!user || !user.email || !user.password) {
    const err = new Error('Email and password are required')
    err.status = 400
    return next(err)
  }
  hash(user.password, 10, (err, hashedPassword) => {
    if (err) return next(err)
    pool.query(
      'INSERT INTO account (email, password) VALUES ($1, $2) RETURNING *',
      [user.email, hashedPassword],
      (err, result) => {
        if (err) return next(err)
        return res.status(201).json({ id: result.rows[0].id, email: user.email })
      }
    )
  })
})

// POST /user/signin  — kirjautuminen, palauttaa tokenin
router.post('/signin', (req, res, next) => {
  const { user } = req.body
  if (!user || !user.email || !user.password) {
    const err = new Error('Email and password are required')
    err.status = 400
    return next(err)
  }
  pool.query('SELECT * FROM account WHERE email = $1', [user.email], (err, result) => {
    if (err) return next(err)
    if (result.rows.length === 0) {
      const e = new Error('User not found')
      e.status = 404
      return next(e)
    }
    const dbUser = result.rows[0]
    compare(user.password, dbUser.password, (err, ok) => {
      if (err) return next(err)
      if (!ok) {
        const e = new Error('Invalid password')
        e.status = 401
        return next(e)
      }
      const token = sign({ user: dbUser.email }, process.env.JWT_SECRET)
      return res.status(200).json({ id: dbUser.id, email: dbUser.email, token })
    })
  })
})

export default router
