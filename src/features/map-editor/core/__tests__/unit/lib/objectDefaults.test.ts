import { describe, it, expect } from 'vitest'
import { getDefaultDimensions, getDefaultObjectName, getObjectColor, OBJECT_CATEGORIES, OBJECT_CONFIGS } from '../../../lib/objectDefaults'
import type { EditorMapObject } from '../../../types/map.types'

function makeObject(overrides: Partial<EditorMapObject> & { id: string; type: EditorMapObject['type'] }): EditorMapObject {
  return {
    buildingId: 'b1', floorId: 'f1', height: 100, isAccessible: true, isSearchable: true,
    label: '', name: '', parentObjectId: null, rotation: 0, width: 100, x: 0, y: 0,
    ...overrides,
  }
}

describe('OBJECT_CONFIGS', () => {
  it('has an entry for every toolbox type', () => {
    const types = [
      'room', 'wall', 'door', 'hallway', 'stairs', 'elevator', 'escalator',
      'washroom', 'exit', 'poi', 'aisle', 'shelf', 'section',
    ]
    for (const type of types) {
      expect(OBJECT_CONFIGS).toHaveProperty(type)
    }
  })

  it('every entry has positive defaultWidth and defaultHeight', () => {
    for (const [, config] of Object.entries(OBJECT_CONFIGS)) {
      expect(config.defaultWidth).toBeGreaterThan(0)
      expect(config.defaultHeight).toBeGreaterThan(0)
    }
  })
})

describe('getDefaultDimensions', () => {
  it('returns correct dimensions for room', () => {
    expect(getDefaultDimensions('room')).toEqual({ width: 120, height: 100 })
  })

  it('returns correct dimensions for hallway', () => {
    expect(getDefaultDimensions('hallway')).toEqual({ width: 240, height: 60 })
  })

  it('returns correct dimensions for wall', () => {
    expect(getDefaultDimensions('wall')).toEqual({ width: 200, height: 20 })
  })
})

describe('getObjectColor', () => {
  it('returns fill, stroke, and color for each type', () => {
    const result = getObjectColor('room')
    expect(result).toHaveProperty('fill')
    expect(result).toHaveProperty('stroke')
    expect(result).toHaveProperty('color')
  })

  it('returns non-empty strings', () => {
    for (const type of Object.keys(OBJECT_CONFIGS) as Array<keyof typeof OBJECT_CONFIGS>) {
      const { fill, stroke, color } = getObjectColor(type)
      expect(fill.length).toBeGreaterThan(0)
      expect(stroke.length).toBeGreaterThan(0)
      expect(color.length).toBeGreaterThan(0)
    }
  })
})

describe('OBJECT_CATEGORIES', () => {
  it('covers every toolbox object type exactly once', () => {
    const allTypes = Object.keys(OBJECT_CONFIGS)
    const categorizedTypes = OBJECT_CATEGORIES.flatMap((category) => category.types)

    expect(categorizedTypes.sort()).toEqual([...allTypes].sort())
    expect(new Set(categorizedTypes).size).toBe(categorizedTypes.length)
  })

  it('has a unique id and non-empty label for every category', () => {
    const ids = OBJECT_CATEGORIES.map((category) => category.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const category of OBJECT_CATEGORIES) {
      expect(category.label.length).toBeGreaterThan(0)
    }
  })
})

describe('getDefaultObjectName', () => {
  it('numbers the first object of a type as 1', () => {
    expect(getDefaultObjectName('room', [])).toBe('Room 1')
  })

  it('numbers after existing objects of the same type', () => {
    const existing = [
      makeObject({ id: 'o1', type: 'room' }),
      makeObject({ id: 'o2', type: 'room' }),
    ]
    expect(getDefaultObjectName('room', existing)).toBe('Room 3')
  })

  it('counts each type independently', () => {
    const existing = [
      makeObject({ id: 'o1', type: 'room' }),
      makeObject({ id: 'o2', type: 'door' }),
      makeObject({ id: 'o3', type: 'door' }),
    ]
    expect(getDefaultObjectName('room', existing)).toBe('Room 2')
    expect(getDefaultObjectName('door', existing)).toBe('Door 3')
    expect(getDefaultObjectName('elevator', existing)).toBe('Elevator 1')
  })
})
