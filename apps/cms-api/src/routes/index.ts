import dayjs from 'dayjs'
import { Router } from 'express'
import articleRoutes from './articleRoutes'

const router = Router()

// Mount article routes at /api/v1/cms/articles
router.use('/articles', articleRoutes)

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    message: 'CMS API is healthy',
    timestamp: dayjs().toISOString(),
  })
})

export default router
