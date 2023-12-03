import { type HistoryData } from './types'
import { restoreHistoryDataList, initializeApp, arrayIncludes, getLocalHistory } from './utils'
import { BG_IMAGES } from './assets/data'

import './style.css'

const S3_ASSETS_URL = import.meta.env.VITE_S3_ASSETS_URL

const { pixiApp, objectsContainer, setBg, onDragStart, loadingElement, loadingCharElements } = initializeApp()

// 履歴を読み込む
;(async function () {
  const query = new URLSearchParams(location.search)
  const key = query.get('key')

  let historyDataList: HistoryData[] = []
  let bg: string | undefined = undefined

  if (key) {
    try {
      const res = await fetch(`${S3_ASSETS_URL}/${key}.json`)

      if (!res.ok) {
        throw new Error('Network response was not ok')
      }

      const json = (await res.json()) as { history: HistoryData[]; bg: string }
      historyDataList = json.history

      bg = json.bg
    } catch (error) {
      const { historyDataList: historyDataList2, bg: bg2 } = getLocalHistory()
      historyDataList = historyDataList2
      bg = bg2
    }
  } else {
    const { historyDataList: historyDataList2, bg: bg2 } = getLocalHistory()
    historyDataList = historyDataList2
    bg = bg2
  }

  await restoreHistoryDataList(historyDataList, pixiApp, objectsContainer, (container) => {
    container.on('pointerdown', onDragStart)
  })

  const keys = Object.keys(BG_IMAGES) as (keyof typeof BG_IMAGES)[]
  const defaultBg = keys[0]
  const bg2 = arrayIncludes(keys, bg) ? bg : defaultBg
  setBg(bg2)
})()

{
  // ローディングテキストをアニメーションさせる
  const charLength = loadingCharElements.length
  const duration = (charLength + 1) / 5
  loadingCharElements.forEach((charElement, i) => {
    charElement.style.setProperty('--duration', `${duration}s`)
    charElement.style.setProperty('--delay', `${i / 5}s`)
  })
}

window.addEventListener('load', () => {
  loadingElement.style.display = 'none'
})
