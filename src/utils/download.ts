export const download = (canvasElement: HTMLCanvasElement) => {
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
}
