import { Assets, Container, FederatedPointerEvent, Graphics, Sprite, Text } from 'pixi.js'

import { initApp, addSprite, download, share, sleep, addText, addBackground } from './utils'

import dogImage from '@/assets/images/dog.png'
import cherryBlossomImage from '@/assets/images/cherry-blossom.png'
import cupImage from '@/assets/images/cup.png'
import doveImage from '@/assets/images/dove.png'
import kettleImage from '@/assets/images/kettle.png'
import potImage from '@/assets/images/pot.png'
import bg01Image from '@/assets/images/bg01.jpg'
import bg02Image from '@/assets/images/bg02.jpg'
import bg03Image from '@/assets/images/bg03.jpg'

import './style.css'

const OBJECT_IMAGES = {
  img01: { img: dogImage, alt: 'dog' },
  img02: { img: cherryBlossomImage, alt: 'cherry-blossom' },
  img03: { img: cupImage, alt: 'cup' },
  img04: { img: doveImage, alt: 'dove' },
  img05: { img: kettleImage, alt: 'kettle' },
  img06: { img: potImage, alt: 'pot' },
}

const BG_IMAGES = {
  bg01: bg01Image,
  bg02: bg02Image,
  bg03: bg03Image,
}

type HistoryObject =
  | {
      text: string
      fontSize: number
      x: number
      y: number
      rotation: number
    }
  | {
      img: keyof typeof OBJECT_IMAGES
      x: number
      y: number
      width: number
      rotation: number
    }

const canvasElement = document.getElementById('canvas') as HTMLCanvasElement
const shareButtonElement = document.querySelector('[data-button="share"]') as HTMLButtonElement
const downloadButtonElement = document.querySelector('[data-button="download"]') as HTMLButtonElement
const resetButtonElement = document.querySelector('[data-button="reset"]') as HTMLButtonElement
const saveButtonElement = document.querySelector('[data-button="save"]') as HTMLButtonElement
const messageElement = document.querySelector('[data-message]') as HTMLParagraphElement
const buttonsElement = document.querySelector('[data-buttons]') as HTMLDivElement
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

const setButtonsDisabled = (disabled: boolean) => {
  shareButtonElement.disabled = disabled
  downloadButtonElement.disabled = disabled
  resetButtonElement.disabled = disabled
  saveButtonElement.disabled = disabled
}

/**
 * オブジェクトを選択し、選択されたオブジェクトのタイプに基づいて必要な操作を行う。
 * @param {Container} objectContainer - 選択されたオブジェクトのコンテナ
 */
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
  setButtonsDisabled(false)
}

/**
 * ドラッグ移動イベントを処理する。
 * @param {FederatedPointerEvent} event - フェデレーションポインターイベント
 */
const onDragMove = (event: FederatedPointerEvent) => {
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
 * @param {Container} object - ドラッグするオブジェクト
 */
const onDragStart = (event: FederatedPointerEvent, object: Container) => {
  event.stopPropagation()
  selectObject(object)
  draggedObject = object
  draggedDiff = { x: event.global.x - object.x, y: event.global.y - object.y }
  app.stage.on('pointermove', onDragMove)
}

/**
 * ドラッグ操作が終了したときに呼び出されるコールバック関数。
 */
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

setButtonsDisabled(true)

Object.values(OBJECT_IMAGES).forEach(({ img, alt }) => {
  const buttonElement = document.createElement('button')
  buttonElement.type = 'button'
  buttonElement.classList.add('icon-button')

  const imgElement = document.createElement('img')
  imgElement.src = img
  imgElement.alt = alt

  buttonElement.append(imgElement)
  buttonElement.addEventListener('click', async () => {
    const texture = await Assets.load(img)
    const { spriteContainer } = addSprite(app, objectsContainer, texture)
    spriteContainer.on('pointerdown', (event) => onDragStart(event, spriteContainer))
    selectObject(spriteContainer)
  })

  buttonsElement.append(buttonElement)
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

  const selectedObject = selectedObjectContainer.children.find(
    (child) => child instanceof Text || child instanceof Sprite
  )

  if (!selectedObject) {
    return
  }

  if (selectedObject instanceof Text) {
    selectedObject.style.fontSize = parseInt(selectedObject.style.fontSize.toString()) * 1.1 + 4
    selectedObject.style.padding = selectedObject.height / 2
    cover.width = selectedObject.width + selectedObject.style.padding
    cover.height = selectedObject.height + selectedObject.style.padding
    cover.x = cover.width / -2
    cover.y = cover.height / -1.7
  } else if (selectedObject instanceof Sprite) {
    selectedObject.width = cover.width = selectedObject.width * 1.1
    selectedObject.height = cover.height = selectedObject.height * 1.1
    cover.x = cover.width / -2
    cover.y = cover.height / -2
  }
})

zoomOutButtonElement.addEventListener('click', () => {
  if (!selectedObjectContainer) {
    return
  }

  const selectedObject = selectedObjectContainer.children.find(
    (child) => child instanceof Text || child instanceof Sprite
  )

  if (!selectedObject) {
    return
  }

  if (selectedObject instanceof Text) {
    selectedObject.style.fontSize = Math.max(parseInt(selectedObject.style.fontSize.toString()) / 1.1 - 4, 1)
    selectedObject.style.padding = selectedObject.height / 2
    cover.width = selectedObject.width + selectedObject.style.padding
    cover.height = selectedObject.height + selectedObject.style.padding
    cover.x = cover.width / -2
    cover.y = cover.height / -1.7
  } else if (selectedObject instanceof Sprite) {
    selectedObject.width = cover.width = selectedObject.width / 1.1
    selectedObject.height = cover.height = selectedObject.height / 1.1
    cover.x = cover.width / -2
    cover.y = cover.height / -2
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
      setButtonsDisabled(true)
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

resetButtonElement.addEventListener('click', () => {
  objectsContainer.removeChildren()
  setButtonsDisabled(true)
})

saveButtonElement.addEventListener('click', async () => {
  if (selectedObjectContainer) {
    // 選択を外す
    selectObject()
  }

  // 選択されていたSpriteから選択を外すのを待つ
  await sleep(100)

  window.localStorage.setItem(
    'history',
    JSON.stringify(
      objectsContainer.children
        .map((container) => {
          const child = container.children?.[0]
          if (!child) {
            console.log('No child')
            return
          }
          if (child instanceof Text) {
            return {
              text: child.text,
              fontSize: child.style.fontSize,
              x: container.x,
              y: container.y,
              rotation: container.rotation,
            }
          }
          if (child instanceof Sprite) {
            const imgKey = Object.entries(OBJECT_IMAGES).find(
              ([, imgData]) => imgData.img === child.texture.textureCacheIds[0]
            )?.[0]
            return {
              img: imgKey,
              x: container.x,
              y: container.y,
              width: child.width,
              rotation: container.rotation,
            }
          }
        })
        .filter((x) => x)
    )
  )
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

const historyObjects: HistoryObject[] = JSON.parse(window.localStorage.getItem('history') || '[]')
;(async function () {
  for await (const historyObject of historyObjects) {
    if ('text' in historyObject) {
      const { textContainer } = addText(app, objectsContainer, historyObject.text)
      const textObject = textContainer.children[0]
      if (textObject instanceof Text) {
        textObject.style.fontSize = historyObject.fontSize
        textObject.style.padding = textObject.height / 2
      }
      textContainer.x = historyObject.x
      textContainer.y = historyObject.y
      textContainer.rotation = historyObject.rotation
      textContainer.on('pointerdown', (event) => onDragStart(event, textContainer))
    } else if ('img' in historyObject) {
      const texture = await Assets.load(OBJECT_IMAGES[historyObject.img].img)
      const { spriteContainer } = addSprite(app, objectsContainer, texture)
      const spriteObject = spriteContainer.children[0]
      if (spriteObject instanceof Sprite) {
        const spriteAspectRatio = spriteObject.width / spriteObject.height
        spriteObject.width = historyObject.width
        spriteObject.height = historyObject.width / spriteAspectRatio
      }
      spriteContainer.x = historyObject.x
      spriteContainer.y = historyObject.y
      spriteContainer.rotation = historyObject.rotation
      spriteContainer.on('pointerdown', (event) => onDragStart(event, spriteContainer))
    }
  }
  if (objectsContainer.children.length > 0) {
    setButtonsDisabled(false)
  }
})()
