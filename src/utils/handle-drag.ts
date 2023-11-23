import { DisplayObject, FederatedPointerEvent } from 'pixi.js'

export const handleDragMove = (
  event: FederatedPointerEvent,
  object: DisplayObject,
  diff: { x: number; y: number } = { x: 0, y: 0 }
) => {
  const position = event.global.clone()
  position.x -= diff.x
  position.y -= diff.y
  object.parent.toLocal(position, undefined, object.position)
}
