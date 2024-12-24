// pages/api/login.ts
import { NextApiRequest, NextApiResponse } from 'next'

const ADMIN_USERNAME = process.env.ADMIN_USERNAME
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { username, password } = req.body

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Set the cookie directly
    res.setHeader('Set-Cookie', `admin_auth=true; Path=/; HttpOnly; Max-Age=${60 * 60 * 24}; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''} SameSite=Strict`)

    return res.status(200).json({ success: true })
  }

  return res.status(401).json({ success: false, message: 'Invalid credentials' })
}