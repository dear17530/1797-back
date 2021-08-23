import express from 'express'
import auth from '../middleware/auth.js'

import {
  getTargetSales,
  setTargetSales,
  getIndexProducts,
  getIndexPosts
} from '../controllers/admins.js'

const router = express.Router()

router.get('/', auth, getTargetSales)
router.get('/getIndexPosts', getIndexPosts)
router.get('/getIndexProducts', getIndexProducts)
router.patch('/', auth, setTargetSales)

export default router
