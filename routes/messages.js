import express from 'express'
import auth from '../middleware/auth.js'

import {
  sendMessage,
  getMessage,
  getProfile
} from '../controllers/messages.js'

const router = express.Router()

router.post('/', auth, sendMessage)
router.get('/profile/:id', auth, getProfile)
router.get('/:id', auth, getMessage)

export default router
