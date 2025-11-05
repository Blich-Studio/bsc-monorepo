import type { HttpContext } from '@adonisjs/core/http'
import Asset from '#models/asset'

export default class GamesController {
  // GET all assets (public)
  async index({ request }: HttpContext) {
    const published = request.input('published', true)

    const query = Asset.query()

    if (published) {
      query.where('published', true)
    }

    const assets = await query.orderBy('created_at', 'desc')
    return assets
  }

  //GET a single asset by slug (public)
  async show({ params }: HttpContext) {
    const asset = await Asset.query()
      .where('slug', params.slug)
      .andWhere('published', true)
      .firstOrFail()

    return asset
  }

  // POST create a new asset (admin only)
  async store({ request, auth }: HttpContext) {
    await auth.authenticate()

    const data = request.only([
      'title',
      'slug',
      'description',
      'coverImage',
      'screenshots',
      'trailerUrl',
      'type',
      'status',
      'platforms',
      'releaseDate',
      'links',
      'published',
    ])

    const asset = await Asset.create(data)
    return asset
  }

  // PUT update an existing asset (admin only)
  async update({ params, request, auth }: HttpContext) {
    await auth.authenticate()

    const asset = await Asset.findOrFail(params.id)

    const data = request.only([
      'title',
      'slug',
      'description',
      'coverImage',
      'screenshots',
      'trailerUrl',
      'type',
      'status',
      'platforms',
      'releaseDate',
      'links',
      'published',
    ])

    asset.merge(data)
    await asset.save()

    return asset
  }

  // DELETE an asset (admin only)
  async destroy({ params, auth }: HttpContext) {
    await auth.authenticate()

    const asset = await Asset.findOrFail(params.id)
    await asset.delete()

    return { message: 'Asset deleted successfully' }
  }
}
