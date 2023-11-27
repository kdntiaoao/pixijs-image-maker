export const getElement = <T extends HTMLElement = HTMLElement>(selector: string): T => {
  return document.querySelector(selector) as T
}

export const getElements = <T extends HTMLElement = HTMLElement>(selector: string): NodeListOf<T> => {
  return document.querySelectorAll(selector) as NodeListOf<T>
}
