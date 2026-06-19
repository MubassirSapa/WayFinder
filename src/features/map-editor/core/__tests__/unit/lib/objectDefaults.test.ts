import { describe, it, expect } from 'vitest'
import { getDefaultDimensions, getObjectColor, OBJECT_CONFIGS } from '../../../lib/objectDefaults'

describe('OBJECT_CONFIGS', () => {
  it('has an entry for every toolbox type', () => {
    const types = [
      'room', 'wall', 'door', 'hallway', 'stairs', 'elevator',
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
