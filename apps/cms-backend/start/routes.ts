import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Public routes - CMS content
router
  .group(() => {
    // Blog
    router.get('/blog', '#controllers/blog_posts_controller.index')
    router.get('/blog/:slug', '#controllers/blog_posts_controller.show')

    // Games (basic info)
    router.get('/games', '#controllers/games_controller.index')
    router.get('/games/:slug', '#controllers/games_controller.show')

    // Studio info
    router.get('/studio', '#controllers/studio_controller.show')
  })
  .prefix('/api/cms')

// Admin routes - requires authentication
router
  .group(() => {
    // Blog management
    router.post('/blog', '#controllers/blog_posts_controller.store')
    router.put('/blog/:id', '#controllers/blog_posts_controller.update')
    router.delete('/blog/:id', '#controllers/blog_posts_controller.destroy')

    // Game management
    router.post('/games', '#controllers/games_controller.store')
    router.put('/games/:id', '#controllers/games_controller.update')
    router.delete('/games/:id', '#controllers/games_controller.destroy')

    // Media upload
    router.post('/media', '#controllers/media_controller.upload')
  })
  .prefix('/api/cms/admin')
  .use(middleware.auth())

// Authentication
router.post('/api/auth/login', '#controllers/auth_controller.login')
router.post('/api/auth/logout', '#controllers/auth_controller.logout')
