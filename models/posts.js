import mongoose from 'mongoose'

const Schema = mongoose.Schema

const postSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: [true, '缺少揪團者資料']
  },
  userId: {
    type: Schema.Types.String,
    ref: 'users',
    required: [true, '缺少揪團者暱稱']
  },
  avatar: {
    type: Schema.Types.Array,
    ref: 'users',
    required: [true, '缺少揪團者頭貼']
  },
  title: {
    type: String,
    required: [true, '缺少揪團標題']
  },
  activeImage: {
    type: [String],
    default: [
      '1628611868571.jpg'
    ],
    required: [true, '缺少揪團圖片']
  },
  imagefiles: {
    type: [String],
    default: []
  },
  city: {
    type: String,
    required: [true, '缺少揪團地點']
  },
  activeDate: {
    type: Date,
    required: [true, '缺少揪團日期']
  },
  description: {
    type: String,
    required: [true, '缺少揪團敘述']
  },
  member: {
    type: [{
      user_id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: [true, '缺少參與者ID']
      },
      avatar: {
        type: [String],
        required: [true, '缺少參與者頭貼']
      },
      userId: {
        type: String,
        required: [true, '缺少參與者暱稱']
      }
    }]
  },
  postDate: {
    type: String,
    required: [true, '缺少po文日期']
  },
  categories: {
    type: String,
    required: [true, '缺少活動類別']
  },
  show: {
    type: Boolean,
    default: true,
    required: [true, '缺少貼文狀態']
  }
}, { versionKey: false })

export default mongoose.model('posts', postSchema)
