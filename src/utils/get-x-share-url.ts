export const getXShareUrl = (text: string | string[]): string => {
  let _text = ''

  if (Array.isArray(text)) {
    _text = text.join('\n')
  } else {
    _text = text
  }

  const __text = encodeURIComponent(_text)

  return 'https://twitter.com/intent/tweet?text=' + __text
}
