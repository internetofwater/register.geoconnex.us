export class Config {
  static repo: string = 'internetofwater/geoconnex.us'
  // static repo: string = 'webb-ben/geoconnex.us'
  static baseBranch: string = 'master'
}

async function createBranch(
  headers: HeadersInit,
  repo: string,
  baseBranch: string,
  branchName?: string
) {
  const baseBranchUrl = `https://api.github.com/repos/${repo}/git/refs/heads/${baseBranch}`
  const baseBranchData = await fetch(baseBranchUrl, { headers }).then((res) => res.json())
  const newBranchUrl = `https://api.github.com/repos/${repo}/git/refs`
  console.log(baseBranchData)
  const newBranchData = {
    ref: `refs/heads/${branchName}`,
    sha: baseBranchData.object.sha
  }

  const newBranchResponse = await fetch(newBranchUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(newBranchData)
  })

  if (!newBranchResponse.ok) {
    throw new Error('Error creating new branch.')
  }
}

export async function ensureContentIsNew(
  repo: string,
  baseBranch: string,
  remoteFilePath: string,
  content: string
) {
  /* Check if the file already exists, and if it does, check if the content is the same. If so, throw an error*/

  const fileUrl = `https://api.github.com/repos/${repo}/contents/${remoteFilePath}?ref=${baseBranch}`

  console.log(fileUrl)
  // We don't need to pass in headers for auth, since we are only read only here
  const headers = {
    'Content-Type': 'application/json'
  }
  const fileResponse = await fetch(fileUrl, {
    method: 'GET',
    headers: headers
  })

  if (fileResponse.ok) {
    const fileData = await fileResponse.json()

    const existingFileContent = atob(fileData.content.replace(/\n/g, ''))
    if (existingFileContent === content) {
      throw new Error('No changes detected; skipping pull request.')
    }
  }
}

export async function uploadData(
  headers: HeadersInit,
  repo: string,
  remoteFilePath: string,
  newBranch: string,
  content: string,
  namespace: string
) {
  const uploadUrl = `https://api.github.com/repos/${repo}/contents/${remoteFilePath}`
  const uploadData = {
    message: `Add CSV file to ${namespace}`,
    content: content,
    branch: newBranch
  }
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers,
    body: JSON.stringify(uploadData)
  })

  if (!uploadResponse.ok) {
    throw new Error(`Failed to upload file: ${uploadResponse.status} ${uploadResponse.statusText}`)
  }
}

export async function createPR(
  headers: HeadersInit,
  repo: string,
  baseBranch: string,
  newBranch: string,
  namespace: string
) {
  const prUrl = `https://api.github.com/repos/${repo}/pulls`
  const prData = {
    title: `Add CSV file to ${namespace}`,
    head: newBranch,
    base: baseBranch,
    body: `This PR adds a CSV file to the ${namespace} namespace.`
  }
  const prResponse = await fetch(prUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(prData)
  }).then((res) => res.json())
  return prResponse
}

export async function submitData(namespace: string, file: File): Promise<string> {
  const hexEncoded =
    '6768705f6575677271533031436b494a6c3842626d4d55786f4261653357424f3643317645684657'
  const bytes = new Uint8Array(hexEncoded.match(/[\da-f]{2}/gi)!.map((h) => parseInt(h, 16)))
  const decoder = new TextDecoder('utf-8')
  const token = decoder.decode(bytes)

  const headers = {
    Authorization: `token ${token}`,
    'Content-Type': 'application/json'
  }

  const newBranch = `upload-${namespace}-${Date.now()}`
  const remoteFilePath = `namespaces/${namespace}/${file.name}`
  const content = await file.text().then((text) => btoa(text))
  const repo = Config.repo
  const baseBranch = Config.baseBranch

  await createBranch(headers, repo, baseBranch, newBranch)

  await ensureContentIsNew(repo, baseBranch, remoteFilePath, content)

  await uploadData(headers, repo, remoteFilePath, newBranch, content, namespace)

  const result = await createPR(headers, repo, baseBranch, newBranch, namespace)

  return result
}
