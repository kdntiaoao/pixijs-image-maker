import { getXShareUrl } from './get-x-share-url'

export const share = async (canvasElement: HTMLCanvasElement): Promise<void> => {
  const dataURL = canvasElement.toDataURL()
  const dataURL2 = canvasElement.toDataURL('image/jpeg', 0.5)

  console.log({
    dataURL: new Blob([dataURL]).size / 1000 + 'kB',
    dataURL2: new Blob([dataURL2]).size / 1000 + 'kB',
  })

  const apiEndpoint = 'https://27bfwxzjpj7jyk2hthonyyerru0wryet.lambda-url.ap-northeast-1.on.aws/'

  const res = await fetch(apiEndpoint, {
    method: 'POST',
    body: JSON.stringify({ imageData: dataURL2 }),
  })

  if (!res.ok) {
    console.log('Network response was not ok')
    throw new Error('Network response was not ok')
  }

  const json = (await res.json()) as { message: string; image?: string; link?: string }
  console.log(json)

  if (json.link) {
    const text = ['PixiJSで作った画像をXでシェアする', '', json.link]
    if (!window.open(getXShareUrl(text))) {
      location.href = getXShareUrl(text)
    }
  } else {
    throw new Error('No link')
  }
}
