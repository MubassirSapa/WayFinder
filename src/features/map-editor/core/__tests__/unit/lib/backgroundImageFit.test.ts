import { describe, it, expect } from 'vitest'
import { computeBackgroundImageFit } from '../../../lib/backgroundImageFit'

describe('computeBackgroundImageFit', () => {
  it('fills the exact floor bounds for "fill", ignoring aspect ratio', () => {
    const result = computeBackgroundImageFit({
      floorWidth: 1200,
      floorHeight: 800,
      naturalWidth: 2000,
      naturalHeight: 500,
      fit: 'fill',
    })
    expect(result).toEqual({ x: 0, y: 0, width: 1200, height: 800, needsClip: false })
  })

  it('falls back to "fill" behavior when natural dimensions are missing', () => {
    const result = computeBackgroundImageFit({
      floorWidth: 1200,
      floorHeight: 800,
      naturalWidth: null,
      naturalHeight: null,
      fit: 'cover',
    })
    expect(result).toEqual({ x: 0, y: 0, width: 1200, height: 800, needsClip: false })
  })

  it('"contain" letterboxes a wider-than-floor image on the vertical axis', () => {
    // floor ratio = 1.5, image ratio = 2 (wider) -> contain matches width, letterboxes height
    const result = computeBackgroundImageFit({
      floorWidth: 1200,
      floorHeight: 800,
      naturalWidth: 2000,
      naturalHeight: 1000,
      fit: 'contain',
    })
    expect(result.width).toBeCloseTo(1200)
    expect(result.height).toBeCloseTo(600)
    expect(result.x).toBeCloseTo(0)
    expect(result.y).toBeCloseTo(100)
    expect(result.needsClip).toBe(false)
  })

  it('"cover" overflows a wider-than-floor image on the horizontal axis and needs a clip', () => {
    // Same inputs as above but "cover" instead: matches height, overflows width.
    const result = computeBackgroundImageFit({
      floorWidth: 1200,
      floorHeight: 800,
      naturalWidth: 2000,
      naturalHeight: 1000,
      fit: 'cover',
    })
    expect(result.width).toBeCloseTo(1600)
    expect(result.height).toBeCloseTo(800)
    expect(result.x).toBeCloseTo(-200)
    expect(result.y).toBeCloseTo(0)
    expect(result.needsClip).toBe(true)
  })

  it('"contain" matches width when the image is taller-than-floor (narrower ratio)', () => {
    // floor ratio = 1.5, image ratio = 1 (taller/narrower) -> contain matches width
    const result = computeBackgroundImageFit({
      floorWidth: 1200,
      floorHeight: 800,
      naturalWidth: 500,
      naturalHeight: 500,
      fit: 'contain',
    })
    expect(result.width).toBeCloseTo(800)
    expect(result.height).toBeCloseTo(800)
    expect(result.x).toBeCloseTo(200)
    expect(result.y).toBeCloseTo(0)
    expect(result.needsClip).toBe(false)
  })

  it('returns exact floor bounds with no offset when the image matches the floor ratio', () => {
    const result = computeBackgroundImageFit({
      floorWidth: 1200,
      floorHeight: 800,
      naturalWidth: 1500,
      naturalHeight: 1000,
      fit: 'cover',
    })
    expect(result).toEqual({ x: 0, y: 0, width: 1200, height: 800, needsClip: true })
  })

  it('applies offsetX/offsetY on top of the computed centering', () => {
    const result = computeBackgroundImageFit({
      floorWidth: 1200,
      floorHeight: 800,
      naturalWidth: 2000,
      naturalHeight: 1000,
      fit: 'contain',
      offsetX: 25,
      offsetY: -15,
    })
    expect(result.x).toBeCloseTo(25)
    expect(result.y).toBeCloseTo(85)
  })

  it('applies offsetX/offsetY for "fill" too', () => {
    const result = computeBackgroundImageFit({
      floorWidth: 1200,
      floorHeight: 800,
      naturalWidth: 2000,
      naturalHeight: 500,
      fit: 'fill',
      offsetX: 10,
      offsetY: 20,
    })
    expect(result).toEqual({ x: 10, y: 20, width: 1200, height: 800, needsClip: false })
  })
})
