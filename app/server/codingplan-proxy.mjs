import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'

const CONFIG_PATH = process.env.ZIWEI_CODINGPLAN_CONFIG || '/etc/ziwei/codingplan.env'
const PORT = Number(process.env.PORT || 8787)

function readConfig() {
  const config = {
    CODINGPLAN_API_KEY: '',
    CODINGPLAN_OPENAI_BASE: 'https://coding.dashscope.aliyuncs.com/v1',
    CODINGPLAN_ANTHROPIC_BASE: 'https://coding.dashscope.aliyuncs.com/apps/anthropic',
  }

  try {
    const content = readFileSync(CONFIG_PATH, 'utf8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const index = trimmed.indexOf('=')
      if (index === -1) continue
      const key = trimmed.slice(0, index).trim()
      const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, '')
      if (key in config) config[key] = value
    }
  } catch {
    // Keep defaults and return a useful error per request.
  }

  return config
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  })
  res.end(JSON.stringify(payload))
}

function cleanBaseUrl(baseUrl) {
  return baseUrl.replace(/\/+$/, '')
}

function getTarget(req, config) {
  const url = new URL(req.url || '/', 'http://localhost')

  if (url.pathname.startsWith('/openai/')) {
    return {
      provider: 'openai',
      url: `${cleanBaseUrl(config.CODINGPLAN_OPENAI_BASE)}${url.pathname.replace(/^\/openai/, '')}${url.search}`,
    }
  }

  if (url.pathname.startsWith('/anthropic/')) {
    return {
      provider: 'anthropic',
      url: `${cleanBaseUrl(config.CODINGPLAN_ANTHROPIC_BASE)}${url.pathname.replace(/^\/anthropic/, '')}${url.search}`,
    }
  }

  return null
}

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  const config = readConfig()
  const apiKey = config.CODINGPLAN_API_KEY

  if (!apiKey || apiKey.includes('填')) {
    sendJson(res, 500, {
      error: 'CODINGPLAN_API_KEY is not configured on the server.',
      configPath: CONFIG_PATH,
    })
    return
  }

  const target = getTarget(req, config)
  if (!target) {
    sendJson(res, 404, { error: 'Unknown proxy path.' })
    return
  }

  try {
    const headers = new Headers()
    for (const [key, value] of Object.entries(req.headers)) {
      if (!value || key.toLowerCase() === 'host') continue
      if (Array.isArray(value)) {
        headers.set(key, value.join(', '))
      } else {
        headers.set(key, value)
      }
    }

    if (target.provider === 'openai') {
      headers.set('authorization', `Bearer ${apiKey}`)
    } else {
      headers.set('x-api-key', apiKey)
      headers.set('anthropic-version', headers.get('anthropic-version') || '2023-06-01')
    }

    const upstream = await fetch(target.url, {
      method: req.method,
      headers,
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : req,
      duplex: 'half',
    })

    const responseHeaders = {}
    upstream.headers.forEach((value, key) => {
      if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
        responseHeaders[key] = value
      }
    })
    responseHeaders['cache-control'] = 'no-store'

    res.writeHead(upstream.status, responseHeaders)

    if (!upstream.body) {
      res.end()
      return
    }

    for await (const chunk of upstream.body) {
      res.write(chunk)
    }
    res.end()
  } catch (error) {
    sendJson(res, 502, {
      error: 'Coding Plan proxy request failed.',
      message: error instanceof Error ? error.message : String(error),
    })
  }
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Ziwei Coding Plan proxy listening on http://127.0.0.1:${PORT}`)
})
