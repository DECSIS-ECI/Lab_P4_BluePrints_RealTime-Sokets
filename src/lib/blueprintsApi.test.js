import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from './apiClient.js'
import { getByAuthor, updateBlueprint } from './blueprintsApi.js'

vi.mock('./apiClient.js', () => ({
  default: { get: vi.fn(), put: vi.fn() },
}))

describe('blueprints API', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lists blueprints using the author query parameter', async () => {
    api.get.mockResolvedValue({ data: { data: [{ name: 'plano-1', totalPoints: 3 }] } })

    await expect(getByAuthor('ana rios')).resolves.toEqual([{ name: 'plano-1', totalPoints: 3 }])
    expect(api.get).toHaveBeenCalledWith('/blueprints', { params: { author: 'ana rios' } })
  })

  it('updates all points through the documented PUT endpoint', async () => {
    api.put.mockResolvedValue({ data: { data: { name: 'plano-1', points: [{ x: 10, y: 20 }] } } })

    await updateBlueprint('ana rios', 'plano-1', [{ x: 10, y: 20 }])
    expect(api.put).toHaveBeenCalledWith('/blueprints/ana%20rios/plano-1', { points: [{ x: 10, y: 20 }] })
  })
})