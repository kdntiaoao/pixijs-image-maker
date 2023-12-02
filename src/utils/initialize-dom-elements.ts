import { getElement, getElements } from '.'

export const initializeDomElements = () => {
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

  return {
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
