import { Application, Sprite, Assets, FederatedPointerEvent } from 'pixi.js'
import cupImage from '@/assets/images/cup.png'
import './style.css'
import { addSprite } from './utils/add-sprite'

type AddCupReturnType = Promise<{
  cup: Sprite
  destroy: () => void
}>

let dragTarget: Sprite | null = null

const addCup = async (app: Application): AddCupReturnType => {
  const texture = await Assets.load(cupImage)
  const { sprite, destroy } = addSprite(app, texture)

  return { cup: sprite, destroy }
}

const app = new Application({
  view: document.querySelector('#canvas') as HTMLCanvasElement,
  width: 800,
  height: 600,
  // autoDensity: true,
  // resizeTo: window,
  // powerPreference: 'high-performance',
  backgroundColor: 0x1099bb,
})

const onDragMove = (event: FederatedPointerEvent) => {
  if (dragTarget) {
    dragTarget.parent.toLocal(event.global, undefined, dragTarget.position)
  }
}

const onDragStart = (sprite: Sprite) => {
  sprite.alpha = 0.5
  dragTarget = sprite
  app.stage.on('pointermove', onDragMove)
}

const onDragEnd = () => {
  if (dragTarget) {
    app.stage.off('pointermove', onDragMove)
    dragTarget.alpha = 1
    dragTarget = null
  }
}

app.stage.eventMode = 'static'
app.stage.hitArea = app.screen
app.stage.on('pointerup', onDragEnd)
app.stage.on('pointerupoutside', onDragEnd)

Promise.all(
  Array(5)
    .fill(null)
    .map((_) => addCup(app))
).then((cups) => {
  cups.forEach(({ cup }, i) => {
    cup.x =
      (((app.renderer.width * i) / (cups.length - 1)) * (app.renderer.width - cup.width)) / app.renderer.width +
      cup.width / 2
    cup.y =
      (((app.renderer.height * i) / (cups.length - 1)) * (app.renderer.height - cup.height)) / app.renderer.height +
      cup.height / 2
    cup.on('pointerdown', () => onDragStart(cup))
  })
})

// app.stage.removeChild(cup)
// cup.destroy()
