export type CameraStartErrorReason = 'permission-denied' | 'unavailable' | 'unknown'

export interface CameraStartSuccess {
  ok: true
  stream: MediaStream
}

export interface CameraStartFailure {
  ok: false
  reason: CameraStartErrorReason
  error?: unknown
}

export type CameraStartResult = CameraStartSuccess | CameraStartFailure

export async function startSessionCamera(): Promise<CameraStartResult> {
  if (!navigator.mediaDevices?.getUserMedia) {
    return { ok: false, reason: 'unavailable' }
  }

  try {
    // Keep getUserMedia as the immediate sensitive call for iOS user activation.
    const streamPromise = navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' },
      audio: false,
    })
    const stream = await streamPromise
    return { ok: true, stream }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'NotAllowedError') {
      return { ok: false, reason: 'permission-denied', error }
    }
    return { ok: false, reason: 'unknown', error }
  }
}

export function stopSessionCamera(stream: MediaStream | null): void {
  if (!stream) return
  stream.getTracks().forEach((track) => track.stop())
}
