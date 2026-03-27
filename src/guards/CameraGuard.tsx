export async function checkCameraPermission(): Promise<PermissionState> {
  try {
    const result = await navigator.permissions.query({ name: 'camera' as PermissionName })
    return result.state
  } catch {
    // navigator.permissions non supporté ou 'camera' non reconnu
    // → on laisse passer (getUserMedia validera au moment du tap)
    return 'prompt'
  }
}
