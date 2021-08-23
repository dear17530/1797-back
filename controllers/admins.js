import admins from '../models/admins.js'

export const getTargetSales = async (req, res) => {
  if (req.user.role !== 1) {
    res.status(403).send({ success: false, message: '沒有權限' })
    return
  }
  try {
    const result = await admins.findById('6118a2ce0dae1b22cccceb01')
    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    console.log(error)
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const setTargetSales = async (req, res) => {
  if (req.user.role !== 1) {
    res.status(403).send({ success: false, message: '沒有權限' })
    return
  }
  try {
    const result = await admins.findByIdAndUpdate('6118a2ce0dae1b22cccceb01', { targetSales: req.body.targetSales }, { new: true })
    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    console.log(error)
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const getIndexPosts = async (req, res) => {
  try {
    const result = await admins.findById('6118a2ce0dae1b22cccceb01', 'indexPosts').populate('indexPosts.post_id')
    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    console.log(error)
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const getIndexProducts = async (req, res) => {
  try {
    const result = await admins.findById('6118a2ce0dae1b22cccceb01', 'indexProducts').populate('indexProducts.product_id')
    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    console.log(error)
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}
