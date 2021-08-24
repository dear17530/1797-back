import mongoose from 'mongoose'

const Schema = mongoose.Schema

const messageSchema = new Schema({
  message: {
    type: String,
    minlength: [1, '至少輸入 1 個字'],
    required: [true, '缺少訊息']
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: [true, '缺少傳送人Id']
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: [true, '缺少接收人Id']
  },
  date: {
    type: Date,
    required: [true, '缺少訊息日期']
  },
  welcomeMessage: {
    type: Boolean,
    default: false,
    required: [true, '是否為歡迎詞']
  }
}, { versionKey: false })

export default mongoose.model('messages', messageSchema)
