import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, writeFile, rm, readdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { apply } from '../../packages/bundle/web-app/avely/index.mjs'

test('the harness exposes project clips and honors a read-only session for rendering', async t => {
  const root = await mkdtemp(join(tmpdir(), 'ave-session-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  await writeFile(join(root, 'campagna.mp4'), '')
  const registry = new Map()
  const session = { header: { cwd: root } }
  apply({
    tools: { register: definition => registry.set(definition.name, definition) },
    sandboxPolicy: { resolve: request => {
      assert.equal(request.session, session)
      return { mode: 'read-only', workspaceRoot: root }
    } },
  })
  const exec = { agent: { session }, signal: new AbortController().signal }
  assert.deepEqual(JSON.parse(await registry.get('avely_list_clips').execute({}, exec)), ['campagna.mp4'])
  await assert.rejects(registry.get('avely_render_reel').execute({ source: 'campagna.mp4' }, exec), /read-only/)
  assert.deepEqual(await readdir(root), ['campagna.mp4'])
})
