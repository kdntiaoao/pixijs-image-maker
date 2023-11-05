import { Application, Assets, FederatedPointerEvent } from 'pixi.js'

import { type CustomSprite, addSprite, download, share, sleep } from './utils'

import cupImage from '@/assets/images/cup.png'
import dogImage from '@/assets/images/dog.png'
import cherryBlossomImage from '@/assets/images/cherry-blossom.png'
import doveImage from '@/assets/images/dove.png'
import kettleImage from '@/assets/images/kettle.png'
import potImage from '@/assets/images/pot.png'

import './style.css'

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
    .map((_) => Assets.load(cupImage).then((texture) => addSprite(app, texture)))
).then((cups) => {
  cups.forEach(({ sprite }, i) => {
    sprite.x =
      (((app.screen.width * i) / (cups.length - 1)) * (app.screen.width - sprite.width)) / app.screen.width +
      sprite.width / 2
    sprite.y =
      (((app.screen.height * i) / (cups.length - 1)) * (app.screen.height - sprite.height)) / app.screen.height +
      sprite.height / 2
    sprite.on('pointerdown', () => onDragStart(sprite))
  })
})

shareButtonElement.addEventListener('click', async () => {
  if (selectedSprite) {
    selectedSprite.alpha = 1
  } else {
    console.log('No selected sprite')
  }

  messageElement.textContent = '画像を生成しています...'

  // 選択されていたSpriteのalphaを1に戻すのを待つ
  await sleep(100)

  try {
    await share(canvasElement)
    messageElement.textContent = '画像を生成しました！'
  } catch (error) {
    messageElement.textContent = '画像の生成に失敗しました'
  }
})

downloadButtonElement.addEventListener('click', async () => {
  if (selectedSprite) {
    selectedSprite.alpha = 1
  } else {
    console.log('No selected sprite')
  }

  // 選択されていたSpriteのalphaを1に戻すのを待つ
  await sleep(100)

  download(canvasElement)
})

//
;[
  { element: dogButtonElement, image: dogImage },
  { element: cherryBlossomButtonElement, image: cherryBlossomImage },
  { element: cupButtonElement, image: cupImage },
  { element: doveButtonElement, image: doveImage },
  { element: kettleButtonElement, image: kettleImage },
  { element: potButtonElement, image: potImage },
].forEach(({ element, image }) => {
  element.addEventListener('click', async () => {
    if (selectedSprite) {
      selectedSprite.alpha = 1
    }

    const texture = await Assets.load(image)
    const { sprite } = addSprite(app, texture)
    sprite.x = app.screen.width / 2
    sprite.y = app.screen.height / 2
    sprite.alpha = 0.5
    sprite.on('pointerdown', () => onDragStart(sprite))
    selectedSprite = sprite
  })
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
