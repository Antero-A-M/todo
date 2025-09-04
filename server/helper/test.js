import fs from 'fs'
import path from 'path'
import { hash } from 'bcrypt'
import jwt from 'jsonwebtoken'
import { pool } from './db.js'

const __dirname = import.meta.dirname

export const initializeTestDb = () => {
  return new Promise((resolve, reject) => {
    try {
      const sql = fs.readFileSync(path.resolve(__dirname, '../db.sql'), 'utf8')
      pool.query(sql, (err) => (err ? reject(err) : resolve()))
    } catch (e) {
      reject(e)
    }
  })
}

export const insertTestUser = (user) => {
  return new Promise((resolve, reject) => {
    hash(user.password, 10, (err, hashed) => {
      if (err) return reject(err)
      pool.query(
        'INSERT INTO account (email, password) VALUES ($1, $2)',
        [user.email, hashed],
        (qErr) => (qErr ? reject(qErr) : resolve())
      )
    })
  })
}

export const getToken = (userOrEmail) => {
  const email = typeof userOrEmail === 'string' ? userOrEmail : userOrEmail?.email
  return jwt.sign({ email }, process.env.JWT_SECRET)
}
