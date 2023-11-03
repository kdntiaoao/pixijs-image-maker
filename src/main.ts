import { Application, Sprite, Assets, FederatedPointerEvent } from 'pixi.js'
import { addSprite } from './utils/add-sprite'
import { resizeImage } from './utils/resize-image'
import { getXShareUrl } from './utils/get-x-share-url'
import cupImage from '@/assets/images/cup.png'
import './style.css'

type AddCupReturnType = Promise<{
  cup: Sprite
  destroy: () => void
}>

const canvasElement = document.getElementById('canvas') as HTMLCanvasElement
const buttonElement = document.querySelector('.button') as HTMLButtonElement

let dragTarget: Sprite | null = null

const addCup = async (app: Application): AddCupReturnType => {
  const texture = await Assets.load(cupImage)
  const { sprite, destroy } = addSprite(app, texture)

  return { cup: sprite, destroy }
}

const canvasWidth = Math.min(window.innerWidth * 0.8, 1200)
const canvasHeight = (canvasWidth * 630) / 1200
const resizeRatio = window.devicePixelRatio || 1

const app = new Application({
  view: canvasElement,
  width: canvasWidth,
  height: canvasHeight,
  autoDensity: true,
  resolution: resizeRatio,
  // powerPreference: 'high-performance',
  backgroundColor: 0x1099bb,
  preserveDrawingBuffer: true,
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
      (((app.screen.width * i) / (cups.length - 1)) * (app.screen.width - cup.width)) / app.screen.width + cup.width / 2
    cup.y =
      (((app.screen.height * i) / (cups.length - 1)) * (app.screen.height - cup.height)) / app.screen.height +
      cup.height / 2
    cup.on('pointerdown', () => onDragStart(cup))
  })
})

buttonElement.addEventListener('click', async () => {
  const dataURL = canvasElement.toDataURL()
  const dataURL2 = canvasElement.toDataURL('image/jpeg', 0.5)
  const canvasAspectRatio = canvasElement.width / canvasElement.height
  const dataURL3 = await resizeImage(dataURL2, canvasAspectRatio, 300)

  console.log({
    dataURL: new Blob([dataURL]).size / 1000 + 'kB',
    dataURL2: new Blob([dataURL2]).size / 1000 + 'kB',
    dataURL3: new Blob([dataURL3]).size / 1000 + 'kB',
  })

  const apiEndpoint = 'https://27bfwxzjpj7jyk2hthonyyerru0wryet.lambda-url.ap-northeast-1.on.aws/'

  const res = await fetch(apiEndpoint, {
    method: 'POST',
    body: JSON.stringify({ imageData: dataURL2 }),
  })

  if (!res.ok) {
    throw new Error('Network response was not ok')
  }

  const json = (await res.json()) as { message: string; image?: string; link?: string }
  console.log(json)

  if (json.link) {
    const text = ['PixiJSで作った画像をXでシェアする', '', json.link]
    window.open(getXShareUrl(text))
  }
})
