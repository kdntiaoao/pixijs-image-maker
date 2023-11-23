import { Assets, Container, FederatedPointerEvent, Graphics, Sprite, Text } from 'pixi.js'

import { initApp, addSprite, download, share, sleep, addText, addBackground } from './utils'

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

let draggedObject: Container | null = null
let draggedDiff: { x: number; y: number } = { x: 0, y: 0 }
let selectedObjectContainer: Container | null = null
let selectedBg: Sprite | null = null

const { app } = initApp(canvasElement)

const cover = new Graphics().beginFill('#fff3').drawRect(0, 0, 1, 1).endFill()
cover.zIndex = -1

const selectObject = (objectContainer?: Container) => {
  if (selectedObjectContainer) {
    selectedObjectContainer.removeChild(cover)
    selectedObjectContainer.zIndex = 0
    selectedObjectContainer = null
  }

  if (!objectContainer) {
    return
  }

  selectedObjectContainer = objectContainer
  selectedObjectContainer.zIndex = 1

  if (selectedObjectContainer.children[0] instanceof Text) {
    cover.width = selectedObjectContainer.children[0].width + selectedObjectContainer.children[0].style.padding
    cover.height = selectedObjectContainer.children[0].height + selectedObjectContainer.children[0].style.padding
    cover.x = cover.width / -2
    cover.y = cover.height / -1.7
    console.log('Text:', { width: cover.width, height: cover.height })
  } else if (selectedObjectContainer.children[0] instanceof Sprite) {
    cover.width = selectedObjectContainer.children[0].width
    cover.height = selectedObjectContainer.children[0].height
    cover.x = cover.width / -2
    cover.y = cover.height / -2
    console.log('Sprite:', { width: cover.width, height: cover.height })
  } else {
    cover.width = app.screen.width
    cover.height = app.screen.height
    cover.x = cover.width / -2
    cover.y = cover.height / -2
    console.log('Other:', { width: cover.width, height: cover.height })
  }

  selectedObjectContainer.addChild(cover)
  shareButtonElement.disabled = false
  downloadButtonElement.disabled = false
}

const onDragMove = (event: FederatedPointerEvent) => {
  if (draggedObject) {
    const position = event.global.clone()
    position.x -= draggedDiff.x
    position.y -= draggedDiff.y
    draggedObject.parent.toLocal(position, undefined, draggedObject.position)
  }
}

const onDragStart = (event: FederatedPointerEvent, object: Container) => {
  event.stopPropagation()
  selectObject(object)
  draggedObject = object
  draggedDiff = { x: event.global.x - object.x, y: event.global.y - object.y }
  app.stage.on('pointermove', onDragMove)
}

const onDragEnd = () => {
  app.stage.off('pointermove', onDragMove)
  draggedObject = null
}

app.stage.on('pointerdown', () => selectObject())
app.stage.on('pointerup', onDragEnd)
app.stage.on('pointerupoutside', onDragEnd)

const objectsContainer = new Container()
objectsContainer.sortableChildren = true
app.stage.addChild(objectsContainer)

shareButtonElement.disabled = true
downloadButtonElement.disabled = true

shareButtonElement.addEventListener('click', async () => {
  if (selectedObjectContainer) {
    // 選択を外す
    selectObject()
  }

  messageElement.textContent = '画像を生成しています...'

  // 選択されていたSpriteから選択を外すのを待つ
  await sleep(100)

  try {
    await share(canvasElement)
    messageElement.textContent = '画像を生成しました！'
  } catch (error) {
    messageElement.textContent = '画像の生成に失敗しました'
  }
})

downloadButtonElement.addEventListener('click', async () => {
  if (selectedObjectContainer) {
    // 選択を外す
    selectObject()
  }

  // 選択されていたSpriteから選択を外すのを待つ
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
    const texture = await Assets.load(image)
    const { spriteContainer } = addSprite(app, objectsContainer, texture)

    spriteContainer.on('pointerdown', (event) => onDragStart(event, spriteContainer))
    selectObject(spriteContainer)
  })
})

upwardButtonElement.addEventListener('click', () => {
  if (selectedObjectContainer) {
    selectedObjectContainer.y -= 10
  }
})

downwardButtonElement.addEventListener('click', () => {
  if (selectedObjectContainer) {
    selectedObjectContainer.y += 10
  }
})

leftButtonElement.addEventListener('click', () => {
  if (selectedObjectContainer) {
    selectedObjectContainer.x -= 10
  }
})

rightButtonElement.addEventListener('click', () => {
  if (selectedObjectContainer) {
    selectedObjectContainer.x += 10
  }
})

zoomInButtonElement.addEventListener('click', () => {
  if (!selectedObjectContainer) {
    return
  }

  const selectedTextObject = selectedObjectContainer.children.find((child) => child instanceof Text)

  if (selectedTextObject && selectedTextObject instanceof Text) {
    selectedTextObject.style.fontSize = parseInt(selectedTextObject.style.fontSize.toString()) * 1.1 + 4
    selectedTextObject.style.padding = selectedTextObject.height / 2
    cover.width = selectedTextObject.width + selectedTextObject.style.padding
    cover.height = selectedTextObject.height + selectedTextObject.style.padding
    cover.x = cover.width / -2
    cover.y = cover.height / -1.7
  } else {
    selectedObjectContainer.width *= 1.1
    selectedObjectContainer.height *= 1.1
  }
})

zoomOutButtonElement.addEventListener('click', () => {
  if (!selectedObjectContainer) {
    return
  }

  const selectedTextObject = selectedObjectContainer.children.find((child) => child instanceof Text)

  if (selectedTextObject && selectedTextObject instanceof Text) {
    selectedTextObject.style.fontSize = Math.max(parseInt(selectedTextObject.style.fontSize.toString()) / 1.1 - 4, 1)
    selectedTextObject.style.padding = selectedTextObject.height / 2
    cover.width = selectedTextObject.width + selectedTextObject.style.padding
    cover.height = selectedTextObject.height + selectedTextObject.style.padding
    cover.x = cover.width / -2
    cover.y = cover.height / -1.7
  } else {
    selectedObjectContainer.width /= 1.1
    selectedObjectContainer.height /= 1.1
  }
})

rotateButtonElement.addEventListener('click', () => {
  if (selectedObjectContainer) {
    selectedObjectContainer.rotation += Math.PI / 10
  }
})

deleteButtonElement.addEventListener('click', () => {
  if (selectedObjectContainer) {
    console.log('Current children before delete:', objectsContainer.children.length)
    if (objectsContainer.children.length <= 1) {
      shareButtonElement.disabled = true
      downloadButtonElement.disabled = true
    }
    selectedObjectContainer.destroy()
    selectedObjectContainer = null
  }
})

addTextFormElement.addEventListener('submit', (event) => {
  event.preventDefault()
  const value = textFieldElement.value
  if (!value) {
    return
  }

  const { textContainer } = addText(app, objectsContainer, value)

  textContainer.on('pointerdown', (event) => onDragStart(event, textContainer))
  selectObject(textContainer)

  textFieldElement.value = ''
})

Promise.all(
  [...selectBgRadioElements].map(async (element) => {
    if (element.checked) {
      const value = element.value as keyof typeof BG_IMAGES

      if (!value || !BG_IMAGES[value]) {
        return
      }

      const texture = await Assets.load(BG_IMAGES[value])
      const { bgObject } = addBackground(app, texture)
      selectedBg = bgObject
    }

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
