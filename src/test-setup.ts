import '@testing-library/jest-dom'

// jsdom n’implémente pas Canvas 2D — stub minimal pour les composants canvas (NebulaCanvas, etc.)
function stubGetContext(this: HTMLCanvasElement, type: string): CanvasRenderingContext2D | null {
  if (type === '2d') {
    return {
      canvas: this,
      fillStyle: '',
      fillRect: () => {},
      setTransform: () => {},
      beginPath: () => {},
      arc: () => {},
      fill: () => {},
    } as unknown as CanvasRenderingContext2D
  }
  return null
}

HTMLCanvasElement.prototype.getContext = stubGetContext as unknown as typeof HTMLCanvasElement.prototype.getContext
