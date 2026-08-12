'use client'

import { parse, unparse } from 'papaparse'
import { useMemo, useState } from 'react'
import DataGrid, { textEditor } from 'react-data-grid'
import 'react-data-grid/lib/styles.css'

type Row = Record<string, string | number>

export function SpreadsheetEditor({ content, saveContent }: { content: string; saveContent: (content: string, isCurrentVersion: boolean) => void; currentVersionIndex: number; isCurrentVersion: boolean; status: string }) {
  const parsed = useMemo(() => parse<string[]>(content || '', { skipEmptyLines: true }).data, [content])
  const columns = useMemo(() => Array.from({ length: Math.max(8, parsed[0]?.length ?? 0) }, (_, index) => ({ key: String(index), name: String.fromCharCode(65 + index), renderEditCell: textEditor, resizable: true, width: 120 })), [parsed])
  const [rows, setRows] = useState<Row[]>(() => Array.from({ length: Math.max(25, parsed.length) }, (_, rowIndex) => Object.fromEntries(columns.map((column, columnIndex) => [column.key, parsed[rowIndex]?.[columnIndex] ?? '']))))
  return <DataGrid columns={columns} onRowsChange={(next) => { setRows(next); saveContent(unparse(next.map((row) => columns.map((column) => String(row[column.key] ?? '')))), true) }} rows={rows} style={{ height: '100%' }} />
}