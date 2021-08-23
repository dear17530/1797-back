import multer from 'multer'
import FTPStorage from 'multer-ftp'
import path from 'path'
import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config()

// 收到檔案後的儲存設定
let storage
if (process.env.FTP === 'true') {
  storage = new FTPStorage({
    ftp: {
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASS,
      secure: false
    },
    destination (req, file, options, callback) {
      callback(null, '/' + Date.now() + path.extname(file.originalname))
    }
  })
} else {
  storage = multer.diskStorage({
    destination (req, file, callback) {
      const folder = path.join(process.cwd(), '/upload')
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder)
      }
      callback(null, 'upload/')
    },
    filename (req, file, callback) {
      callback(null, Date.now() + path.extname(file.originalname))
    }
  })
}

const upload = multer({
  storage,
  fileFilter (req, file, callback) {
    if (!file.mimetype.includes('image')) {
      callback(new multer.MulterError('LIMIT_FORMAT'), false)
    } else {
      callback(null, true)
    }
  },
  limits: {
    fileSize: 1024 * 1024
  }
})

export default async (req, res, next) => {
  upload.array('imagefiles', 5)(req, res, async error => {
    if (error instanceof multer.MulterError) {
      let message = '上傳錯誤'
      if (error.code === 'LIMIT_FILE_SIZE') {
        message = '檔案太大'
      } else if (error.code === 'LIMIT_FORMAT') {
        message = '格式不符'
      }
      res.status(400).send({ success: false, message })
    } else if (error) {
      res.status(500).send({ success: false, message: '伺服器錯誤' })
    } else {
      if (req.files) {
        req.filepath = req.files.map(f => process.env.FTP ? path.basename(f.path) : f.filename)
      }
      next()
    }
  })
}
