import { Application, Assets, FederatedPointerEvent, Sprite, Text } from 'pixi.js'

import { type CustomObject, addSprite, download, share, sleep, addText, addBackground } from './utils'

import cupImage from '@/assets/images/cup.png'
import dogImage from '@/assets/images/dog.png'
import cherryBlossomImage from '@/assets/images/cherry-blossom.png'
import doveImage from '@/assets/images/dove.png'
import kettleImage from '@/assets/images/kettle.png'
import potImage from '@/assets/images/pot.png'
import bg01Image from '@/assets/images/bg01.jpg'
import bg02Image from '@/assets/images/bg02.jpg'
import bg03Image from '@/assets/images/bg03.jpg'

import './style.css'

const BG_IMAGES = {
  bg01: bg01Image,
  bg02: bg02Image,
  bg03: bg03Image,
}

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
const addTextFormElement = document.querySelector('[data-form="add-text"]') as HTMLFormElement
const textFieldElement = document.querySelector('[data-text-field]') as HTMLInputElement
const selectBgRadioElements = document.querySelectorAll('[data-radio="select-bg"]') as NodeListOf<HTMLInputElement>

let draggedObject: CustomObject | null = null
let selectedObject: CustomObject | null = null
let selectedBg: Sprite | null = null

const canvasWidth = 1200
const canvasAspectRatio = 1200 / 630
const canvasHeight = canvasWidth / canvasAspectRatio

const app = new Application({
  view: canvasElement,
  width: canvasWidth,
  height: canvasHeight,
  autoDensity: true,
  powerPreference: 'high-performance',
  backgroundColor: 0xffffff,
  preserveDrawingBuffer: true,
})

const onDragMove = (event: FederatedPointerEvent) => {
  if (draggedObject) {
    draggedObject.parent.toLocal(event.global, undefined, draggedObject.position)
  }
}

const onDragStart = (sprite: CustomObject) => {
  if (selectedObject) {
    selectedObject.alpha = 1
  }
  sprite.alpha = 0.5
  draggedObject = selectedObject = sprite
  app.stage.on('pointermove', onDragMove)
}

const onDragEnd = () => {
  if (draggedObject) {
    app.stage.off('pointermove', onDragMove)
    draggedObject = null
  }
}

app.stage.eventMode = 'static'
app.stage.hitArea = app.screen
app.stage.sortableChildren = true
app.stage.on('pointerup', onDragEnd)
app.stage.on('pointerupoutside', onDragEnd)

shareButtonElement.disabled = true
downloadButtonElement.disabled = true

shareButtonElement.addEventListener('click', async () => {
  if (selectedObject) {
    selectedObject.alpha = 1
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
  if (selectedObject) {
    selectedObject.alpha = 1
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
    if (selectedObject) {
      selectedObject.alpha = 1
    }

    const texture = await Assets.load(image)
    const { sprite } = addSprite(app, texture)

    sprite.on('pointerdown', () => onDragStart(sprite))
    selectedObject = sprite
    shareButtonElement.disabled = false
    downloadButtonElement.disabled = false
  })
})

upwardButtonElement.addEventListener('click', () => {
  if (selectedObject) {
    selectedObject.y -= 10
  }
})

downwardButtonElement.addEventListener('click', () => {
  if (selectedObject) {
    selectedObject.y += 10
  }
})

leftButtonElement.addEventListener('click', () => {
  if (selectedObject) {
    selectedObject.x -= 10
  }
})

rightButtonElement.addEventListener('click', () => {
  if (selectedObject) {
    selectedObject.x += 10
  }
})

zoomInButtonElement.addEventListener('click', () => {
  if (!selectedObject) {
    return
  }

  if (selectedObject instanceof Text) {
    selectedObject.style.fontSize = Number(selectedObject.style.fontSize) * 1.1
  } else if (selectedObject instanceof Sprite) {
    selectedObject.scale.x *= 1.1
    selectedObject.scale.y *= 1.1
  }
})

zoomOutButtonElement.addEventListener('click', () => {
  if (!selectedObject) {
    return
  }

  if (selectedObject instanceof Text) {
    selectedObject.style.fontSize = Number(selectedObject.style.fontSize) / 1.1
  } else if (selectedObject instanceof Sprite) {
    selectedObject.scale.x /= 1.1
    selectedObject.scale.y /= 1.1
  }
})

rotateButtonElement.addEventListener('click', () => {
  if (selectedObject) {
    selectedObject.rotation += Math.PI / 10
  }
})

deleteButtonElement.addEventListener('click', () => {
  if (selectedObject) {
    if (app.stage.children.length <= 1) {
      shareButtonElement.disabled = true
      downloadButtonElement.disabled = true
    }
    selectedObject.destroyObject?.()
    selectedObject = null
  }
})

addTextFormElement.addEventListener('submit', (event) => {
  event.preventDefault()
  const value = textFieldElement.value
  if (!value) {
    return
  }

  const { textObject } = addText(app, value)

  textObject.on('pointerdown', () => onDragStart(textObject))
  selectedObject = textObject

  textFieldElement.value = ''
  shareButtonElement.disabled = false
  downloadButtonElement.disabled = false
})

await Promise.all(
  [...selectBgRadioElements].map(async (element, i) => {
    if (element.checked) {
      const value = element.value as keyof typeof BG_IMAGES

      if (!value || !BG_IMAGES[value]) {
        return
      }

      const texture = await Assets.load(BG_IMAGES[value])
      const { bgObject } = addBackground(app, texture)
      selectedBg = bgObject
    }

    console.log('Added background', i)

    element.addEventListener('change', async function (event) {
      const target = event.target as HTMLInputElement
      const value = target.value as keyof typeof BG_IMAGES

      if (!value || !BG_IMAGES[value]) {
        return
      }

      if (selectedBg) {
        selectedBg.destroy()
      }

      const texture = await Assets.load(BG_IMAGES[value])
      const { bgObject } = addBackground(app, texture)
      selectedBg = bgObject
    })
  })
)
