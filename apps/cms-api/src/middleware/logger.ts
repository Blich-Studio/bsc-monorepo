import type { NextFunction, Request, Response } from 'express'

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const timestamp = new Date().toISOString()
  const { method } = req
  const { url } = req
  const ip = req.ip ?? req.connection.remoteAddress

  console.log(`[${timestamp}] ${method} ${url} - ${ip}`)

  // Log response status when response finishes
  res.on('finish', () => {
    console.log(`[${timestamp}] ${method} ${url} - ${res.statusCode}`)
  })

  next()
}
