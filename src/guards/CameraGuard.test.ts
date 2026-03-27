import { checkCameraPermission } from './CameraGuard'

describe('checkCameraPermission', () => {
  const mockQuery = vi.fn()

  beforeEach(() => {
    Object.defineProperty(navigator, 'permissions', {
      value: { query: mockQuery },
      configurable: true,
    })
  })

  it('retourne "granted" si la permission est accordée', async () => {
    mockQuery.mockResolvedValue({ state: 'granted' })
    expect(await checkCameraPermission()).toBe('granted')
  })

  it('retourne "denied" si la permission est refusée', async () => {
    mockQuery.mockResolvedValue({ state: 'denied' })
    expect(await checkCameraPermission()).toBe('denied')
  })

  it('retourne "prompt" si navigator.permissions n\'est pas supporté', async () => {
    mockQuery.mockRejectedValue(new Error('not supported'))
    expect(await checkCameraPermission()).toBe('prompt')
  })
})
