// server/controllers/TaskController.js
import { selectAllTasks, insertTask, deleteTaskById } from '../models/Task.js'
import { ApiError } from '../helper/ApiError.js'

export const getTasks = async (req, res, next) => {
  try {
    const result = await selectAllTasks()
    res.status(200).json(result.rows || [])
  } catch (err) {
    next(err)
  }
}

export const postTask = async (req, res, next) => {
  try {
    const { task } = req.body
    const desc = task?.description?.trim()
    if (!desc) throw new ApiError('Task description is required', 400)

    const result = await insertTask(desc)
    const row = result.rows[0]
    res.status(201).json({ id: row.id, description: row.description })
  } catch (err) {
    next(err)
  }
}

export const removeTask = async (req, res, next) => {
  try {
    const { id } = req.params
    const result = await deleteTaskById(id)
    if (result.rowCount === 0) throw new ApiError('Task not found', 404)
    res.status(200).json({ id })
  } catch (err) {
    next(err)
  }
}
