import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Asset extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare slug: string

  @column()
  declare description: string

  @column()
  declare coverImage: string | null

  @column()
  declare screenshots: string[]

  @column()
  declare trailerUrl: string | null

  @column()
  declare type: 'animation' | 'game' | 'tool' | 'tabletop' | 'article' | 'other'

  @column()
  declare status: 'in-development' | 'demo' | 'early-access' | 'released'

  @column()
  declare platforms: string[] // e.g., ['PC', 'Xbox', 'PlayStation']

  @column.dateTime()
  declare releaseDate: DateTime | null

  @column()
  declare links: {
    steam?: string
    itch?: string
    website?: string
    discord?: string
  }

  @column()
  declare published: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
