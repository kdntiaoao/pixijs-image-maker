export const download = (canvasElement: HTMLCanvasElement) => {
  const originalDataURL = canvasElement.toDataURL()
  const dataURL = canvasElement.toDataURL('image/jpeg', 0.5)

  console.log('Download:', {
    originalDataURL: new Blob([originalDataURL]).size / 1000 + 'kB',
    dataURL: new Blob([dataURL]).size / 1000 + 'kB',
  })

  const a = document.createElement('a')
  a.href = dataURL
  a.download = 'pixijs-image.jpg'
  a.click()
}
