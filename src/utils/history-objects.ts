import { Application, Assets, Container, DisplayObject, Sprite, Text } from 'pixi.js'

import { type HistoryObject } from '../types'
import { addSprite, addText, strictEntries } from '.'
import { OBJECT_IMAGES } from '../assets/data'

const roundWithDigits = (dirtyNum: string | number, digits: number = 0): number => {
  const num = parseFloat(dirtyNum.toString())
  return Number(num.toFixed(digits))
}

export const convertHistoryObjects = (objects: DisplayObject[]): HistoryObject[] => {
  return objects
    .map((container) => {
      const child = container.children?.[0]
      if (!child) {
        console.log('No child')
        return
      }
      if (child instanceof Text) {
        const object: HistoryObject = {
          text: child.text,
          fontSize: roundWithDigits(child.style.fontSize, 2),
          x: roundWithDigits(container.x, 2),
          y: roundWithDigits(container.y, 2),
          rotation: roundWithDigits(container.rotation, 3),
        }
        return object
      }
      if (child instanceof Sprite) {
        const imgKey = strictEntries(OBJECT_IMAGES).find(
          ([, imgData]) => imgData.img === child.texture.textureCacheIds[0]
        )?.[0]
        if (!imgKey) return
        const object: HistoryObject = {
          img: imgKey,
          x: roundWithDigits(container.x, 2),
          y: roundWithDigits(container.y, 2),
          width: roundWithDigits(child.width, 2),
          rotation: roundWithDigits(container.rotation, 3),
        }
        return object
      }
      return
    })
    .filter((x): x is HistoryObject => !!x)
}

export const restoreHistoryObjects = async (
  historyObjects: HistoryObject[],
  app: Application,
  objectsContainer: Container,
  additionalInitObject?: (container: Container) => void
) => {
  for await (const historyObject of historyObjects) {
    if (!('text' in historyObject) && !('img' in historyObject)) {
      console.log('Invalid history object')
      continue
    }

    let container: Container | null = null

    if ('text' in historyObject) {
      container = addText(app, objectsContainer, historyObject.text).textContainer

      const textObject = container.children[0]
      if (textObject instanceof Text) {
        textObject.style.fontSize = historyObject.fontSize
        textObject.style.padding = textObject.height / 2
      }
    } else if ('img' in historyObject) {
      const texture = await Assets.load(OBJECT_IMAGES[historyObject.img].img)
      container = addSprite(app, objectsContainer, texture).spriteContainer

      const spriteObject = container.children[0]
      if (spriteObject instanceof Sprite) {
        const spriteAspectRatio = spriteObject.width / spriteObject.height
        spriteObject.width = historyObject.width
        spriteObject.height = historyObject.width / spriteAspectRatio
      }
    }

    if (!container) {
      console.log('Invalid container')
      continue
    }

    container.x = historyObject.x
    container.y = historyObject.y
    container.rotation = historyObject.rotation
    additionalInitObject?.(container)
  }
}
