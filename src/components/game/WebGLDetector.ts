let cachedResult: boolean | null = null;

export function isWebGLAvailable(): boolean {
  if (cachedResult !== null) return cachedResult;

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    cachedResult = !!gl;
  } catch {
    cachedResult = false;
  }
  return cachedResult;
}
