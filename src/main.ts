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
  getElement,
  getElements,
} from './utils'
import { BG_IMAGES, OBJECT_IMAGES } from './assets/data'

import './style.css'

const canvasElement = getElement<HTMLCanvasElement>('#canvas')
const shareButtonElement = getElement<HTMLButtonElement>('[data-button="share"]')
const downloadButtonElement = getElement<HTMLButtonElement>('[data-button="download"]')
const resetButtonElement = getElement<HTMLButtonElement>('[data-button="reset"]')
const saveButtonElement = getElement<HTMLButtonElement>('[data-button="save"]')
const messageElement = getElement<HTMLParagraphElement>('[data-message]')
const buttonsElement = getElement<HTMLDivElement>('[data-buttons]')
const upwardButtonElement = getElement<HTMLButtonElement>('[data-button="upward"]')
const downwardButtonElement = getElement<HTMLButtonElement>('[data-button="downward"]')
const leftButtonElement = getElement<HTMLButtonElement>('[data-button="left"]')
const rightButtonElement = getElement<HTMLButtonElement>('[data-button="right"]')
const zoomInButtonElement = getElement<HTMLButtonElement>('[data-button="zoom-in"]')
const zoomOutButtonElement = getElement<HTMLButtonElement>('[data-button="zoom-out"]')
const rotateButtonElement = getElement<HTMLButtonElement>('[data-button="rotate"]')
const deleteButtonElement = getElement<HTMLButtonElement>('[data-button="delete"]')
const addTextFormElement = getElement<HTMLFormElement>('[data-form="add-text"]')
const textFieldElement = getElement<HTMLInputElement>('[data-text-field]')
const selectBgRadioElements = getElements<HTMLInputElement>('[data-radio="select-bg"]')
const loadingElement = getElement<HTMLDivElement>('[data-loading]')
const loadingCharElements = getElements<HTMLSpanElement>('[data-loading-char]')

const moveButtons = [
  { element: upwardButtonElement, x: 0, y: -10 },
  { element: downwardButtonElement, x: 0, y: 10 },
  { element: leftButtonElement, x: -10, y: 0 },
  { element: rightButtonElement, x: 10, y: 0 },
]

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

const adjustCoverForText = (textObject: Text) => {
  cover.width = textObject.width + textObject.style.padding
  cover.height = textObject.height + textObject.style.padding
  cover.x = cover.width / -2
  cover.y = cover.height / -1.7
  console.log('Text:', { width: cover.width, height: cover.height })
}

const adjustCoverForSprite = (spriteObject: Sprite) => {
  cover.width = spriteObject.width
  cover.height = spriteObject.height
  cover.x = cover.width / -2
  cover.y = cover.height / -2
  console.log('Sprite:', { width: cover.width, height: cover.height })
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
    console.log('No object selected')
    return
  }

  const selectedObject = objectContainer.children[0]

  selectedObjectContainer = objectContainer
  selectedObjectContainer.zIndex = 1

  if (selectedObject instanceof Text) {
    adjustCoverForText(selectedObject)
  } else if (selectedObject instanceof Sprite) {
    adjustCoverForSprite(selectedObject)
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

moveButtons.forEach(({ element, x, y }) => {
  element.addEventListener('click', () => {
    if (selectedObjectContainer) {
      selectedObjectContainer.x += x
      selectedObjectContainer.y += y
    }
  })
})

const adjustObjectSize = (scaleFactor: number) => {
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
    selectedObject.style.fontSize = Math.max(parseInt(selectedObject.style.fontSize.toString()) * scaleFactor, 1)
    selectedObject.style.padding = selectedObject.height / 2
    cover.width = selectedObject.width + selectedObject.style.padding
    cover.height = selectedObject.height + selectedObject.style.padding
    cover.x = cover.width / -2
    cover.y = cover.height / -1.7
  } else if (selectedObject instanceof Sprite) {
    selectedObject.width = cover.width = selectedObject.width * scaleFactor
    selectedObject.height = cover.height = selectedObject.height * scaleFactor
    cover.x = cover.width / -2
    cover.y = cover.height / -2
  }
}

zoomInButtonElement.addEventListener('click', () => adjustObjectSize(1.1))

zoomOutButtonElement.addEventListener('click', () => adjustObjectSize(0.9))

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

  const historyDataList = convertHistoryDataList(objectsContainer.children)
  const bg = [...selectBgRadioElements].find((element) => element.checked)?.value || Object.keys(BG_IMAGES)[0]

  try {
    await share(canvasElement, historyDataList, bg)
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
  const query = new URLSearchParams(location.search)
  const key = query.get('key')

  let historyDataList: HistoryData[] = []
  let bg: string | undefined = undefined

  try {
    const res = await fetch(
      `https://dev-kdntiaoao-bucket.s3.ap-northeast-1.amazonaws.com/pixijs-image-maker/share/${key}.json`
    )

    if (!res.ok) {
      throw new Error('Network response was not ok')
    }

    const json = (await res.json()) as { history: HistoryData[]; bg: string }
    historyDataList = json.history

    bg = json.bg
  } catch (error) {
    const rawHistory: unknown = JSON.parse(window.localStorage.getItem('history') || 'null')
    if (Array.isArray(rawHistory)) {
      historyDataList = rawHistory
    }

    bg = window.localStorage.getItem('bg') || Object.keys(BG_IMAGES)[0]
  }

  const bgValue = bg ? BG_IMAGES[bg as keyof typeof BG_IMAGES] : undefined

  await restoreHistoryDataList(historyDataList, app, objectsContainer, (container) => {
    container.on('pointerdown', onDragStart)
  })

  if (objectsContainer.children.length > 0) {
    setButtonsDisabled(false)
  }

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
