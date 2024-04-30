import { v2 as cloudinary } from 'cloudinary'
import { createHmac } from 'crypto'
import multer, { Multer } from 'multer'

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
})

const storage = multer.memoryStorage()
export const upload: Multer = multer({ storage: storage })

export async function handleUpload(userId: string, file) {
  const fileName = generateConsistentHash(userId)

  const res = await cloudinary.uploader.upload(file, {
    public_id: fileName,
    folder: 'opweave',
    allowed_formats: ['jpg', 'png', 'webp'],
    resource_type: 'image'
  })

  console.log('res handleUpload:', res)
  return res
}

function generateConsistentHash(userId: string): string {
  const hash = createHmac('sha256', '123').update(userId).digest('hex')

  return hash
}
