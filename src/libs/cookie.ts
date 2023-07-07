import { Response } from 'express'

export const setJWT = (jwtToken: string, res: Response, isAdmin: boolean = false): void => {
  const tokenName = !isAdmin ? '_token' : '_adt_secure'
  const tokenAge = !isAdmin ? 3 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000 // [user] 3 days [admin] 7 days
  res.cookie(tokenName, jwtToken, {
    httpOnly: true,
    sameSite: 'none',
    secure: process.env.NODE_ENV !== 'production',
    maxAge: tokenAge
  })
  res.cookie('logged_in', true, { httpOnly: false, maxAge: tokenAge })
  // res.cookie('jwt', jwtToken, { httpOnly: true, sameSite: 'none', maxAge: 24 * 60 * 60 * 1000 });
}

export const clearJWT = (res: Response, isAdmin: boolean = false): void => {
  res.clearCookie(!isAdmin ? '_token' : '_adt_secure')
  // res.clearCookie('jwt', { httpOnly: true, sameSite: 'none', });
}
