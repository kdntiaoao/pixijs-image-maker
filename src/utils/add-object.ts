import { Application, Container, DisplayObject, Sprite, Text, Texture } from 'pixi.js'

export const addObject = (app: Application, objectsContainer: Container, object: DisplayObject): Container => {
  const objectContainer = new Container()
  objectContainer.sortableChildren = true
  objectContainer.addChild(object)
  objectsContainer.addChild(objectContainer)

  objectContainer.eventMode = 'static'
  objectContainer.cursor = 'pointer'

  const extraX = Math.random() * 100 - 50
  const extraY = Math.random() * 100 - 50

  objectContainer.x = app.screen.width / 2 + extraX
  objectContainer.y = app.screen.height / 2 + extraY

  return objectContainer
}

export const addSprite = (
  app: Application,
  objectsContainer: Container,
  texture: Texture
): { spriteContainer: Container } => {
  const sprite = new Sprite(texture)
  const spriteAspectRatio = sprite.width / sprite.height

  const objectContainer = addObject(app, objectsContainer, sprite)

  sprite.width = app.screen.width / 8
  sprite.height = sprite.width / spriteAspectRatio
  sprite.anchor.x = 0.5
  sprite.anchor.y = 0.5

  return { spriteContainer: objectContainer }
}

export const addText = (app: Application, objectsContainer: Container, text: string): { textContainer: Container } => {
  const textObject = new Text(text, {
    fontFamily: 'DotGothic16',
    fontSize: 50,
    fill: 0x000000,
    align: 'center',
  })

  textObject.anchor.x = 0.5
  textObject.anchor.y = 0.5
  textObject.style.padding = textObject.height / 2

  const objectContainer = addObject(app, objectsContainer, textObject)

  return { textContainer: objectContainer }
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
