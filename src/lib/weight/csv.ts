import { pb, pocketbaseUrl } from '@/lib/pocketbase'

export type CsvDataType = 'weight' | 'calories' | 'food_log'

export interface CsvImportError {
  row: number
  message: string
}

export interface CsvImportResult {
  type: CsvDataType
  totalRows: number
  created: number
  updated: number
  skipped: number
  errors: CsvImportError[]
}

export async function importCsvData(type: CsvDataType, file: File): Promise<CsvImportResult> {
  const formData = new FormData()
  formData.append('type', type)
  formData.append('file', file)

  return pb.send<CsvImportResult>('/api/data/import/csv', {
    method: 'POST',
    body: formData,
  })
}

export async function exportCsvData(
  type: CsvDataType,
  authToken = pb.authStore.token,
  fetchFn: typeof fetch = fetch,
): Promise<{ filename: string; blob: Blob }> {
  const url = new URL('/api/data/export/csv', pocketbaseUrl)
  url.searchParams.set('type', type)

  const headers: HeadersInit = {}
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`
  }

  const response = await fetchFn(url.toString(), {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    throw new Error('Export failed')
  }

  const blob = await response.blob()
  const disposition = response.headers.get('content-disposition')
  const filename = extractFilenameFromDisposition(disposition) ?? `${type}.csv`

  return { filename, blob }
}

export function extractFilenameFromDisposition(disposition: string | null): string | null {
  if (!disposition) return null

  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1])
  }

  const simpleMatch = disposition.match(/filename="?([^";]+)"?/i)
  if (simpleMatch?.[1]) {
    return simpleMatch[1]
  }

  return null
}
