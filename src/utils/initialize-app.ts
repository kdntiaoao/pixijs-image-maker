import { Assets, Container, FederatedPointerEvent, Graphics, Sprite, Text } from 'pixi.js'
import {
  addBackground,
  addSprite,
  addText,
  convertHistoryDataList,
  download,
  handleDragEnd,
  handleDragStart,
  initializeDomElements,
  initializePixiApp,
  share,
  sleep,
} from '.'
import { BG_IMAGES, OBJECT_IMAGES } from '../assets/data'

export const initializeApp = () => {
  const {
    canvasElement,
    shareButtonElement,
    downloadButtonElement,
    resetButtonElement,
    saveButtonElement,
    messageElement,
    buttonsElement,
    upwardButtonElement,
    downwardButtonElement,
    leftButtonElement,
    rightButtonElement,
    zoomInButtonElement,
    zoomOutButtonElement,
    rotateButtonElement,
    deleteButtonElement,
    addTextFormElement,
    textFieldElement,
    selectBgRadioElements,
    loadingElement,
    loadingCharElements,
  } = initializeDomElements()

  const moveButtons = [
    { element: upwardButtonElement, x: 0, y: -10 },
    { element: downwardButtonElement, x: 0, y: 10 },
    { element: leftButtonElement, x: -10, y: 0 },
    { element: rightButtonElement, x: 10, y: 0 },
  ]

  let selectedObjectContainer: Container | null = null
  let selectedBg: Sprite | null = null

  // Pixi.jsのApplicationインスタンスを取得
  const { app } = initializePixiApp(canvasElement)

  // 選択オブジェクト用のカバー
  const cover = new Graphics().beginFill('#fff3').drawRect(0, 0, 1, 1).endFill()
  cover.zIndex = -1

  const setButtonsDisabled = (disabled: boolean) => {
    shareButtonElement.disabled = disabled
    downloadButtonElement.disabled = disabled
    resetButtonElement.disabled = disabled
    saveButtonElement.disabled = disabled
  }

  const setBg = async (bg: keyof typeof BG_IMAGES) => {
    if (selectedBg) {
      selectedBg.destroy()
    }

    const texture = await Assets.load(BG_IMAGES[bg])
    const { bgObject } = addBackground(app, texture)
    selectedBg = bgObject

    for (const element of selectBgRadioElements) {
      const target = element as HTMLInputElement
      const value = target.value as keyof typeof BG_IMAGES

      if (value === bg) {
        target.checked = true
      }
    }
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

  // 画像やテキストオブジェクトを格納するコンテナ
  const objectsContainer = new Container()
  objectsContainer.sortableChildren = true
  app.stage.addChild(objectsContainer)

  setButtonsDisabled(true)

  // 画像オブジェクトを追加するボタンを作成
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

  // 背景画像を変更するラジオボタンの処理を設定
  Promise.all(
    [...selectBgRadioElements].map(async (element) => {
      element.addEventListener('change', async (event) => {
        const target = event.target as HTMLInputElement
        const value = target.value as keyof typeof BG_IMAGES

        if (!value || !BG_IMAGES[value]) {
          return
        }

        setBg(value)
      })
    })
  )

  // オブジェクトの移動ボタンの処理を設定
  moveButtons.forEach(({ element, x, y }) => {
    element.addEventListener('click', () => {
      if (selectedObjectContainer) {
        selectedObjectContainer.x += x
        selectedObjectContainer.y += y
      }
    })
  })

  // オブジェクトの拡大・縮小ボタンの処理
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

  // オブジェクトの拡大・縮小ボタンの処理を設定
  zoomInButtonElement.addEventListener('click', () => adjustObjectSize(1.1))
  zoomOutButtonElement.addEventListener('click', () => adjustObjectSize(0.9))

  // オブジェクトの回転ボタンの処理を設定
  rotateButtonElement.addEventListener('click', () => {
    if (selectedObjectContainer) {
      selectedObjectContainer.rotation += Math.PI / 10
    }
  })

  // オブジェクトの削除ボタンの処理を設定
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

  // テキストオブジェクトを追加するフォームの処理を設定
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

  // シェアボタンの処理を設定
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

  // ダウンロードボタンの処理を設定
  downloadButtonElement.addEventListener('click', async () => {
    if (selectedObjectContainer) {
      // 選択を外す
      selectObject()
    }

    // 選択されていたSpriteから選択を外すのを待つ
    await sleep(100)

    download(canvasElement)
  })

  // リセットボタンの処理を設定
  resetButtonElement.addEventListener('click', () => {
    objectsContainer.removeChildren()

    setButtonsDisabled(true)
    window.localStorage.removeItem('history')
    window.localStorage.removeItem('bg')
    messageElement.textContent = 'リセットしました！'

    const query = new URLSearchParams(window.location.search)
    query.delete('key')
    const newRelativePathQuery = window.location.pathname + '?' + query.toString()
    history.pushState(null, '', newRelativePathQuery)

    setTimeout(() => {
      if (messageElement.textContent === 'リセットしました！') {
        messageElement.textContent = ''
      }
    }, 2000)
  })

  // 保存ボタンの処理を設定
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

    const query = new URLSearchParams(window.location.search)
    query.delete('key')
    const newRelativePathQuery = window.location.pathname + '?' + query.toString()
    history.pushState(null, '', newRelativePathQuery)
  })

  return {
    // Pixi.js
    pixiApp: app,
    objectsContainer,
    setBg,
    onDragStart,
    // DOM
    canvasElement,
    shareButtonElement,
    downloadButtonElement,
    resetButtonElement,
    saveButtonElement,
    messageElement,
    buttonsElement,
    upwardButtonElement,
    downwardButtonElement,
    leftButtonElement,
    rightButtonElement,
    zoomInButtonElement,
    zoomOutButtonElement,
    rotateButtonElement,
    deleteButtonElement,
    addTextFormElement,
    textFieldElement,
    selectBgRadioElements,
    loadingElement,
    loadingCharElements,
  }
}
