import { HistoryData } from '../types'
import { getXShareUrl } from './get-x-share-url'

export const share = async (
  canvasElement: HTMLCanvasElement,
  historyDataList: HistoryData[],
  bg: string
): Promise<void> => {
  const dataURL = canvasElement.toDataURL('image/jpeg', 0.5)

  console.log('X Share:', {
    size: new Blob([dataURL]).size / 1000 + 'kB',
  })

  const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT

  const res = await fetch(API_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify({ imageData: dataURL, history: historyDataList, bg }),
  })

  if (!res.ok) {
    throw new Error('Network response was not ok')
  }

  const json = (await res.json()) as { message: string; image?: string; link?: string }
  console.log('Response:', json)

  if (json.link) {
    const text = ['PixiJSで作った画像をXでシェアする', '', json.link]
    if (!window.open(getXShareUrl(text))) {
      location.href = getXShareUrl(text)
    }
  } else {
    throw new Error('No link')
  }
}
