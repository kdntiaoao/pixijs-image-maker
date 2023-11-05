import { Application, Assets, FederatedPointerEvent } from 'pixi.js'
import { CustomSprite, addSprite } from './utils/add-sprite'
import { resizeImage } from './utils/resize-image'
import { getXShareUrl } from './utils/get-x-share-url'
import cupImage from '@/assets/images/cup.png'
import dogImage from '@/assets/images/dog.png'
import cherryBlossomImage from '@/assets/images/cherry-blossom.png'
import doveImage from '@/assets/images/dove.png'
import kettleImage from '@/assets/images/kettle.png'
import potImage from '@/assets/images/pot.png'
import './style.css'

type AddCupReturnType = Promise<{
  cup: CustomSprite
  destroy: () => void
}>

const canvasElement = document.getElementById('canvas') as HTMLCanvasElement
const shareButtonElement = document.querySelector('[data-button="share"]') as HTMLButtonElement
const downloadButtonElement = document.querySelector('[data-button="download"]') as HTMLButtonElement
const messageElement = document.querySelector('[data-message]') as HTMLParagraphElement
const dogButtonElement = document.querySelector('[data-button="dog"]') as HTMLButtonElement
const cherryBlossomButtonElement = document.querySelector('[data-button="cherry-blossom"]') as HTMLButtonElement
const cupButtonElement = document.querySelector('[data-button="cup"]') as HTMLButtonElement
const doveButtonElement = document.querySelector('[data-button="dove"]') as HTMLButtonElement
const kettleButtonElement = document.querySelector('[data-button="kettle"]') as HTMLButtonElement
const potButtonElement = document.querySelector('[data-button="pot"]') as HTMLButtonElement
const upwardButtonElement = document.querySelector('[data-button="upward"]') as HTMLButtonElement
const downwardButtonElement = document.querySelector('[data-button="downward"]') as HTMLButtonElement
const leftButtonElement = document.querySelector('[data-button="left"]') as HTMLButtonElement
const rightButtonElement = document.querySelector('[data-button="right"]') as HTMLButtonElement
const zoomInButtonElement = document.querySelector('[data-button="zoom-in"]') as HTMLButtonElement
const zoomOutButtonElement = document.querySelector('[data-button="zoom-out"]') as HTMLButtonElement
const rotateButtonElement = document.querySelector('[data-button="rotate"]') as HTMLButtonElement
const deleteButtonElement = document.querySelector('[data-button="delete"]') as HTMLButtonElement

let draggedSprite: CustomSprite | null = null
let selectedSprite: CustomSprite | null = null

const addCup = async (app: Application): AddCupReturnType => {
  const texture = await Assets.load(cupImage)
  const { sprite, destroy } = addSprite(app, texture)

  return { cup: sprite, destroy }
}

const canvasWidth = 1200
const canvasAspectRatio = 1200 / 630
const canvasHeight = canvasWidth / canvasAspectRatio

const app = new Application({
  view: canvasElement,
  width: canvasWidth,
  height: canvasHeight,
  autoDensity: true,
  powerPreference: 'high-performance',
  backgroundColor: 0x99ccff,
  preserveDrawingBuffer: true,
})

const onDragMove = (event: FederatedPointerEvent) => {
  if (draggedSprite) {
    draggedSprite.parent.toLocal(event.global, undefined, draggedSprite.position)
  }
}

const onDragStart = (sprite: CustomSprite) => {
  if (selectedSprite) {
    selectedSprite.alpha = 1
  }
  sprite.alpha = 0.5
  draggedSprite = selectedSprite = sprite
  app.stage.on('pointermove', onDragMove)
}

const onDragEnd = () => {
  if (draggedSprite) {
    app.stage.off('pointermove', onDragMove)
    draggedSprite = null
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

shareButtonElement.addEventListener('click', async () => {
  if (selectedSprite) {
    selectedSprite.alpha = 1
  }

  messageElement.textContent = '画像を生成しています...'

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
    messageElement.textContent = '画像の生成に失敗しました'
    throw new Error('Network response was not ok')
  }

  const json = (await res.json()) as { message: string; image?: string; link?: string }
  console.log(json)

  if (json.link) {
    messageElement.textContent = '画像を生成しました！'
    const text = ['PixiJSで作った画像をXでシェアする', '', json.link]
    window.open(getXShareUrl(text))
  }
})

downloadButtonElement.addEventListener('click', () => {
  if (selectedSprite) {
    selectedSprite.alpha = 1
  }

  const dataURL = canvasElement.toDataURL()
  const dataURL2 = canvasElement.toDataURL('image/jpeg', 0.5)

  console.log({
    dataURL: new Blob([dataURL]).size / 1000 + 'kB',
    dataURL2: new Blob([dataURL2]).size / 1000 + 'kB',
  })

  const a = document.createElement('a')
  a.href = dataURL2
  a.download = 'pixijs-image.jpg'
  a.click()
})

dogButtonElement.addEventListener('click', async () => {
  const texture = await Assets.load(dogImage)
  const { sprite } = addSprite(app, texture)
  sprite.x = app.screen.width / 2
  sprite.y = app.screen.height / 2
  sprite.on('pointerdown', () => onDragStart(sprite))
})
cherryBlossomButtonElement.addEventListener('click', async () => {
  const texture = await Assets.load(cherryBlossomImage)
  const { sprite } = addSprite(app, texture)
  sprite.x = app.screen.width / 2
  sprite.y = app.screen.height / 2
  sprite.on('pointerdown', () => onDragStart(sprite))
})
cupButtonElement.addEventListener('click', async () => {
  const texture = await Assets.load(cupImage)
  const { sprite } = addSprite(app, texture)
  sprite.x = app.screen.width / 2
  sprite.y = app.screen.height / 2
  sprite.on('pointerdown', () => onDragStart(sprite))
})

doveButtonElement.addEventListener('click', async () => {
  const texture = await Assets.load(doveImage)
  const { sprite } = addSprite(app, texture)
  sprite.x = app.screen.width / 2
  sprite.y = app.screen.height / 2
  sprite.on('pointerdown', () => onDragStart(sprite))
})

kettleButtonElement.addEventListener('click', async () => {
  const texture = await Assets.load(kettleImage)
  const { sprite } = addSprite(app, texture)
  sprite.x = app.screen.width / 2
  sprite.y = app.screen.height / 2
  sprite.on('pointerdown', () => onDragStart(sprite))
})

potButtonElement.addEventListener('click', async () => {
  const texture = await Assets.load(potImage)
  const { sprite } = addSprite(app, texture)
  sprite.x = app.screen.width / 2
  sprite.y = app.screen.height / 2
  sprite.on('pointerdown', () => onDragStart(sprite))
})

upwardButtonElement.addEventListener('click', () => {
  if (selectedSprite) {
    selectedSprite.y -= 10
  }
})

downwardButtonElement.addEventListener('click', () => {
  if (selectedSprite) {
    selectedSprite.y += 10
  }
})

leftButtonElement.addEventListener('click', () => {
  if (selectedSprite) {
    selectedSprite.x -= 10
  }
})

rightButtonElement.addEventListener('click', () => {
  if (selectedSprite) {
    selectedSprite.x += 10
  }
})

zoomInButtonElement.addEventListener('click', () => {
  if (selectedSprite) {
    selectedSprite.scale.x *= 1.1
    selectedSprite.scale.y *= 1.1
  }
})

zoomOutButtonElement.addEventListener('click', () => {
  if (selectedSprite) {
    selectedSprite.scale.x /= 1.1
    selectedSprite.scale.y /= 1.1
  }
})

rotateButtonElement.addEventListener('click', () => {
  if (selectedSprite) {
    selectedSprite.rotation += Math.PI / 10
  }
})

deleteButtonElement.addEventListener('click', () => {
  if (selectedSprite) {
    selectedSprite.destroySprite?.()
    selectedSprite = null
  }
})
