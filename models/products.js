import mongoose from 'mongoose'

const Schema = mongoose.Schema

const productsSchema = new Schema({
  name: {
    type: String,
    required: [true, '品名不能為空'],
    minlength: [1, '品名不能為空']
  },
  price: {
    type: Number,
    min: [0, '價格格式不正確'],
    required: [true, '價格不能為空']
  },
  category: {
    type: String,
    required: [true, '類別不能為空']
  },
  description: {
    type: String,
    required: [true, '敘述不能為空']
  },
  image: {
    type: [String],
    default: []
  },
  imagefiles: {
    type: [String],
    default: []
  },
  sell: {
    type: Boolean,
    default: false
  },
  buyer: {
    type: [{
      order: {
        type: Schema.Types.ObjectId,
        ref: 'orders'
      }
    }]
  },
  count: {
    type: Number,
    required: [true, '優惠條件不能為空']
  },
  coupon: {
    type: Number,
    required: [true, '點數不能為空']
  },
  options: {
    type: Array,
    default: ['無'],
    required: [true, '選項不能為空']
  },
  order_quantity: {
    type: Number,
    default: 0,
    required: [true, '訂購數量不能為空']
  }
}, { versionKey: false })

export default mongoose.model('products', productsSchema)
