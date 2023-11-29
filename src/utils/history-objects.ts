import { Application, Assets, Container, DisplayObject, Sprite, Text } from 'pixi.js'

import { HistoryData, HistoryObject } from '../types'
import { addSprite, addText, strictEntries } from '.'
import { OBJECT_IMAGES } from '../assets/data'

const roundWithDigits = (dirtyNum: string | number, digits: number = 0): number => {
  const num = parseFloat(dirtyNum.toString())
  return Number(num.toFixed(digits))
}

export const getHistoryObjects = (objects: DisplayObject[]): HistoryObject[] => {
  return objects
    .map((container) => {
      const child = container.children?.[0]
      if (!child) {
        console.log('No child')
        return
      }
      if (child instanceof Text) {
        return {
          text: child.text,
          x: roundWithDigits(container.x, 2),
          y: roundWithDigits(container.y, 2),
          rotation: roundWithDigits(container.rotation, 3),
          fontSize: roundWithDigits(child.style.fontSize, 2),
        }
      }
      if (child instanceof Sprite) {
        const imgKey = strictEntries(OBJECT_IMAGES).find(
          ([, imgData]) => imgData.img === child.texture.textureCacheIds[0]
        )?.[0]
        if (!imgKey) return
        return {
          img: imgKey,
          x: roundWithDigits(container.x, 2),
          y: roundWithDigits(container.y, 2),
          rotation: roundWithDigits(container.rotation, 3),
          width: roundWithDigits(child.width, 2),
        }
      }
      return
    })
    .filter((x): x is HistoryObject => !!x)
}

export const convertHistoryDataList = (objects: DisplayObject[]): HistoryData[] => {
  const historyObjects = getHistoryObjects(objects)
  return historyObjects
    .map((historyObject) => {
      if ('text' in historyObject) {
        return [
          'text',
          historyObject.x,
          historyObject.y,
          historyObject.rotation,
          historyObject.text,
          historyObject.fontSize,
        ]
      }
      if ('img' in historyObject) {
        return ['img', historyObject.x, historyObject.y, historyObject.rotation, historyObject.img, historyObject.width]
      }
      return
    })
    .filter((x): x is HistoryData => !!x)
}

export const restoreHistoryDataList = async (
  historyDataList: HistoryData[],
  app: Application,
  objectsContainer: Container,
  additionalInitObject?: (container: Container) => void
) => {
  for await (const historyData of historyDataList) {
    let container: Container | null = null

    if (historyData[0] === 'text') {
      container = addText(app, objectsContainer, historyData[4]).textContainer

      const textObject = container.children[0]
      if (textObject instanceof Text) {
        textObject.style.fontSize = historyData[5]
        textObject.style.padding = textObject.height / 2
      }
    } else if (historyData[0] === 'img') {
      const texture = await Assets.load(OBJECT_IMAGES[historyData[4]].img)
      container = addSprite(app, objectsContainer, texture).spriteContainer

      const spriteObject = container.children[0]
      if (spriteObject instanceof Sprite) {
        const spriteAspectRatio = spriteObject.width / spriteObject.height
        spriteObject.width = historyData[5]
        spriteObject.height = historyData[5] / spriteAspectRatio
      }
    }

    if (!container) {
      console.log('Invalid container')
      continue
    }

    container.x = historyData[1]
    container.y = historyData[2]
    container.rotation = historyData[3]
    additionalInitObject?.(container)
  }
}
