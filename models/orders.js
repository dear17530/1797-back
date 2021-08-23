import mongoose from 'mongoose'

const Schema = mongoose.Schema

const orderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: [true, '缺少購買者資料']
  },
  name: {
    type: String,
    required: [true, '缺少購買者姓名']
  },
  products: [{
    product: {
      type: Schema.Types.ObjectId,
      ref: 'products',
      required: [true, '缺少商品 ID']
    },
    amount: {
      type: Number,
      required: [true, '缺少商品數量']
    },
    option: {
      type: String,
      required: [true, '缺少商品種類']
    }
  }],
  date: {
    type: Date,
    required: [true, '缺少訂單日期']
  },
  delivery_method: {
    type: String,
    required: [true, '缺少運送方式']
  },
  delivery_number: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    required: [true, '缺少地址']
  },
  contact_number: {
    type: String,
    validate: {
      validator: function (v) {
        return /^09\d{8}$/.test(v)
      },
      message: '格式錯誤'
    },
    required: [true, '缺少手機號碼']
  },
  payment: {
    type: Boolean,
    default: false,
    required: [true, '缺少付款狀態']
  },
  state: {
    type: String,
    default: '待出貨',
    required: [true, '缺少訂單狀態']
  },
  redeem: {
    type: Number,
    required: [true, '缺少折抵點數']
  },
  sum: {
    type: Number,
    required: [true, '缺少總金額']
  },
  payment_method: {
    type: String,
    required: [true, '缺少付款方式']
  },
  payment_detail: [{
    credit_card_Number: {
      type: String
    },
    cardHolder_full_name: {
      type: String
    },
    card_Month: {
      type: String
    },
    card_Year: {
      type: String
    },
    cvc: {
      type: String
    }
  }]
}, { versionKey: false })

export default mongoose.model('orders', orderSchema)
