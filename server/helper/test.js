// server/helper/test.js
import fs from 'fs'
import path from 'path'
import { hash } from 'bcrypt'
import jwt from 'jsonwebtoken'
import { pool } from './db.js'

const __dirname = import.meta.dirname

export const initializeTestDb = () => {
  const sql = fs.readFileSync(path.resolve(__dirname, '../db.sql'), 'utf8')
  pool.query(sql, (err) => {
    if (err) console.error('Error initializing test database:', err)
  })
}

export const insertTestUser = (email, password) => {
  hash(password, 10, (err, hashed) => {
    if (err) return console.error('Error hashing password:', err)
    pool.query('INSERT INTO account (email, password) VALUES ($1, $2)',
      [email, hashed],
      (err) => { if (err) console.error('Error inserting test user:', err) }
    )
  })
}

export const getToken = (email) => {
  return jwt.sign({ email }, process.env.JWT_SECRET)
}
