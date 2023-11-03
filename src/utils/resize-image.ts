export const resizeImage = (imageDataUrl: string, aspectRatio: number, resultWidth: number = 300): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Imageインスタンスを作成
    const image = new Image()

    // 画像がロードされたら処理を行う
    image.onload = () => {
      // キャンバスのサイズを設定
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      // 新しいサイズを計算
      const resultHeight = resultWidth / aspectRatio

      // キャンバスのサイズをリサイズ後のサイズに設定
      canvas.width = resultWidth
      canvas.height = resultHeight

      // 画像をキャンバスに描画
      ctx?.drawImage(image, 0, 0, resultWidth, resultHeight)

      // 新しいデータURLを取得してリゾルブ
      resolve(canvas.toDataURL('image/jpeg', 0.5))
    }

    // エラーが発生したらリジェクト
    image.onerror = (e) => {
      reject(e)
    }

    // データURLを画像ソースに設定
    image.src = imageDataUrl

    // キャッシュされた画像を強制的にリロードするための対策
    if (image.complete || image.complete === undefined) {
      image.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='
      image.src = imageDataUrl
    }
  })
}
