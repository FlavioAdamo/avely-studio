import { execFile } from "node:child_process"
import { promisify } from "node:util"
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { randomUUID } from 'node:crypto'
import { mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { once } from 'node:events'
import test from 'node:test'
import { serve } from '../profiles/avely-studio/bridge.mjs'
import { createMedia } from '../../packages/bundle/web-app/avely/media.mjs'

test('folder selection excludes nested paths and symlinks', async t => {
  const folder = await mkdtemp(join(tmpdir(), 'studio-media-'))
  t.after(() => rm(folder, { recursive: true, force: true }))
  await writeFile(join(folder, 'clip.mp4'), '')
  await symlink('clip.mp4', join(folder, 'alias.mov'))
  const execute = await createMedia(folder, join(folder, 'exports'))
  const signal = new AbortController().signal
  const { document } = await execute('canvas.read', {}, signal)
  assert.deepEqual(document.sources, ['clip.mp4'])
  for (const source of ['../clip.mp4', 'alias.mov']) {
    await assert.rejects(execute('video.render', { source }, signal))
  }
  await assert.rejects(execute('video.render', { source: 'clip.mp4', duration: 61 }, signal))
  await assert.rejects(execute('video.render', { source: 'clip.mp4' }, signal))
  assert.equal((await readFile(join(folder, 'clip.mp4'))).length, 0)
})

test('a refused heartbeat cancels the active job and detaches without posting its result', async t => {
  const id = randomUUID()
  const lease_id = randomUUID()
  const chat = randomUUID()
  const profile = randomUUID()
  const requests = []
  const settings = { chat, profile, token: 'test-token' }
  const server = createServer(async (req, res) => {
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    const body = JSON.parse(Buffer.concat(chunks))
    requests.push({ method: req.method, url: req.url, body, auth: req.headers.authorization })
    if (body.lease_id) res.statusCode = 409
    res.end(JSON.stringify({ job: { id, lease_id, operation: 'video.render', arguments: {},
      expires_at: new Date(Date.now() + 30000).toISOString() } }))
  })
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  t.after(() => { server.closeAllConnections(); server.close() })
  settings.origin = 'http://127.0.0.1:' + server.address().port
  let executions = 0
  await assert.rejects(serve(settings, async (operation, args, signal) => {
    executions++
    await once(signal, 'abort')
    signal.throwIfAborted()
  }, new AbortController().signal), /409/)
  assert.equal(executions, 1)
  const base = '/api/agent/v1/harness/chats/' + chat + '/canvas/'
  assert.deepEqual(requests.map(r => [r.method, r.url]), [
    ['PUT', base], ['POST', base + 'poll/'], ['POST', base + 'poll/'], ['DELETE', base],
  ])
  assert.equal(requests[2].body.job_id, id)
  assert.equal(requests[2].body.lease_id, lease_id)
  assert.equal(new Set(requests.map(r => r.body.connection_id)).size, 1)
  assert.ok(requests.every(r => r.auth === 'Device test-token'))
})

test('exports a vertical draft with timed captions and a JPEG cover', async t => {
  const folder = await mkdtemp(join(tmpdir(), 'studio-render-'))
  t.after(() => rm(folder, { recursive: true, force: true }))
  const run = promisify(execFile)
  await run('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'color=c=teal:s=320x180:r=24:d=2',
    '-threads', '1', join(folder, 'clip.mp4')])
  const output = join(folder, 'exports')
  const execute = await createMedia(folder, output)
  const result = await execute('video.render', {
    source: 'clip.mp4', duration: 1, start: 0.5,
    subtitles: [{ start: 0, end: 0.5, text: 'Prima' }, { start: 0.5, end: 1, text: 'Dopo' }],
  }, new AbortController().signal)
  for (const [file, codec] of [[result.video, 'h264'], [result.cover, 'mjpeg']]) {
    const { stdout } = await run('ffprobe', ['-v', 'error', '-show_entries',
      'stream=width,height,codec_name', '-of', 'json', join(output, file)])
    assert.deepEqual(JSON.parse(stdout).streams, [{ width: 540, height: 960, codec_name: codec }])
  }
})
