import messages from '../models/messages.js'
import mongoose from 'mongoose'
import users from '../models/users.js'

export const sendMessage = async (req, res) => {
  try {
    const result = await messages.create({
      message: req.body.message,
      sender: req.user._id,
      receiver: req.body.receiver,
      date: new Date()
    })
    res.status(200).send({ success: true, message: '', result })
    if (req.body.message === '我該如何發起活動？') {
      await messages.create({
        message: '您可以至活動頁面點擊「新增活動」。',
        welcomeMessage: false,
        sender: mongoose.Types.ObjectId('60f52553a2ad5002acfd3675'),
        receiver: mongoose.Types.ObjectId(req.user._id),
        date: new Date()
      })
    } else if (req.body.message === '我該如何編輯活動？') {
      await messages.create({
        message: '發起活動後，您可以至「會員中心」點擊編輯活動進行編輯。',
        welcomeMessage: false,
        sender: mongoose.Types.ObjectId('60f52553a2ad5002acfd3675'),
        receiver: mongoose.Types.ObjectId(req.user._id),
        date: new Date()
      })
    } else if (req.body.message === '我該如何查看有誰參與了我的活動？') {
      await messages.create({
        message: '發起活動後，您可以至「會員中心」查看該活動的跟團者。',
        welcomeMessage: false,
        sender: mongoose.Types.ObjectId('60f52553a2ad5002acfd3675'),
        receiver: mongoose.Types.ObjectId(req.user._id),
        date: new Date()
      })
    } else if (req.body.message === '我該如何參與他人的活動？') {
      await messages.create({
        message: '您可以至活動頁面點擊「參加」。',
        welcomeMessage: false,
        sender: mongoose.Types.ObjectId('60f52553a2ad5002acfd3675'),
        receiver: mongoose.Types.ObjectId(req.user._id),
        date: new Date()
      })
    } else if (req.body.message === '我該如何私訊主辦人？') {
      await messages.create({
        message: '至活動頁面點擊「私訊」後查看您的「私人訊息」與主辦人聯繫。',
        welcomeMessage: false,
        sender: mongoose.Types.ObjectId('60f52553a2ad5002acfd3675'),
        receiver: mongoose.Types.ObjectId(req.user._id),
        date: new Date()
      })
    } else if (req.body.message === '回饋點數可以怎麼使用？') {
      await messages.create({
        message: '結帳時，輸入您要折抵的點數，注意單筆訂單最多只能使用 50 點。',
        welcomeMessage: false,
        sender: mongoose.Types.ObjectId('60f52553a2ad5002acfd3675'),
        receiver: mongoose.Types.ObjectId(req.user._id),
        date: new Date()
      })
    } else if (req.body.message === '回饋點數怎麼獲得？') {
      await messages.create({
        message: '商品達優惠門檻後，管理員會立即發放優惠點數。',
        welcomeMessage: false,
        sender: mongoose.Types.ObjectId('60f52553a2ad5002acfd3675'),
        receiver: mongoose.Types.ObjectId(req.user._id),
        date: new Date()
      })
    }
  } catch (error) {
    console.log(error)
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const getMessage = async (req, res) => {
  try {
    const result = await messages.aggregate([
      {
        $match: {
          $or: [
            {
              sender: mongoose.Types.ObjectId(req.user._id),
              receiver: mongoose.Types.ObjectId(req.params.id)
            }, {
              sender: mongoose.Types.ObjectId(req.params.id),
              receiver: mongoose.Types.ObjectId(req.user._id)
            }
          ]
        }
      }, {
        $lookup: {
          from: 'users',
          localField: 'sender',
          foreignField: '_id',
          as: 'sender'
        }
      }, {
        $lookup: {
          from: 'users',
          localField: 'receiver',
          foreignField: '_id',
          as: 'receiver'
        }
      }, {
        $unwind: {
          path: '$receiver'
        }
      }, {
        $unwind: {
          path: '$sender'
        }
      }, {
        $project: {
          message: 1,
          'sender._id': 1,
          'sender.avatar': 1,
          'sender.imagefiles': 1,
          'sender.role': 1,
          'sender.userId': 1,
          'receiver._id': 1,
          'receiver.avatar': 1,
          'receiver.imagefiles': 1,
          'receiver.role': 1,
          'receiver.userId': 1,
          date: 1,
          welcomeMessage: 1
        }
      }, {
        $sort: {
          date: 1
        }
      }
    ])
    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    console.log(error)
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const getProfile = async (req, res) => {
  try {
    const result = await users.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(req.params.id)
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
          avatar: 1,
          imagefiles: 1,
          userId: 1,
          birthday: 1,
          gender: 1,
          post: 1,
          introduction: 1
        }
      }
    ])
    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    console.log(error)
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}
