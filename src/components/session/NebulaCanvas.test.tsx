import { render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { sessionGetState, cameraGetState } = vi.hoisted(() => ({
  sessionGetState: vi.fn(() => ({ activeZone: 1 })),
  cameraGetState: vi.fn(() => ({
    detectionState: 'BRUSHING' as const,
    brushVelocitySmoothed: 0,
  })),
}))

vi.mock('../../stores/useSessionStore', () => ({
  useSessionStore: { getState: sessionGetState },
}))

vi.mock('../../stores/useCameraStore', () => ({
  useCameraStore: { getState: cameraGetState },
}))

import { NebulaCanvas } from './NebulaCanvas'

describe('NebulaCanvas', () => {
  beforeEach(() => {
    sessionGetState.mockImplementation(() => ({ activeZone: 1 }))
    cameraGetState.mockImplementation(() => ({
      detectionState: 'BRUSHING' as const,
      brushVelocitySmoothed: 0,
    }))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('rend un canvas plein écran avec accessibilité décorative', async () => {
    const { container } = render(
      <div className="relative h-96 w-96">
        <NebulaCanvas />
      </div>,
    )
    await waitFor(() => {
      expect(container.querySelector('canvas[role="presentation"]')).toBeTruthy()
    })
    const canvas = container.querySelector('canvas')!
    expect(canvas).toHaveAttribute('aria-hidden', 'true')
    expect(canvas.className).toContain('absolute')
    expect(canvas.className).toContain('touch-none')
  })

  it('interroge les stores via getState pendant la boucle animation', async () => {
    render(
      <div className="relative h-32 w-32">
        <NebulaCanvas />
      </div>,
    )
    await waitFor(
      () => {
        expect(sessionGetState.mock.calls.length).toBeGreaterThan(0)
        expect(cameraGetState.mock.calls.length).toBeGreaterThan(0)
      },
      { timeout: 3000 },
    )
  })

})
