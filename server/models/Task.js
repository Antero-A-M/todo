// server/models/Task.js
import { pool } from '../helper/db.js'

export const selectAllTasks = async () => {
  return await pool.query('SELECT * FROM task')
}

export const insertTask = async (description) => {
  return await pool.query(
    'INSERT INTO task (description) VALUES ($1) RETURNING *',
    [description]
  )
}

export const deleteTaskById = async (id) => {
  return await pool.query('DELETE FROM task WHERE id = $1 RETURNING *', [id])
}
