import mongoose from 'mongoose'

const Schema = mongoose.Schema

const adminSchema = new Schema({
  targetSales: {
    type: [String],
    default: ['10000', '10000', '10000', '10000', '10000'],
    required: [true, '缺少業績目標']
  },
  indexProducts: {
    type: [{
      product_id: {
        type: Schema.Types.ObjectId,
        ref: 'products'
      }
    }]
  },
  indexPosts: {
    type: [{
      post_id: {
        type: Schema.Types.ObjectId,
        ref: 'posts'
      }
    }]
  }
}, { versionKey: false })

export default mongoose.model('admins', adminSchema)
