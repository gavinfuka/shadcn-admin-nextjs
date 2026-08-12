export function DiffView({
  oldContent,
  newContent,
}: {
  oldContent: string
  newContent: string
}) {
  const oldLines = new Set(oldContent.split('\n'))
  const changes = newContent
    .split('\n')
    .map((text) => ({ operation: oldLines.has(text) ? 0 : 1, text }))
  return (
    <pre className='overflow-auto rounded-md border p-4 text-sm whitespace-pre-wrap'>
      {changes.map(({ operation, text }, index) => (
        <span
          className={
            operation === 1
              ? 'block bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
              : 'block'
          }
          key={`${index}-${text}`}
        >
          {text || ' '}
        </span>
      ))}
    </pre>
  )
}
