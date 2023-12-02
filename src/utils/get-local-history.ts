import { BG_IMAGES } from '../assets/data'
import { HistoryData } from '../types'

export const getLocalHistory = () => {
  const rawHistory: unknown = JSON.parse(window.localStorage.getItem('history') || 'null')
  const historyDataList: HistoryData[] = Array.isArray(rawHistory) ? rawHistory : []
  const bg = window.localStorage.getItem('bg') || Object.keys(BG_IMAGES)[0]
  return { historyDataList, bg }
}
