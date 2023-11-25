import { OBJECT_IMAGES } from '../assets/data'

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
