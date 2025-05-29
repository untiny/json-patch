import type { AddedRecord, MovedRecord, RemovedRecord, ReplacedRecord } from '../src'
import { describe, expect, it } from 'vitest'
import { diff } from '../src'

describe('json patch', () => {
  it('should patch records', () => {
    const left = {
      name: '张三',
      address: {
        city: '北京',
        street: '旧街道',
      },
      tags: ['标签1', '标签2', '标签3'],
    }

    const right = {
      name: '李四',
      address: {
        city: '上海',
        street: '新街道',
      },
      tags: ['标签4', '标签3', '标签2'],
    }

    const records = diff(left, right)

    expect(records).toContainEqual<ReplacedRecord>({
      op: 'replace',
      paths: ['name'],
      original: '张三',
      value: '李四',
    })

    expect(records).toContainEqual<ReplacedRecord>({
      op: 'replace',
      paths: ['address', 'city'],
      original: '北京',
      value: '上海',
    })

    expect(records).toContainEqual<ReplacedRecord>({
      op: 'replace',
      paths: ['address', 'street'],
      original: '旧街道',
      value: '新街道',
    })

    expect(records).toContainEqual<RemovedRecord>({
      op: 'remove',
      paths: ['tags', 0],
      value: '标签1',
    })

    expect(records).toContainEqual<MovedRecord>({
      op: 'move',
      paths: ['tags', 2],
      to: ['tags', 1],
      value: '标签3',
    })

    expect(records).toContainEqual<AddedRecord>({
      op: 'add',
      paths: ['tags', 0],
      value: '标签4',
    })
  })
})
