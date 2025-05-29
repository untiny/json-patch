import type { Config } from 'jsondiffpatch'
import { create } from 'jsondiffpatch'

export type AddedDelta = [unknown]
export type ModifiedDelta = [unknown, unknown]
export type DeletedDelta = [unknown, 0, 0]
export interface ObjectDelta {
  [property: string]: Delta
}
export interface ArrayDelta {
  _t: 'a'
  [index: number | `${number}`]: Delta
  [index: `_${number}`]: DeletedDelta | MovedDelta
}
export type MovedDelta = [unknown, number, 3]
export type TextDiffDelta = [string, 0, 2]
export type FormatDelta = AddedDelta | ModifiedDelta | DeletedDelta | MovedDelta | TextDiffDelta
export type Delta = FormatDelta | ObjectDelta | ArrayDelta | undefined
export type PatchPath = string | number
export interface AddedRecord {
  op: 'add'
  paths: PatchPath[]
  value: unknown
}
export interface RemovedRecord {
  op: 'remove'
  paths: PatchPath[]
  value: unknown
}
export interface ReplacedRecord {
  op: 'replace'
  paths: PatchPath[]
  value: unknown
  original: unknown
}
export interface MovedRecord {
  op: 'move'
  paths: PatchPath[]
  to: PatchPath[]
  value: unknown
}
export type PatchRecord = AddedRecord | RemovedRecord | ReplacedRecord | MovedRecord

export function formatDelta(delta: FormatDelta, paths: PatchPath[], prefixPaths: PatchPath[]): PatchRecord {
  // Added
  if (delta.length === 1) {
    const [value] = delta
    return { op: 'add', paths, value }
  }
  // Modified
  if (delta.length === 2) {
    const [original, value] = delta
    return { op: 'replace', paths, original, value }
  }
  const [value, toIndex, type] = delta
  // Moved
  if (type === 3) {
    return { op: 'move', paths, to: [...prefixPaths, toIndex], value }
  }
  // Deleted
  return { op: 'remove', paths, value }
}

export function formatRecords(delta: ObjectDelta | ArrayDelta, prefixPaths: PatchPath[] = []): PatchRecord[] {
  const isArrayDelta = '_t' in delta && delta._t === 'a'
  return Object.entries(delta).flatMap(([key, changes]) => {
    if (changes === undefined || changes === null) {
      return []
    }
    if (key === '_t' && changes === 'a') {
      return []
    }
    const isDeletedOrMoved = key.substring(0, 1) === '_' && !Number.isNaN(Number.parseInt(key.substring(1)))
    const currentKey = isDeletedOrMoved ? Number.parseInt(key.substring(1)) : isArrayDelta ? Number.parseInt(key) : key
    const paths = [...prefixPaths, currentKey]
    if (Array.isArray(changes)) {
      return formatDelta(changes as FormatDelta, paths, prefixPaths)
    }
    if (typeof changes === 'object') {
      return formatRecords(changes, paths)
    }
    return []
  })
}

export function diff<T>(left: Partial<T> | Partial<T>[], right: Partial<T> | Partial<T>[], prefixPaths?: PatchPath[], options?: Config): PatchRecord[] {
  options = options ?? {}
  const patcher = create({
    arrays: { detectMove: true, includeValueOnMove: true },
    ...options,
  })
  const delta = patcher.diff(left, right) as ObjectDelta | ArrayDelta
  const records: PatchRecord[] = formatRecords(delta, prefixPaths ?? [])
  return records
}
