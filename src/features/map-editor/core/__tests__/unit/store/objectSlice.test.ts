import { describe, it, expect, beforeEach } from 'vitest'
import { makeStore } from './makeStore'
import type { EditorMapObject } from '../../../types/map.types'

const OBJ: EditorMapObject = {
  id: 'temp_obj_1', floorId: 'f1', buildingId: 'b1', parentObjectId: null,
  type: 'room', name: 'Room A', label: 'A', x: 0, y: 0, width: 100, height: 80,
  rotation: 0, isSearchable: true, isAccessible: true,
}

describe('ObjectSlice', () => {
  let store: ReturnType<typeof makeStore>
  beforeEach(() => { store = makeStore() })

  it('starts with no objects', () => {
    expect(store.getState().objects).toEqual({})
  })

  it('addObject stores object by id and marks dirty', () => {
    store.getState().addObject(OBJ)
    expect(store.getState().objects['temp_obj_1']).toMatchObject({ id: 'temp_obj_1', type: 'room' })
    expect(store.getState().isDirty).toBe(true)
  })

  it('updateObject patches fields', () => {
    store.getState().addObject(OBJ)
    store.getState().updateObject('temp_obj_1', { label: 'B', x: 50 })
    const obj = store.getState().objects['temp_obj_1']
    expect(obj.label).toBe('B')
    expect(obj.x).toBe(50)
    expect(obj.name).toBe('Room A') // untouched
  })

  it('moveObject updates x and y', () => {
    store.getState().addObject(OBJ)
    store.getState().moveObject('temp_obj_1', 200, 300)
    const obj = store.getState().objects['temp_obj_1']
    expect(obj.x).toBe(200)
    expect(obj.y).toBe(300)
  })

  it('removeObject deletes by id', () => {
    store.getState().addObject(OBJ)
    store.getState().removeObject('temp_obj_1')
    expect(store.getState().objects['temp_obj_1']).toBeUndefined()
  })

  it('setObjects replaces the entire record', () => {
    store.getState().addObject(OBJ)
    const obj2 = { ...OBJ, id: 'temp_obj_2', name: 'Room B' }
    store.getState().setObjects([obj2])
    expect(store.getState().objects).not.toHaveProperty('temp_obj_1')
    expect(store.getState().objects).toHaveProperty('temp_obj_2')
  })
})
