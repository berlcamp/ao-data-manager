/** Thousand separators for numeric amounts; non-numeric text is returned unchanged. */
export function formatAmountWithCommas (
  value: string | number | undefined | null
): string {
  if (value === undefined || value === null) return ''
  const raw = String(value).trim()
  if (raw === '') return ''

  const withoutCommas = raw.replace(/,/g, '')
  const n = Number(withoutCommas)
  if (Number.isNaN(n)) return raw

  return n.toLocaleString('en-US', {
    maximumFractionDigits: 20,
  })
}

export function fullTextQuery (string: string): string {
  // const isStringAllNumbers = (str: string) => {
  //   return /^\d+$/.test(str)
  // }

  // if (isStringAllNumbers(string)) {
  //   return parseInt(string, 10)
  // }

  const searchSplit = string.split(' ')

  const keywordArray: any[] = []
  searchSplit.forEach(item => {
    if (item !== '') keywordArray.push(`'${item}'`)
  })
  const searchQuery = keywordArray.join(' & ')

  return searchQuery
}

export function generateReferenceCode () {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const charactersLength = characters.length
  let counter = 0
  while (counter < 8) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
    counter += 1
  }
  return result
}
export function generateRandomNumber (length: number) {
  let result = ''
  const characters = '0123456789'
  const charactersLength = characters.length
  let counter = 0
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
    counter += 1
  }
  return result
}
