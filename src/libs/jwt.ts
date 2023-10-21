import { generateKeyPairSync, KeyExportOptions, randomBytes } from 'crypto'
import { createWriteStream, existsSync, mkdirSync, readFileSync } from 'fs'
import { sign, SignOptions, verify, VerifyOptions } from 'jsonwebtoken'
import { join } from 'path'
import { v4 as uuid } from 'uuid'
import { APP_ENV } from '..'

export class JWTKey {
  private _genKeyFile(keyName: string, dir: string): void {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', {
      modulusLength: 512
    })
    const options: KeyExportOptions<'pem'> = {
      format: 'pem',
      type: 'pkcs1'
    }
    // get keys
    const PRIK = privateKey.export(options) as string
    const PUBK = publicKey.export(options) as string
    // save public key
    const public_key = createWriteStream(join(dir, `./${keyName}.key.pub`))
    public_key.write(PUBK)
    public_key.end()
    // save private key
    const private_key = createWriteStream(join(dir, `./${keyName}.key`))
    private_key.write(PRIK)
    private_key.end()
  }

  public getTokenKey() {
    randomBytes(56, (_err, buffer) => {
      var token = buffer.toString('hex')
      const public_key = createWriteStream('.env', { flags: 'a' })
      public_key.write(`\nJWT_SECRET=${token}\n`)
      public_key.end()
    })
  }

  public generate(): void {
    const KEY_DIR = './keys'
    if (!existsSync(join(KEY_DIR))) {
      mkdirSync(KEY_DIR)
      this._genKeyFile('access', KEY_DIR)
      this._genKeyFile('refresh', KEY_DIR)
    }
  }
}

const ua = 'Access Denied! Unauthorized user.'
const access_key_pub = readFileSync(join('./keys/access.key.pub'))
const access_key = readFileSync(join('./keys/access.key'))
const refresh_key_pub = readFileSync(join('./keys/refresh.key.pub'))
const refresh_key = readFileSync(join('./keys/refresh.key'))

export const verifyOptions: VerifyOptions = {
  algorithms: ['RS256']
}

export interface TokenPayload {
  jti: string
  scopes: string[]
  iat: number
  exp?: number
  aud: string
  iss?: string
  sub?: string
}
/**
 * It signs a JWT access token with the user's id, rights and scopes, and stores it in Redis
 * @param {number} userId - The user's id
 * @param {string[]} scopes - string[] = []
 * @returns A promise that resolves to a token
 */
export const signAccessToken = (userId: string, scopes: string[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    const payload: TokenPayload = {
      jti: uuid(),
      iat: Math.floor(Date.now() / 1000) - 30,
      scopes: [...scopes],
      aud: `${userId}`
    }
    const options: SignOptions = {
      algorithm: 'RS256',
      expiresIn: `${APP_ENV.JWT_ACCESS_TOKEN_EXP}m`, // expires in minutes
      issuer: APP_ENV.JWT_ISSUER,
      audience: APP_ENV.JWT_AUDIENCE,
      subject: APP_ENV.JWT_SUBJECT
    }
    sign(payload, access_key, options, (err, token) => {
      if (err) {
        reject(err)
      }
      try {
        // await setRedisAsync(`ur_${uuid}`, token, 'EX', Number(+JWT_ACCESS_TOKEN_EXP! * 24 * 61 * 60));
        resolve(token)
      } catch (error) {
        if (error instanceof Error) reject(error)
      }
    })
  })
}

/**
 * It signs a JWT refresh token with the user's id, rights, and scopes, and then stores it in Redis
 * @param {number} userId - The user's ID
 * @param {string[]} scopes - string[] = [] - an array of scopes that the user has access to.
 * @returns A promise that resolves to a token.
 */
export const signRefreshToken = (userId: string, scopes: string[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    // cirtificate token
    //   const privateKey: string = readPrivateKey(false)!;
    const payload = {
      jti: uuid(),
      scopes: [...scopes],
      user: userId
    }
    const options: SignOptions = {
      algorithm: 'RS256',
      expiresIn: `${APP_ENV.JWT_REFRESH_TOKEN_EXP}d`, // expires in days
      issuer: APP_ENV.JWT_ISSUER,
      audience: APP_ENV.JWT_AUDIENCE,
      subject: APP_ENV.JWT_SUBJECT
    }
    sign(payload, refresh_key, options, async (err, token): Promise<void> => {
      if (err) reject(err)
      try {
        // remove first
        // await remRedisAsync(`user:${userId}`);
        // then save new one
        // await setRedisAsync(`user:${userId}`, token, 'EX', Number(+APP_ENV.JWT_REFRESH_TOKEN_EXP * 24 * 60 * 60));
        resolve(token)
      } catch (error) {
        // console.log(error, 'JWT-SIGN-REFRESH');
        if (error instanceof Error) reject(error)
      }
    })
  })
}

/**
 * It takes a token, reads the public key from the file system, and then uses the verify function from
 * the jsonwebtoken library to verify the token
 * @param {string} token - The token to validate
 * @returns A promise that resolves to a TokenPayload object.
 */
export function validateToken(token: string): Promise<TokenPayload> {
  // cirtificate token
  // const publicKey: string = readPublicKey()!;
  // const verifyOptions: VerifyOptions = {
  //   algorithms: ['RS256'],
  // };

  return new Promise((resolve, reject) => {
    verify(token, access_key_pub, verifyOptions, (error, decoded: TokenPayload | any) => {
      // if validation fails
      if (error) return reject(error)

      // console.log('decoded :', decoded);
      resolve(decoded)
    })
  })
}

/**
 * It verifies the refresh token, and if it's valid, it returns the userID, the user's rights, and the
 * jti
 * @param {string} refreshToken - The refresh token that was sent to the client.
 * @returns A promise that resolves to an object containing the userID, rights, and jti.
 */
export const verifyRefreshToken = (
  refreshToken: string,
  isLogoutParpuse = false
): Promise<{ userID: string; rights: string; jti: string }> => {
  return new Promise((_resolve, reject) => {
    // cirtificate token
    // const publicKey: string = readPublicKey(false)!;
    verify(
      refreshToken,
      refresh_key_pub,
      verifyOptions,
      async (err: any, _decoded: TokenPayload | any): Promise<void> => {
        if (err) reject(!isLogoutParpuse ? ua : 'invalid_refresh_token')

        try {
          //   if (!!affectedRows) resolve({ userID, rights: data?.role, jti })
          //   if (isLogoutParpuse) resolve({ userID, rights: data?.role, jti })
          reject(ua)
        } catch (error) {
          if (error instanceof Error) reject(error)
        }
      }
    )
  })
}
