export const GET = 'GET'
export const POST = 'POST'
export const PUT = 'PUT'
export const PATCH = 'PATCH'
export const DELETE = 'DELETE'
export const BACKEND_BASE_URL = import.meta.env.BACKEND_BASE_URL || 'http://localhost:8888/.netlify/functions'
export const DEEPSEEK_URL = `${BACKEND_BASE_URL}/deepseek`
export const ELEVENLABS_TTS_URL = `${BACKEND_BASE_URL}/tts`