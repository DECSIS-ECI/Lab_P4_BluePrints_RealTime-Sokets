import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.jsx'
import { createBlueprint, deleteBlueprint, getBlueprint, getByAuthor, updateBlueprint } from './lib/blueprintsApi.js'

vi.mock('./lib/auth.js', () => ({
  getStoredSession: vi.fn(() => ({ username: 'ana', scopes: ['blueprints.write'] })),
  login: vi.fn(),
  logout: vi.fn(),
}))

vi.mock('./lib/blueprintsApi.js', () => ({
  createBlueprint: vi.fn(),
  deleteBlueprint: vi.fn(),
  getBlueprint: vi.fn(),
  getByAuthor: vi.fn(),
  updateBlueprint: vi.fn(),
}))

vi.mock('./lib/stompClient.js', () => ({
  createStompClient: vi.fn(() => ({ activate: vi.fn(), deactivate: vi.fn(), connected: false })),
  subscribeBlueprint: vi.fn(),
}))

describe('BluePrints workspace', () => {
  afterEach(() => cleanup())

  beforeEach(() => {
    vi.clearAllMocks()
    getByAuthor.mockResolvedValue([{ name: 'plano-1', totalPoints: 2 }])
    getBlueprint.mockResolvedValue({ points: [{ x: 10, y: 10 }, { x: 50, y: 50 }] })
  })

  it('shows the author panel and reduces the total points', async () => {
    render(<App />)

    expect(await screen.findByText('Planos de juan')).toBeInTheDocument()
    expect(screen.getByText('Total de puntos').parentElement).toHaveTextContent('2')
    expect(screen.getByText('2 puntos activos')).toBeInTheDocument()
  })

  it('sends the current canvas points with Save / update', async () => {
    render(<App />)
    const updateButton = await screen.findByRole('button', { name: /guardar \/ actualizar/i })

    fireEvent.click(updateButton)
    await waitFor(() => expect(updateBlueprint).toHaveBeenCalledWith('juan', 'plano-1', [{ x: 10, y: 10 }, { x: 50, y: 50 }]))
    expect(screen.getByRole('status')).toHaveTextContent('actualizado')
    expect(createBlueprint).not.toHaveBeenCalled()
    expect(deleteBlueprint).not.toHaveBeenCalled()
  })
})