import express from 'express'
import auth from '../middleware/auth.js'
import upload from '../middleware/upload.js'

import {
  register,
  login,
  getUser,
  logout,
  editUserData,
  addCart,
  getCart,
  editCart,
  editCoupon,
  getpost,
  getfollow,
  sendCoupon,
  addFriend,
  getFriend,
  extend,
  getuserinfo
} from '../controllers/users.js'

const router = express.Router()

router.post('/', register)
router.post('/login', login)
router.post('/cart', auth, addCart)
router.post('/extend', auth, extend)
router.post('/:id', auth, addFriend)
router.delete('/logout', auth, logout)
router.get('/', auth, getuserinfo)
router.get('/cart', auth, getCart)
router.get('/post', auth, getpost)
router.get('/follow', auth, getfollow)
router.get('/cart', auth, getCart)
router.get('/:id/friend', auth, getFriend)
router.get('/:id', auth, getUser)
router.patch('/sendCoupon', auth, sendCoupon)
router.patch('/', auth, editCoupon)
router.patch('/cart', auth, editCart)
router.patch('/:id', auth, upload, editUserData)

export default router
