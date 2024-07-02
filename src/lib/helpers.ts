export async function fetchMarkdownContent(url: string): Promise<string> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`)
  }

  const data = await response.json()
  const markdown = atob(data.content) // Decode content from Base64
  return markdown
}

export interface MarkdownSection {
  sectionName: string
  body: string
}

export function generateReadMe(title: string, rawInput: MarkdownSection[]): string {
  let output = `# ${title}\n\n`

  for (const section of rawInput) {
    output += `## ${section.sectionName}\n\n${section.body}\n\n`
  }
  return output
}
