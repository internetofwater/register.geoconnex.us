export async function fetchMarkdownContent(url: string): Promise<string> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`)
  }

  const data = await response.json()
  const markdown = atob(data.content) // Decode content from Base64
  return markdown
}
