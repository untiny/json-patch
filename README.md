# @untiny/json-patch

基于 [jsondiffpatch](https://github.com/benjamine/jsondiffpatch) 的 JSON Patch 工具，支持对象和数组的差异计算与格式化。

## 特性

- 🔍 精确追踪对象属性变更
- 📝 支持自定义字段名称和格式化
- 🔄 支持数组元素的移动检测
- 🎯 输出结构化的 Patch 记录，便于后续处理

## 安装

```bash
npm install @untiny/json-patch
# 或
npm install @untiny/json-patch
# 或
yarn add @untiny/json-patch
```

## 基础用法

```typescript
import { diff } from '@untiny/json-patch'

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
```

## Api
```typescript
function diff<T>(left: T, right: T, options?: Config): PatchRecord[]
```

## Interface
```typescript
export interface AddedRecord {
  op: 'add'
  paths: (string | number)[]
  value: unknown
}

export interface RemovedRecord {
  op: 'remove'
  paths: (string | number)[]
  value: unknown
}

export interface ReplacedRecord {
  op: 'replace'
  paths: (string | number)[]
  value: unknown
  original: unknown
}

export interface MovedRecord {
  op: 'move'
  paths: (string | number)[]
  to: (string | number)[]
  value: unknown
}
```
