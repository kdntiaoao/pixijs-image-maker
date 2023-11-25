import { Assets, Container, FederatedPointerEvent, Graphics, Sprite, Text, Texture } from 'pixi.js'

import { type HistoryData } from './types'
import {
  initApp,
  addSprite,
  download,
  share,
  sleep,
  addText,
  addBackground,
  convertHistoryDataList,
  restoreHistoryDataList,
  handleDragEnd,
  handleDragStart,
} from './utils'
import { BG_IMAGES, OBJECT_IMAGES } from './assets/data'

import './style.css'

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
const loadingElement = document.querySelector('[data-loading]') as HTMLDivElement
const loadingCharElements = document.querySelectorAll('[data-loading-char]') as NodeListOf<HTMLSpanElement>

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

const onDragStart = (event: FederatedPointerEvent) => {
  handleDragStart(event, app, (target) => {
    selectObject(target)
  })
}

const onDragEnd = () => {
  handleDragEnd(app)
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
    spriteContainer.on('pointerdown', onDragStart)
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
  textContainer.on('pointerdown', onDragStart)
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
  window.localStorage.removeItem('history')
  window.localStorage.removeItem('bg')
  messageElement.textContent = 'リセットしました！'

  setTimeout(() => {
    if (messageElement.textContent === 'リセットしました！') {
      messageElement.textContent = ''
    }
  }, 2000)
})

saveButtonElement.addEventListener('click', async () => {
  if (selectedObjectContainer) {
    // 選択を外す
    selectObject()
  }

  // 選択されていたSpriteから選択を外すのを待つ
  await sleep(100)

  const historyDataList = convertHistoryDataList(objectsContainer.children)
  window.localStorage.setItem('history', JSON.stringify(historyDataList))

  const bg = [...selectBgRadioElements].find((element) => element.checked)?.value
  window.localStorage.setItem('bg', bg || Object.keys(BG_IMAGES)[0])

  messageElement.textContent = '保存しました！'
})

Promise.all(
  [...selectBgRadioElements].map(async (element) => {
    element.addEventListener('change', async (event) => {
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

// 履歴を読み込む
;(async function () {
  const rawHistory: unknown = JSON.parse(window.localStorage.getItem('history') || '')
  if (!Array.isArray(rawHistory)) return

  const historyData: HistoryData[] = rawHistory

  await restoreHistoryDataList(historyData, app, objectsContainer, (container) => {
    container.on('pointerdown', onDragStart)
  })

  if (objectsContainer.children.length > 0) {
    setButtonsDisabled(false)
  }
})()

//
;(async function () {
  const bg = window.localStorage.getItem('bg') || Object.keys(BG_IMAGES)[0]
  const bgValue = bg ? BG_IMAGES[bg as keyof typeof BG_IMAGES] : undefined
  let texture: Texture | null = null

  if (!bgValue) {
    texture = await Assets.load(Object.values(BG_IMAGES)[0])
  } else {
    texture = await Assets.load(bgValue)
  }

  if (!texture) {
    console.log('Failed to load texture')
    return
  }

  const { bgObject } = addBackground(app, texture)
  selectedBg = bgObject

  for (const element of selectBgRadioElements) {
    const target = element as HTMLInputElement
    const value = target.value as keyof typeof BG_IMAGES

    if (value === bg) {
      target.checked = true
    }
  }
})()

{
  // ローディングテキストをアニメーションさせる
  const charLength = loadingCharElements.length
  const duration = (charLength + 1) / 5
  loadingCharElements.forEach((charElement, i) => {
    charElement.style.setProperty('--duration', `${duration}s`)
    charElement.style.setProperty('--delay', `${i / 5}s`)
  })
}

window.addEventListener('load', () => {
  loadingElement.style.display = 'none'
})
