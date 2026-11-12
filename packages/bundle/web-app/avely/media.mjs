import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { opendir, realpath, mkdir, mkdtemp, rm, writeFile, stat } from 'node:fs/promises'
import { basename, join } from 'node:path'

const exec = promisify(execFile)
const mediaName = /\.(mp4|mov|m4v)$/i
const cueSchema = {
  type: 'object', additionalProperties: false, required: ['start', 'end', 'text'],
  properties: { start: { type: 'number', minimum: 0 }, end: { type: 'number', maximum: 60 },
    text: { type: 'string', minLength: 1, maxLength: 160 } },
}
export const renderSchema = {
  type: 'object', additionalProperties: false, required: ['source'],
  properties: {
    source: { type: 'string', description: 'A filename returned by canvas.read' },
    start: { type: 'number', minimum: 0, default: 0 },
    duration: { type: 'number', minimum: 1, maximum: 60, default: 15 },
    subtitles: { type: 'array', maxItems: 32, items: cueSchema, description: 'Ordered, non-overlapping cues timed from the beginning of the exported clip, in seconds' },
    caption: { type: 'string', maxLength: 160, description: 'Optional text shown throughout the clip' },
  },
}
const tools = [
  { name: 'canvas.read', inputSchema: { type: 'object', additionalProperties: false } },
  { name: 'video.render', inputSchema: renderSchema },
]

export async function createMedia(input, output) {
  const root = await realpath(input)
  if (!(await stat(root)).isDirectory()) throw new Error('Choose an input folder')
  await mkdir(output, { recursive: true, mode: 0o700 })
  const destination = await realpath(output)
  async function sources() {
    const names = []
    for await (const entry of await opendir(root)) {
      if (entry.isFile() && mediaName.test(entry.name)) names.push(entry.name)
      if (names.length === 64) break
    }
    return names.sort()
  }
  return async function execute(operation, args, signal) {
    signal.throwIfAborted()
    if (operation === 'canvas.read') return { document: { sources: await sources() }, tools }
    if (operation !== 'video.render') throw new Error('Unsupported canvas operation')
    const { source, start = 0, duration = 15, caption = '', subtitles = [] } = args
    if (Object.keys(args).some(key => !(Object.hasOwn(renderSchema.properties, key))) ||
        typeof source !== 'string' || !mediaName.test(source) || /[/\\\x00]/.test(source) ||
        (process.platform === 'win32' && /[:]/.test(source)) ||
        !Number.isFinite(start) || start < 0 || !Number.isFinite(duration) || duration < 1 || duration > 60 ||
        typeof caption !== 'string' || caption.length > 160 || caption.includes('\0')) {
      throw new Error('Invalid reel settings')
    }
    if (!Array.isArray(subtitles) || subtitles.length > 32 || (caption && subtitles.length)) {
      throw new Error('Choose a fixed caption or timed subtitles')
    }
    let lastEnd = 0
    for (const cue of subtitles) {
      if (!cue || Object.keys(cue).some(key => !Object.hasOwn(cueSchema.properties, key)) ||
          !Number.isFinite(cue.start) || !Number.isFinite(cue.end) || cue.start < lastEnd ||
          cue.end <= cue.start || cue.end > duration || typeof cue.text !== 'string' ||
          !cue.text.trim() || cue.text.length > 160 || cue.text.includes('\0')) {
        throw new Error('Invalid subtitle timing or text')
      }
      lastEnd = cue.end
    }
    const sourcePath = join(root, source)
    if (await realpath(sourcePath) !== sourcePath || !(await stat(sourcePath)).isFile()) throw new Error('Choose a regular media file')
    const folder = await mkdtemp(join(destination, 'Reel-'))
    try {
      const options = { cwd: folder, signal, killSignal: 'SIGKILL', maxBuffer: 64 * 1024,
        env: { PATH: process.env.PATH, SystemRoot: process.env.SystemRoot } }
      // Force the container demuxer. External MOV data references are disabled by default.
      const inputArgs = ['-protocol_whitelist', 'file', '-f', 'mov', '-threads', '1', '-max_pixels', '16777216', '-ss', String(start), '-i', sourcePath]
      const filters = ['fps=24', 'crop=min(iw\\,ih*9/16):min(ih\\,iw*16/9)', 'scale=540:960', 'setsar=1']
      const cues = caption.trim() ? [{ start: 0, end: duration, text: caption }] : subtitles
      for (const [index, cue] of cues.entries()) {
        const file = 'caption-' + index + '.txt'
        const lines = cue.text.trim().match(/.{1,26}(?:\s|$)|.{1,26}/gu) || []
        await writeFile(join(folder, file), lines.map(line => line.trim()).join('\n'), { mode: 0o600 })
        const timing = "enable='gte(t," + cue.start + ")*lt(t," + cue.end + ")'"
        filters.push('drawtext=textfile=' + file + ':expansion=none:fontsize=26:fontcolor=white:box=1:boxcolor=black@0.65:x=(w-tw)/2:y=h*0.85-th:' + timing)
      }
      const prefix = ['-nostdin', '-hide_banner', '-loglevel', 'error', '-filter_threads', '1']
      await exec('ffmpeg', [...prefix, ...inputArgs, '-t', String(duration), '-map', '0:v:0', '-map', '0:a:0?',
        '-vf', filters.join(','), '-map_metadata', '-1', '-c:v', 'libx264', '-threads', '1',
        '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-threads:a', '1', '-movflags', '+faststart', 'reel.mp4'], options)
      await exec('ffmpeg', [...prefix, '-threads', '1', '-i', 'reel.mp4', '-frames:v', '1', '-threads', '1', 'cover.jpg'], options)
      await stat(join(folder, 'cover.jpg'))
      for (const index of cues.keys()) await rm(join(folder, 'caption-' + index + '.txt'))
      signal.throwIfAborted()
      return { video: basename(folder) + '/reel.mp4', cover: basename(folder) + '/cover.jpg' }
    } catch (error) {
      await rm(folder, { recursive: true, force: true })
      throw error
    }
  }
}
