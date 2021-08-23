import posts from '../models/posts.js'

export const postActive = async (req, res) => {
  try {
    const data = {
      user: req.user._id,
      userId: req.user.userId,
      avatar: req.user.imagefiles,
      title: req.body.title,
      imagefiles: req.filepath,
      city: req.body.city,
      activeDate: req.body.activeDate,
      description: req.body.description,
      postDate: new Date().toLocaleString().slice(0, 9),
      categories: req.body.categories
    }
    const result = await posts.create(data)
    res.status(200).send({ success: true, message: '', result })
    req.user.post.push({ post_id: result._id })
    await req.user.save({ validateBeforeSave: false })
  } catch (error) {
    console.log(error)
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const getActive = async (req, res) => {
  try {
    const result = await posts.find({ show: true })
    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const getPost = async (req, res) => {
  try {
    const result = await posts.findById(req.params.id)
    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const editPost = async (req, res) => {
  if (req.headers['content-type'].includes('multipart/form-data')) {
    try {
      const data = {
        title: req.body.title,
        city: req.body.city,
        activeDate: req.body.activeDate,
        description: req.body.description,
        categories: req.body.categories,
        activeImage: req.body.activeImage
      }
      if (req.filepath) {
        data.imagefiles = req.filepath
      }
      const result = await posts.findByIdAndUpdate(req.params.id, data, { new: true })
      res.status(200).send({ success: true, message: '', result })
    } catch (error) {
      res.status(500).send({ success: false, message: '伺服器錯誤' })
    }
  } else if (req.headers['content-type'].includes('application/json')) {
    await posts.findByIdAndUpdate(req.params.id, { show: false }, { new: true })
    res.status(200).send({ success: true, message: '下架完成' })
  } else {
    res.status(400).send({ success: false, message: '資料格式不正確' })
  }
}
