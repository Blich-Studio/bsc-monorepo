import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Studio extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare description: string

  @column()
  declare logo: string | null

  @column()
  declare foundedYear: number

  @column()
  declare teamMembers: Array<{
    name: string
    role: string
    bio?: string
    avatar?: string
  }>

  @column()
  declare socialLinks: {
    x?: string
    facebook?: string
    linkedin?: string
    itch?: string
    instagram?: string
    youtube?: string
    twitch?: string
    discord?: string
  }

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
