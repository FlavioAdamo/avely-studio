import { createMedia } from '../../../packages/bundle/web-app/avely/media.mjs'
import { serve } from './bridge.mjs'

export const name = 'avely-studio'
export const inject = ['appReady', 'appExit']

export function apply(ctx) {
  const env = process.env
  if (!env.AVE_INPUT || !env.AVE_OUTPUT) throw new Error('Select the source and export folders')
  const controller = new AbortController()
  const exit = ctx.get('appExit')
  async function run() {
    const execute = await createMedia(env.AVE_INPUT, env.AVE_OUTPUT)
    if (env.AVE_LOCAL_SOURCE) {
      const result = await execute('video.render', {
        source: env.AVE_LOCAL_SOURCE, start: Number(env.AVE_START || 0),
        duration: Number(env.AVE_DURATION || 15), caption: env.AVE_CAPTION || '',
      }, controller.signal)
      console.log(JSON.stringify(result))
      return
    }
    await serve({ origin: env.AVE_AGENT_ORIGIN, chat: env.AVE_CHAT_ID, profile: env.AVE_PROFILE_ID,
      token: env.AVE_DEVICE_TOKEN }, execute, controller.signal)
  }
  let worker
  ctx.effect(() => ctx.appReady.onReady(() => {
    worker = run()
    worker.then(() => exit(0), error => {
      if (!controller.signal.aborted) {
        // FFmpeg errors contain its argv, including the user's local media path.
        console.error('Ave Studio:', error.cmd ? 'The clip could not be exported.' : error.message)
        exit(1)
      }
    })
  }))
  ctx.effect(() => async () => {
    controller.abort()
    await worker?.catch(() => {})
  })
}
