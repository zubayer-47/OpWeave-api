import cors from 'cors'
export const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173', 'https://opweave.vercel.app', "https://5173-idx-opweave-1730702671100.cluster-nx3nmmkbnfe54q3dd4pfbgilpc.cloudworkstations.dev", "https://5173-idx-opweave-1730707235256.cluster-mwrgkbggpvbq6tvtviraw2knqg.cloudworkstations.dev"]

const corsOptions: cors.CorsOptions = {
  origin: function (origin: any, callback: Function) {
    // Allow request with no origins (like mobile apps or curl requests)
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('cors'))
    }
  },
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'X-Access-Token',
    'Authorization',
    'X-Total-Count',
    'X-Total-Member-Count',
    'X-Total-Post-Count'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 200
}

export default corsOptions
