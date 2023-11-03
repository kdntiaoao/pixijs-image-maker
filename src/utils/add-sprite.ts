import { Application, Sprite, Texture } from 'pixi.js'

export const addSprite = (app: Application, texture: Texture): { sprite: Sprite; destroy: () => void } => {
  const sprite = new Sprite(texture)
  const spriteAspectRatio = sprite.width / sprite.height

  const destroy = (): void => {
    app.stage.removeChild(sprite)
    sprite.destroy()
  }

  sprite.eventMode = 'static'
  sprite.cursor = 'pointer'

  sprite.width = app.screen.width / 8
  sprite.height = sprite.width / spriteAspectRatio

  sprite.x = app.renderer.width / 2
  sprite.y = app.renderer.height / 2

  sprite.anchor.x = 0.5
  sprite.anchor.y = 0.5

  app.stage.addChild(sprite)

  return { sprite, destroy }
}
