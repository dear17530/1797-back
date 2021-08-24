import users from '../models/users.js'
import posts from '../models/posts.js'
import products from '../models/products.js'
import jwt from 'jsonwebtoken'
import md5 from 'md5'
import mongoose from 'mongoose'

export const register = async (req, res) => {
  if (!req.headers['content-type'] || !req.headers['content-type'].includes('application/json')) {
    res.status(400).send({ success: false, message: '資料格式不正確' })
    return
  }
  try {
    await users.create(req.body)
    res.status(200).send({ success: true, message: '' })
  } catch (error) {
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(400).send({ success: false, message: message })
    } else if (error.name === 'MongoError' && error.code === 11000) {
      res.status(400).send({ success: false, message: '帳號已存在' })
    } else {
      res.status(500).send({ success: false, message: '伺服器錯誤' })
    }
  }
}

export const login = async (req, res) => {
  if (!req.headers['content-type'] || !req.headers['content-type'].includes('application/json')) {
    res.status(400).send({ success: false, message: '資料格式不正確' })
    return
  }
  try {
    const user = await users.findOne({ account: req.body.account }, '')
    if (user) {
      if (user.password === md5(req.body.password)) {
        if (user.friend.length === 0) {
          user.friend.push({ user_id: mongoose.Types.ObjectId('60f52553a2ad5002acfd3675') })
          await users.findByIdAndUpdate({ _id: mongoose.Types.ObjectId('60f52553a2ad5002acfd3675') }, { $push: { friend: { user_id: user._id } } }, { new: true })
        }
        const token = jwt.sign({ _id: user._id.toString() }, process.env.SECRET, { expiresIn: '7 days' })
        user.tokens.push(token)
        user.save({ validateBeforeSave: false })
        res.status(200).send({
          success: true,
          message: '登入成功',
          token,
          email: user.email,
          account: user.account,
          role: user.role,
          avatar: user.avatar,
          userId: user.userId,
          _id: user._id,
          imagefiles: user.imagefiles
        })
      } else {
        res.status(400).send({ success: false, message: '密碼錯誤' })
      }
    } else {
      res.status(400).send({ success: false, message: '帳號錯誤' })
    }
  } catch (error) {
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const getUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      res.status(200).send({ success: true, message: '', result: req.user })
    } else {
      res.status(403).send({ success: false, message: '沒有權限' })
    }
  } catch (error) {
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const logout = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => {
      return token !== req.token
    })
    req.user.save({ validateBeforeSave: false })
    res.status(200).send({ success: true, message: '' })
  } catch (error) {
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const editUserData = async (req, res) => {
  try {
    if (req.body.follow) {
      const result = await users.findById(req.params.id)
      if (!result) {
        res.status(404).send({ success: false, message: '資料不存在' })
        return
      }
      const idxfollow = req.user.follow.findIndex(item => item.post_id.toString() === req.body.follow)
      const idxpost = req.user.post.findIndex(item => item.post_id.toString() === req.body.follow)
      if (idxfollow > -1) {
        res.status(404).send({ success: false, message: '已經參與活動' })
        return
      } else if (idxpost > -1) {
        res.status(404).send({ success: false, message: '別鬧啦！你就是主辦人～' })
        return
      } else {
        req.user.follow.push({ post_id: req.body.follow })
      }
      await req.user.save({ validateBeforeSave: false })
      await posts.findByIdAndUpdate(req.body.follow, { $push: { member: { user_id: req.user.id, avatar: req.user.avatar, userId: req.user.userId } } }, { new: true })
      res.status(200).send({ success: true, message: '' })
    } else if (req.body.post) {
      await users.findOneAndUpdate(
        { 'follow.post_id': req.body.post },
        {
          $pull: {
            follow: {
              post_id: req.body.post
            }
          }
        }
      )
      await posts.findByIdAndUpdate(
        { _id: req.body.post, 'member.user_id': req.params.id },
        {
          $pull: {
            member: {
              user_id: req.params.id
            }
          }
        }
      )
      res.status(200).send({ success: true, message: '刪除完成' })
    } else {
      const data = {
        name: req.body.name,
        email: req.body.email,
        account: req.body.account,
        avatar: req.body.avatar,
        userId: req.body.userId,
        introduction: req.body.introduction,
        birthday: req.body.birthday
      }
      await posts.updateMany({ user: req.params.id }, data, { new: true })
      if (req.filepath.length > 0) {
        data.imagefiles = req.filepath
        console.log(req.filepath)
        await posts.updateMany({ user: req.params.id }, { avatar: data.imagefiles }, { new: true })
      }
      const result = await users.findByIdAndUpdate(req.params.id, data, { new: true })
      res.status(200).send({ success: true, message: '', result })
    }
  } catch (error) {
    console.log(error)
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(400).send({ success: false, message: message })
    } else {
      res.status(500).send({ success: false, message: '伺服器錯誤' })
    }
  }
}

export const addCart = async (req, res) => {
  try {
    const result = await products.findById(req.body.product)
    if (!result || !result.sell) {
      res.status(404).send({ success: false, message: '資料不存在' })
      return
    }
    const idx = req.user.cart.findIndex(item => item.product.toString() === req.body.product)
    if (idx > -1 && req.user.cart[idx].option === req.body.option) {
      req.user.cart[idx].amount += req.body.amount
    } else {
      req.user.cart.push({ product: req.body.product, option: req.body.option, amount: req.body.amount })
    }
    await req.user.save({ validateBeforeSave: false })
    res.status(200).send({ success: true, message: '' })
  } catch (error) {
    console.log(error)
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const getCart = async (req, res) => {
  try {
    const result = await users.findById(req.user._id, 'cart coupon').populate('cart.product')
    res.status(200).send({ success: true, message: '', result: result })
  } catch (error) {
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const editCart = async (req, res) => {
  try {
    if (req.body.amount <= 0) {
      await users.findOneAndUpdate(
        { account: req.body.account, 'cart.product': req.body.product, 'cart.option': req.body.option },
        {
          $pull: {
            cart: {
              product: req.body.product
            }
          }
        }
      )
    } else {
      await users.findOneAndUpdate(
        {
          'cart.product': req.body.product
        },
        {
          $set: {
            'cart.$.amount': req.body.amount
          }
        }
      )
    }
    res.status(200).send({ success: true, message: '' })
  } catch (error) {
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const editCoupon = async (req, res) => {
  try {
    const result = await users.findByIdAndUpdate({ _id: req.body._id }, { coupon: req.body.coupon, cart: [] }, { new: true })
    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const getpost = async (req, res) => {
  try {
    const result = await users.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(req.user._id)
        }
      }, {
        $lookup: {
          from: 'posts',
          localField: 'post.post_id',
          foreignField: '_id',
          as: 'post'
        }
      }, {
        $project: {
          post: 1
        }
      }, {
        $unwind: {
          path: '$post'
        }
      }, {
        $match: {
          'post.show': true
        }
      }
    ])
    res.status(200).send({ success: true, message: '', result: result })
  } catch (error) {
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const getfollow = async (req, res) => {
  try {
    const result = await users.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(req.user._id)
        }
      }, {
        $lookup: {
          from: 'posts',
          localField: 'follow.post_id',
          foreignField: '_id',
          as: 'follow'
        }
      }, {
        $project: {
          follow: 1
        }
      }, {
        $unwind: {
          path: '$follow'
        }
      }, {
        $match: {
          'follow.show': true
        }
      }
    ])
    res.status(200).send({ success: true, message: '', result: result })
  } catch (error) {
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const sendCoupon = async (req, res) => {
  try {
    const result = await products.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(req.body.id)
        }
      }, {
        $lookup: {
          from: 'orders',
          localField: 'buyer.order',
          foreignField: '_id',
          as: 'buyer'
        }
      }, {
        $unwind: {
          path: '$buyer'
        }
      }, {
        $project: {
          count: 1,
          coupon: 1,
          'buyer.user': 1,
          'buyer.products': 1
        }
      }, {
        $addFields: {
          res: {
            $filter: {
              input: '$buyer.products',
              as: 'i',
              cond: {
                $eq: [
                  '$$i.product', '$_id'
                ]
              }
            }
          }
        }
      }, {
        $unwind: {
          path: '$res'
        }
      }, {
        $project: {
          'buyer.user': 1,
          total: {
            $multiply: [
              '$coupon', '$res.amount'
            ]
          }
        }
      }, {
        $lookup: {
          from: 'users',
          localField: 'buyer.user',
          foreignField: '_id',
          as: 'buyer.user'
        }
      }, {
        $unwind: {
          path: '$buyer.user'
        }
      }, {
        $project: {
          'buyer.user.coupon': 1,
          'buyer.user._id': 1,
          total: 1,
          user: '$buyer.user._id',
          newCoupon: {
            $add: [
              '$total', '$buyer.user.coupon'
            ]
          }
        }
      }
    ])
    console.log(result)
    for (let i = 0; i < result.length; i++) {
      await users.findByIdAndUpdate(result[i].user, { coupon: result[i].newCoupon }, { new: true })
    }
    await products.findByIdAndUpdate(result[0]._id, { sell: false, order_quantity: 0 }, { new: true })
    res.status(200).send({ success: true, message: '', result: result })
  } catch (error) {
    console.log(error)
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const addFriend = async (req, res) => {
  try {
    const idxfriend = req.user.friend.findIndex(item => item.user_id.toString() === req.body.userId)
    if (idxfriend > -1) {
      res.status(404).send({ success: false, message: '已經加入好友' })
      return
    } else {
      req.user.friend.push({ user_id: req.body.userId })
    }
    await req.user.save({ validateBeforeSave: false })
    await users.findByIdAndUpdate({ _id: req.body.userId }, { $push: { friend: { user_id: mongoose.Types.ObjectId(req.user._id) } } }, { new: true })
    res.status(200).send({ success: true, message: '' })
  } catch (error) {
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const getFriend = async (req, res) => {
  try {
    let result = await users.findById(req.user._id, 'friend').populate('friend.user_id')
    result = result.toObject()
    delete result.password
    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const extend = async (req, res) => {
  try {
    const idx = req.user.tokens.findIndex(token => req.token === token)
    const token = jwt.sign({ _id: req.user._id.toString() }, process.env.SECRET, { expiresIn: '7 days' })
    req.user.tokens[idx] = token
    req.user.markModified('tokens')
    req.user.save({ validateBeforeSave: false })
    res.status(200).send({ success: true, message: '', result: token })
  } catch (error) {
    console.log(error)
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const getuserinfo = async (req, res) => {
  try {
    res.status(200).send({
      success: true,
      message: '',
      result: {
        email: req.user.email,
        account: req.user.account,
        role: req.user.role,
        avatar: req.user.avatar,
        userId: req.user.userId,
        _id: req.user._id,
        imagefiles: req.user.imagefiles
      }
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}
