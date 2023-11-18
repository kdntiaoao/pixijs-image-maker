import { Application } from 'pixi.js'

const canvasWidth = 1200
const canvasAspectRatio = 1200 / 630
const canvasHeight = canvasWidth / canvasAspectRatio

export const initApp = (canvasElement: HTMLCanvasElement): { app: Application } => {
  const app = new Application({
    view: canvasElement,
    width: canvasWidth,
    height: canvasHeight,
    autoDensity: true,
    powerPreference: 'high-performance',
    backgroundColor: 0xffffff,
    preserveDrawingBuffer: true,
  })

  app.stage.eventMode = 'static'
  app.stage.hitArea = app.screen
  app.stage.sortableChildren = true

  return { app }
}
