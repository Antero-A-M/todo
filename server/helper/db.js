import pkg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pkg
const environment = process.env.NODE_ENV || 'development'

const openDb = () => {
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: environment === 'development'
      ? process.env.DB_NAME
      : process.env.TEST_DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT)
  })
  return pool
}

const pool = openDb()
export { pool }
