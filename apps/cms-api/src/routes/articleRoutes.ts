import { Router } from 'express'
import { articleController } from '../controllers/articleController'

const router = Router()

// GET /api/v1/cms/articles - Get all articles
router.get('/', articleController.getArticles)

// GET /api/v1/cms/articles/:id - Get article by ID
router.get('/:id', articleController.getArticleById)

// POST /api/v1/cms/articles - Create new article
router.post('/', articleController.createArticle)

// PUT /api/v1/cms/articles/:id - Update article
router.put('/:id', articleController.updateArticle)

// DELETE /api/v1/cms/articles/:id - Delete article
router.delete('/:id', articleController.deleteArticle)

export default router
