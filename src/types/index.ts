import { OBJECT_IMAGES } from '../assets/data'

type ObjectX = number
type ObjectY = number
type ObjectRotation = number
type TextValue = string
type TextFontSize = number
type ImgKey = keyof typeof OBJECT_IMAGES
type ImgWidth = number

export type HistoryData =
  | ['text', ObjectX, ObjectY, ObjectRotation, TextValue, TextFontSize]
  | ['img', ObjectX, ObjectY, ObjectRotation, ImgKey, ImgWidth]

export type HistoryObject =
  | {
      text: string
      x: number
      y: number
      rotation: number
      fontSize: number
    }
  | {
      img: ImgKey
      x: number
      y: number
      rotation: number
      width: number
    }
