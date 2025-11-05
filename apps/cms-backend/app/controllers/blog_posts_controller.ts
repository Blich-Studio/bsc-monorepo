import type { HttpContext } from '@adonisjs/core/http'
import BlogPost from '#models/blog_post'

export default class BlogPostsController {
  // GET all blog posts (public)
  async index({ request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)

    const posts = await BlogPost.query()
      .where('status', 'published')
      .orderBy('publishedAt', 'desc')
      .paginate(page, limit)

    return posts
  }

  //GET a single blog post by slug (public)
  async show({ params }: HttpContext) {
    const post = await BlogPost.query()
      .where('slug', params.slug)
      .andWhere('status', 'published')
      .firstOrFail()

    return post
  }

  // POST create a new blog post (admin only)
  async store({ request, auth }: HttpContext) {
    await auth.authenticate()

    const data = request.only([
      'title',
      'slug',
      'content',
      'excerpt',
      'featuredImage',
      'tags',
      'status',
      'publishedAt',
    ])

    const post = await BlogPost.create(data)
    return post
  }

  // PUT update an existing blog post (admin only)
  async update({ params, request, auth }: HttpContext) {
    await auth.authenticate()

    const post = await BlogPost.findOrFail(params.id)

    const data = request.only([
      'title',
      'slug',
      'content',
      'excerpt',
      'featuredImage',
      'tags',
      'status',
      'publishedAt',
    ])

    post.merge(data)
    await post.save()

    return post
  }

  // DELETE a blog post (admin only)
  async destroy({ params, auth }: HttpContext) {
    await auth.authenticate()

    const post = await BlogPost.findOrFail(params.id)
    await post.delete()

    return { message: 'Blog post deleted successfully.' }
  }
}
