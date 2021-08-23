import express from 'express'
import auth from '../middleware/auth.js'

import {
  checkout,
  getorders,
  editorder,
  getAllorders,
  getCategorySales,
  getOrdersQuantity,
  getProductSales
} from '../controllers/orders.js'

const router = express.Router()

router.post('/', auth, checkout)
router.get('/getorders', auth, getorders)
router.get('/getCategorySales', auth, getCategorySales)
router.get('/getAllorders', auth, getAllorders)
router.get('/getOrdersQuantity', auth, getOrdersQuantity)
router.get('/getProductSales', auth, getProductSales)
router.patch('/:id', auth, editorder)

export default router
