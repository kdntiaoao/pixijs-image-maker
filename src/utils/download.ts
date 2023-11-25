export const download = (canvasElement: HTMLCanvasElement) => {
  const dataURL = canvasElement.toDataURL('image/jpeg', 0.5)

  console.log('Download:', {
    size: new Blob([dataURL]).size / 1000 + 'kB',
  })

  const a = document.createElement('a')
  a.href = dataURL
  a.download = 'pixijs-image.jpg'
  a.click()
}
