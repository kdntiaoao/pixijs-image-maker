import { Application, Container, FederatedPointerEvent } from 'pixi.js'

let draggedObject: Container | null = null
let draggedDiff: { x: number; y: number } = { x: 0, y: 0 }

/**
 * ドラッグ移動イベントを処理する。
 * @param {FederatedPointerEvent} event - フェデレーションポインターイベント
 */
export const handleDragMove = (event: FederatedPointerEvent) => {
  if (draggedObject) {
    const position = event.global.clone()
    position.x -= draggedDiff.x
    position.y -= draggedDiff.y
    draggedObject.parent.toLocal(position, undefined, draggedObject.position)
  }
}

/**
 * オブジェクトのドラッグ開始イベントを処理する。
 * @param {FederatedPointerEvent} event - ドラッグ開始イベント
 */
export const handleDragStart = (
  event: FederatedPointerEvent,
  app: Application,
  callback?: (target: Container) => void
) => {
  const target = event.target
  if (!(target instanceof Container)) {
    console.log('Invalid target')
    return
  }
  event.stopPropagation()
  draggedObject = target
  draggedDiff = { x: event.global.x - target.x, y: event.global.y - target.y }
  app.stage.on('pointermove', handleDragMove)
  // selectObject(target)
  callback?.(target)
}

/**
 * ドラッグ操作が終了したときに呼び出されるコールバック関数。
 */
export const handleDragEnd = (app: Application) => {
  app.stage.off('pointermove', handleDragMove)
  draggedObject = null
}
