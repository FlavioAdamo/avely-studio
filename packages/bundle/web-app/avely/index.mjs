import { realpath } from 'node:fs/promises'
import { createMedia, renderSchema } from './media.mjs'

export const inject = ['tools', 'sandboxPolicy']
let rendering = false

export function apply(ctx) {
  const output = {
    schema: { type: 'string' },
    render: (_args, text) => [{ type: 'text', text }],
  }
  async function media(exec, write) {
    if (!exec.agent) throw new Error('Open a conversation and select a project folder.')
    const policy = ctx.sandboxPolicy.resolve({ session: exec.agent.session })
    if (write && policy.mode === 'read-only') throw new Error('The project is read-only.')
    if (!exec.agent.session.header.cwd) throw new Error('Select a project folder before using local clips.')
    const folder = await realpath(policy.workspaceRoot)
    return createMedia(folder, folder)
  }
  ctx.tools.register({
    name: 'avely_list_clips',
    description: 'List the MP4 and MOV clips in the current project folder.',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
    output,
    async execute(args, exec) {
      const execute = await media(exec, false)
      const { document } = await execute('canvas.read', args, exec.signal)
      return JSON.stringify(document.sources)
    },
  })
  ctx.tools.register({
    name: 'avely_render_reel',
    description: 'Make a 9:16 MP4 draft and JPEG cover in a new subfolder of the current project. Returns relative paths.',
    parameters: renderSchema, output, timeoutMs: 150000,
    async execute(args, exec) {
      if (rendering) throw new Error('Another reel is being exported. Try again when it finishes.')
      rendering = true
      try {
        const execute = await media(exec, true)
        return JSON.stringify(await execute('video.render', args, exec.signal))
      } finally {
        rendering = false
      }
    },
  })
}
