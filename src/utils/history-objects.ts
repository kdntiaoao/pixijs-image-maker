import { Application, Assets, Container, DisplayObject, Sprite, Text } from 'pixi.js'

import { HistoryData } from '../types'
import { addSprite, addText, strictEntries } from '.'
import { OBJECT_IMAGES } from '../assets/data'

const roundWithDigits = (dirtyNum: string | number, digits: number = 0): number => {
  const num = parseFloat(dirtyNum.toString())
  return Number(num.toFixed(digits))
}

export const convertHistoryDataList = (objects: DisplayObject[]): HistoryData[] => {
  return objects
    .map((container) => {
      const child = container.children?.[0]
      if (!child) {
        console.log('No child')
        return
      }
      if (child instanceof Text) {
        return [
          'text',
          // localStorageに保存するデータ容量を減らすため、小数点以下の桁数を減らす
          roundWithDigits(container.x, 1),
          roundWithDigits(container.y, 1),
          roundWithDigits(container.rotation, 3),
          child.text,
          roundWithDigits(child.style.fontSize, 2),
        ]
      }
      if (child instanceof Sprite) {
        const imgKey = strictEntries(OBJECT_IMAGES).find(
          ([, imgData]) => imgData.img === child.texture.textureCacheIds[0]
        )?.[0]
        if (!imgKey) return
        return [
          'img',
          roundWithDigits(container.x, 1),
          roundWithDigits(container.y, 1),
          roundWithDigits(container.rotation, 3),
          imgKey,
          roundWithDigits(child.width, 1),
        ]
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
      console.log('historyData[4]', historyData[4])
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
