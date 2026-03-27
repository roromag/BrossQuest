import { describe, it, expect } from 'vitest'
import { createMemoryHistory, createRouter } from '@tanstack/react-router'
import { rootRoute } from './routes/__root'

describe('Router', () => {
  it('crée le routeur sans erreur', () => {
    const router = createRouter({
      routeTree: rootRoute.addChildren([]),
      history: createMemoryHistory({ initialEntries: ['/'] }),
    })
    expect(router).toBeDefined()
  })
})
