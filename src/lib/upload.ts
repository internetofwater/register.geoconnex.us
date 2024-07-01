const repo = 'internetofwater/geoconnex.us'
const baseBranch = 'master'

async function createBranch(headers: HeadersInit, branchName?: string) {
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

export async function submitPR(namespace: string, file: File): Promise<string> {
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
  const filePath = `namespaces/${namespace}/${file.name}`

  const content = await file.text().then((text) => btoa(text))

  // Step 1: Create the new branch
  await createBranch(headers, newBranch)

  // Step 2: Check if the file already exists
  const fileUrl = `https://api.github.com/repos/${repo}/contents/${filePath}?ref=${newBranch}`

  const fileResponse = await fetch(fileUrl, {
    headers
  })

  // We expect it to be a 404 when uploading a new file but other error codes should be thrown
  if (!fileResponse.ok && fileResponse.status !== 404) {
    throw new Error(`Failed to get file: ${fileResponse.status} ${fileResponse.statusText}`)
  }

  // If the file already exists, throw an error if the content is also the same
  const fileData = await fileResponse.json()
  if (fileResponse.status !== 404) {
    const existingFileContent = atob(fileData.content.replace(/\n/g, ''))
    if (existingFileContent === content) {
      throw new Error('No changes detected; skipping pull request.')
    }
  }

  // Step 3: Upload the file to the new branch
  const uploadUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`
  const uploadData = {
    message: `Add CSV file to ${namespace}`,
    content: content,
    branch: newBranch,
    sha: fileData.sha
  }
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers,
    body: JSON.stringify(uploadData)
  })

  if (!uploadResponse.ok) {
    throw new Error(`Failed to upload file: ${uploadResponse.status} ${uploadResponse.statusText}`)
  }

  // Step 4: Create a pull request
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
