import { ensureContentIsNew, Config } from '../upload'
import fs from 'node:fs'
import path from 'node:path'
import { test, expect } from 'vitest'

await test('ensureFileIsNew', async () => {
  const headers = {
    Authorization: 'CHANGE_ME',
    'Content-Type': 'application/json'
  }
  const repo = Config.repo
  const baseBranch = Config.baseBranch
  const remoteFilePath = 'namespaces/SELFIE_ids/SELFIE_ids.csv'
  const filePath = path.join(__dirname, 'SELFIE_ids.csv')

  let content = ''
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err)
      return
    }
    content = data
  })

  expect(() => {
    ensureContentIsNew(headers, repo, baseBranch, remoteFilePath, content)
  }).toThrow(Error('No changes detected; skipping pull request.'))
})
