import orders from '../models/orders.js'

export const checkout = async (req, res) => {
  try {
    if (req.user.cart.length > 0) {
      const result = await orders.create({
        user: req.user._id,
        name: req.user.name,
        products: req.user.cart,
        date: new Date(),
        sum: req.body.sum,
        delivery_number: req.body.delivery_number,
        delivery_method: req.body.delivery_method,
        address: req.body.address,
        contact_number: req.body.contact_number,
        payment_method: req.body.payment_method,
        payment_detail: {
          credit_card_Number: req.body.valueFields.cardNumber,
          cardHolder_full_name: req.body.valueFields.cardName,
          card_Month: req.body.valueFields.cardMonth,
          card_Year: req.body.valueFields.cardYear,
          cvc: req.body.valueFields.cardCvv
        },
        redeem: req.body.redeem,
        state: req.body.state,
        payment: req.body.payment
      })
      res.status(200).send({ success: true, message: '' })
      req.user.orders.push({ order_id: result._id })
      await req.user.save({ validateBeforeSave: false })
    }
  } catch (error) {
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const getorders = async (req, res) => {
  try {
    const result = await orders.find({ user: req.user._id }).populate('products.product')
    res.status(200).send({ success: true, message: '', result: result })
  } catch (error) {
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const getAllorders = async (req, res) => {
  if (req.user.role !== 1) {
    res.status(403).send({ success: false, message: '沒有權限' })
    return
  }
  try {
    const result = await orders.find().populate('products.product')
    res.status(200).send({ success: true, message: '', result: result })
  } catch (error) {
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const editorder = async (req, res) => {
  if (req.user.role === 1) {
    try {
      const data = {
        address: req.body.address,
        contact_number: req.body.contact_number,
        delivery_number: req.body.delivery_number,
        name: req.body.name,
        state: req.body.state
      }
      const result = await orders.findByIdAndUpdate(req.params.id, data, { new: true })
      res.status(200).send({ success: true, message: '', result })
    } catch (error) {
      res.status(500).send({ success: false, message: '伺服器錯誤' })
    }
  } else {
    try {
      const result = await orders.findByIdAndUpdate(req.params.id, { state: req.body.state }, { new: true })
      res.status(200).send({ success: true, message: '', result })
    } catch (error) {
      res.status(500).send({ success: false, message: '伺服器錯誤' })
    }
  }
}

export const getCategorySales = async (req, res) => {
  if (req.user.role !== 1) {
    res.status(403).send({ success: false, message: '沒有權限' })
    return
  }
  try {
    const result = await orders.aggregate([
      {
        $unwind: {
          path: '$products'
        }
      }, {
        $project: {
          year: {
            $year: '$date'
          },
          month: {
            $month: '$date'
          },
          state: 1,
          products: 1,
          amount: '$products.amount'
        }
      }, {
        $lookup: {
          from: 'products',
          localField: 'products.product',
          foreignField: '_id',
          as: 'products'
        }
      }, {
        $unwind: {
          path: '$products'
        }
      }, {
        $project: {
          year: 1,
          month: 1,
          name: '$products.name',
          product_id: '$products._id',
          price: '$products.price',
          category: '$products.category',
          amount: 1,
          sum: {
            $multiply: [
              '$products.price', '$amount'
            ]
          }
        }
      }, {
        $group: {
          _id: {
            _id: '$category',
            year: '$year',
            month: '$month'
          },
          totalSaleAmount: {
            $sum: '$sum'
          }
        }
      }
    ])
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

export const getOrdersQuantity = async (req, res) => {
  if (req.user.role !== 1) {
    res.status(403).send({ success: false, message: '沒有權限' })
    return
  }
  try {
    const result = await orders.aggregate([
      {
        $match: {
          state: '訂單完成'
        }
      }, {
        $project: {
          year: {
            $year: '$date'
          },
          month: {
            $month: '$date'
          }
        }
      }
    ])
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

export const getProductSales = async (req, res) => {
  if (req.user.role !== 1) {
    res.status(403).send({ success: false, message: '沒有權限' })
    return
  }
  try {
    const result = await orders.aggregate([
      {
        $match: {
          state: '訂單完成'
        }
      }, {
        $unwind: {
          path: '$products'
        }
      }, {
        $project: {
          year: {
            $year: '$date'
          },
          month: {
            $month: '$date'
          },
          amount: '$products.amount',
          products: 1
        }
      }, {
        $lookup: {
          from: 'products',
          localField: 'products.product',
          foreignField: '_id',
          as: 'products'
        }
      }, {
        $unwind: {
          path: '$products'
        }
      }, {
        $project: {
          saleAmount: {
            $multiply: [
              '$products.price', '$amount'
            ]
          },
          year: 1,
          month: 1,
          amount: 1,
          products: 1
        }
      }, {
        $group: {
          _id: '$products',
          productQuantity: {
            $sum: '$amount'
          },
          productSaleAmount: {
            $sum: '$saleAmount'
          }
        }
      }
    ])
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
