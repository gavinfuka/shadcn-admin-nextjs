export function diffLines(oldContent, newContent) {
  const oldLines = new Set(oldContent.split('\n'))
  return newContent
    .split('\n')
    .map((text) => ({ type: oldLines.has(text) ? 'equal' : 'added', text }))
}
