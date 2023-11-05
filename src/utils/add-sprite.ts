import { Application, Sprite, Texture } from 'pixi.js'

export type CustomSprite = Sprite & {
  destroySprite?: () => void
}

export const addSprite = (app: Application, texture: Texture): { sprite: CustomSprite; destroy: () => void } => {
  const sprite = new Sprite(texture) as CustomSprite
  const spriteAspectRatio = sprite.width / sprite.height

  const destroy = (): void => {
    app.stage.removeChild(sprite)
    sprite.destroy()
    console.log('Destroyed sprite')
  }

  sprite.eventMode = 'static'
  sprite.cursor = 'pointer'

  sprite.width = app.screen.width / 8
  sprite.height = sprite.width / spriteAspectRatio

  sprite.x = app.renderer.width / 2
  sprite.y = app.renderer.height / 2

  sprite.anchor.x = 0.5
  sprite.anchor.y = 0.5

  sprite.destroySprite = destroy

  app.stage.addChild(sprite)

  console.log('Added sprite')

  return { sprite, destroy }
}
