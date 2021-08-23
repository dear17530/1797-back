import products from '../models/products.js'
import orders from '../models/orders.js'

export const newProduct = async (req, res) => {
  if (req.user.role !== 1) {
    res.status(403).send({ success: false, message: '沒有權限' })
    return
  }
  if (!req.headers['content-type'] || !req.headers['content-type'].includes('multipart/form-data')) {
    res.status(400).send({ success: false, message: '資料格式不正確' })
    return
  }
  try {
    const result = await products.create({
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      sell: req.body.sell,
      image: req.filepath,
      category: req.body.category,
      count: req.body.count,
      coupon: req.body.coupon,
      options: req.body.options
    })
    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(400).send({ success: false, message: message })
    } else {
      res.status(500).send({ success: false, message: '伺服器錯誤' })
    }
  }
}

export const getProduct = async (req, res) => {
  try {
    const result = await products.find({ sell: true })
    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const getAllProduct = async (req, res) => {
  if (req.user.role !== 1) {
    res.status(403).send({ success: false, message: '沒有權限' })
    return
  }
  try {
    const result = await products.find()
    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const getProductById = async (req, res) => {
  try {
    const result = await products.findById(req.params.id)
    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    if (error.name === 'CastError') {
      res.status(404).send({ success: false, message: '查無商品' })
    } else {
      res.status(500).send({ success: false, message: '伺服器錯誤' })
    }
  }
}

export const editProduct = async (req, res) => {
  if (req.user.role === 1) {
    try {
      console.log(req.body)
      const data = {
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        category: req.body.category,
        sell: req.body.sell,
        count: req.body.count,
        coupon: req.body.coupon,
        options: req.body.options,
        image: req.body.image
      }
      if (req.filepath) data.imagefiles = req.filepath
      const result = await products.findByIdAndUpdate(req.params.id, data, { new: true })
      res.status(200).send({ success: true, message: '', result })
    } catch (error) {
      if (error.name === 'ValidationError') {
        const key = Object.keys(error.errors)[0]
        const message = error.errors[key].message
        res.status(400).send({ success: false, message: message })
      } else {
        res.status(500).send({ success: false, message: '伺服器錯誤' })
      }
    }
  } else {
    try {
      const buyer = {
        order: req.body.order
      }
      const result = await products.findByIdAndUpdate(req.params.id, { $push: { buyer: buyer } }, { new: true })
      res.status(200).send({ success: true, message: '', result })
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
}

export const editOrderQuantity = async (req, res) => {
  try {
    const result = await orders.aggregate([
      {
        $match: {
          state: {
            $in: [
              '訂單完成'
            ]
          }
        }
      }, {
        $project: {
          products: 1
        }
      }, {
        $unwind: {
          path: '$products'
        }
      }, {
        $group: {
          _id: '$products.product',
          total: {
            $sum: '$products.amount'
          }
        }
      }
    ])
    console.log(result)
    for (let i = 0; i < result.length; i++) {
      await products.findByIdAndUpdate(result[i]._id, { order_quantity: result[i].total }, { new: true })
    }
    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(400).send({ success: false, message: message })
    } else {
      res.status(500).send({ success: false, message: '伺服器錯誤' })
    }
  }
}
