// server/routes/todoRouter.js
import { Router } from 'express'
import { getTasks, postTask, removeTask } from '../controllers/TaskController.js'
import { auth } from '../helper/auth.js'

const router = Router()

router.get('/', getTasks)                
router.post('/create', auth, postTask)
router.delete('/delete/:id', auth, removeTask)

export default router
