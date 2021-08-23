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
          date: 1
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
