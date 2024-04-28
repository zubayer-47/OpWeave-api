import { v2 as cloudinary } from 'cloudinary'
import multer, { Multer } from 'multer'

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
})

const storage = multer.memoryStorage()
export const upload: Multer = multer({ storage: storage })

export async function handleUpload(file) {
  const res = await cloudinary.uploader.upload(file, {
    folder: 'opweave',
    unique_filename: true,
    resource_type: 'image'
  })

  return res
}
