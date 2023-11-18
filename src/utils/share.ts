import { getXShareUrl } from './get-x-share-url'

export const share = async (canvasElement: HTMLCanvasElement): Promise<void> => {
  const originalDataURL = canvasElement.toDataURL()
  const dataURL = canvasElement.toDataURL('image/jpeg', 0.5)

  console.log({
    originalDataURL: new Blob([originalDataURL]).size / 1000 + 'kB',
    dataURL: new Blob([dataURL]).size / 1000 + 'kB',
  })

  const apiEndpoint = 'https://27bfwxzjpj7jyk2hthonyyerru0wryet.lambda-url.ap-northeast-1.on.aws/'

  const res = await fetch(apiEndpoint, {
    method: 'POST',
    body: JSON.stringify({ imageData: dataURL }),
  })

  if (!res.ok) {
    throw new Error('Network response was not ok')
  }

  const json = (await res.json()) as { message: string; image?: string; link?: string }
  console.log('response:', json)

  if (json.link) {
    const text = ['PixiJSで作った画像をXでシェアする', '', json.link]
    if (!window.open(getXShareUrl(text))) {
      location.href = getXShareUrl(text)
    }
  } else {
    throw new Error('No link')
  }
}
