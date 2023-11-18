import { Application, Container, DisplayObject, Sprite, Text, Texture } from 'pixi.js'

export const addObject = (app: Application, objectsContainer: Container, object: DisplayObject): void => {
  object.eventMode = 'static'
  object.cursor = 'pointer'

  const extraX = Math.random() * 100 - 50
  const extraY = Math.random() * 100 - 50

  object.x = app.screen.width / 2 + extraX
  object.y = app.screen.height / 2 + extraY
  object.alpha = 0.5

  objectsContainer.addChild(object)
}

export const addSprite = (app: Application, objectsContainer: Container, texture: Texture): { sprite: Sprite } => {
  const sprite = new Sprite(texture)
  const spriteAspectRatio = sprite.width / sprite.height

  addObject(app, objectsContainer, sprite)

  sprite.width = app.screen.width / 8
  sprite.height = sprite.width / spriteAspectRatio
  sprite.anchor.x = 0.5
  sprite.anchor.y = 0.5

  return { sprite }
}

export const addText = (app: Application, objectsContainer: Container, text: string): { textObject: Text } => {
  const textObject = new Text(text, {
    fontFamily: 'DotGothic16',
    fontSize: 48,
    fill: 0x000000,
    align: 'center',
  })

  addObject(app, objectsContainer, textObject)

  textObject.anchor.x = 0.5
  textObject.anchor.y = 0.5

  return { textObject }
}

export const addBackground = (app: Application, texture: Texture): { bgObject: Sprite } => {
  const appWidth = app.screen.width
  const appHeight = app.screen.height
  const bgObject = new Sprite(texture)
  const backgroundAspectRatio = bgObject.width / bgObject.height

  bgObject.width = Math.max(appWidth, appHeight * backgroundAspectRatio)
  bgObject.height = bgObject.width / backgroundAspectRatio
  bgObject.x = appWidth / 2
  bgObject.y = appHeight / 2
  bgObject.anchor.x = 0.5
  bgObject.anchor.y = 0.5
  bgObject.zIndex = -1

  app.stage.addChild(bgObject)

  return { bgObject }
}
