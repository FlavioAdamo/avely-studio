import { randomUUID } from 'node:crypto'
import { setTimeout as delay } from 'node:timers/promises'

const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i

export async function serve(settings, execute, stopped) {
  const { origin, token, chat, profile } = settings
  const url = new URL(origin)
  if (url.origin !== origin || !(url.protocol === 'https:' ||
      (url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)))) {
    throw new Error('Configure an HTTPS agent origin or local development server')
  }
  if (!uuid.test(chat) || !uuid.test(profile) || !token) throw new Error('Configure a paired device, profile and chat')
  const base = new URL('/api/agent/v1/harness/chats/' + chat + '/canvas/', url)
  const connection_id = randomUUID()
  async function request(method, path, body, signal = stopped) {
    const res = await fetch(new URL(path, base), {
      method, redirect: 'error',
      headers: { Authorization: 'Device ' + token, 'X-Profile-Id': profile, 'Content-Type': 'application/json' },
      body: JSON.stringify({ connection_id, ...body }),
      signal: AbortSignal.any([signal, AbortSignal.timeout(5000)]),
    })
    if (!res.ok) throw new Error('Canvas HTTP ' + res.status)
    return res.status === 204 ? null : res.json()
  }
  await request('PUT', '', { context: { brief: 'Ave Studio: canvas.read lists local clips and video.render prepares a vertical reel and cover.' } })
  try {
    while (!stopped.aborted) {
      const { job } = await request('POST', 'poll/', {})
      if (!job) {
        await delay(2000, undefined, { signal: stopped })
        continue
      }
      if (!uuid.test(job.id) || !uuid.test(job.lease_id)) throw new Error('Invalid canvas lease')
      const remaining = Date.parse(job.expires_at) - Date.now()
      if (!Number.isFinite(remaining) || remaining <= 0) throw new Error('Expired canvas lease')
      const controller = new AbortController()
      const active = AbortSignal.any([stopped, controller.signal, AbortSignal.timeout(Math.min(150000, remaining))])
      const lease = { job_id: job.id, lease_id: job.lease_id }
      const heartbeat = async () => {
        while (!active.aborted) {
          await delay(10000, undefined, { signal: active })
          const reply = await request('POST', 'poll/', lease, active)
          if (reply.job?.id !== job.id || reply.job.lease_id !== job.lease_id) throw new Error('Canvas lease revoked')
        }
      }
      const renew = heartbeat().catch(error => controller.abort(error))
      try {
        let payload
        try {
          payload = { result: await execute(job.operation, job.arguments, active) }
        } catch {
          payload = { error: { code: 'studio_video', detail: 'Could not prepare this draft. Check the source, clip range and available operations.' } }
        }
        active.throwIfAborted()
        await request('POST', 'jobs/' + job.id + '/result/', { lease_id: job.lease_id, ...payload }, active)
      } finally {
        controller.abort()
        await renew
      }
    }
  } finally {
    await request('DELETE', '', {}, AbortSignal.timeout(5000)).catch(() => {})
  }
}
