import express from 'express'
import auth from '../middleware/auth.js'
import upload from '../middleware/upload.js'

import {
  postActive,
  getActive,
  getPost,
  editPost
} from '../controllers/posts.js'

const router = express.Router()

router.post('/', auth, upload, postActive)
router.get('/', getActive)
router.get('/:id', getPost)
router.patch('/:id', auth, upload, editPost)

export default router
