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

/**
 * { text: <text>, fontSize: <fontSize>, x: <x>, y: <y>, rotation: <rotation> }
 */
export type HistoryObject =
  | {
      text: string
      fontSize: number
      x: number
      y: number
      rotation: number
    }
  | {
      img: keyof typeof OBJECT_IMAGES
      x: number
      y: number
      width: number
      rotation: number
    }
