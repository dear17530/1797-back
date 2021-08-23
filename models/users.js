import mongoose from 'mongoose'
import md5 from 'md5'
import validator from 'validator'

const Schema = mongoose.Schema

const userSchema = new Schema({
  account: {
    type: String,
    minlength: [4, '請輸入 4 ~ 20 個字'],
    maxlength: [20, '請輸入 4 ~ 20 個字'],
    required: [true, '請填寫您的帳號'],
    unique: true
  },
  password: {
    type: String,
    minlength: [4, '請輸入 4 ~ 20 個字'],
    maxlength: [20, '請輸入 4 ~ 20 個字'],
    required: [true, '請填寫您的密碼']
  },
  email: {
    type: String,
    required: [true, '請填寫您的信箱'],
    unique: true,
    validate: {
      validator (value) {
        return validator.isEmail(value)
      },
      message: '信箱格式錯誤'
    }
  },
  birthday: {
    type: Date,
    required: [true, '請填寫您的出生年月日']
  },
  name: {
    type: String,
    minlength: [2, '請輸入 2 個字以上'],
    required: [true, '請填寫您的本名']
  },
  userId: {
    type: String,
    minlength: [1, '請輸入 1 ~ 8 個字'],
    maxlength: [8, '請輸入 1 ~ 8 個字'],
    required: [true, '請填寫您的暱稱']
  },
  role: {
    type: Number,
    default: 0,
    required: [true, '缺少使用者分類']
  },
  tokens: {
    type: [String]
  },
  avatar: {
    type: [String]
  },
  imagefiles: {
    type: [String],
    default: []
  },
  gender: {
    type: String,
    required: [true, '請填寫您的性別']
  },
  cart: {
    type: [{
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
    }]
  },
  orders: {
    type: [{
      order_id: {
        type: Schema.Types.ObjectId,
        ref: 'orders'
      }
    }]
  },
  coupon: {
    type: Number,
    default: 0,
    required: [true, '缺少折價點數']
  },
  post: {
    type: [{
      post_id: {
        type: Schema.Types.ObjectId,
        ref: 'posts'
      }
    }]
  },
  follow: {
    type: [{
      post_id: {
        type: Schema.Types.ObjectId,
        ref: 'posts'
      }
    }]
  },
  friend: {
    type: [{
      user_id: {
        type: Schema.Types.ObjectId,
        ref: 'users'
      }
    }]
  },
  introduction: {
    type: String,
    default: ''
  }
}, { versionKey: false })

userSchema.pre('save', function (next) {
  const user = this
  if (user.isModified('password')) {
    user.password = md5(user.password)
  }
  next()
})

export default mongoose.model('users', userSchema)
