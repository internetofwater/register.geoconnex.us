import Papa from 'papaparse'

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

export function validGeoconnexCSV(file: File): [boolean, string] {
  const oneToOneColumns = ['id', 'target', 'creator', 'description']
  const oneToOneColumnLength = 4

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
      const columns = results.meta.fields

      if (!columns || columns.length === 0) {
        return [false, 'No columns found in CSV']
      }

      if (columns.length === oneToOneColumnLength) {
        for (const requiredColumn of oneToOneColumns) {
          if (!columns.includes(requiredColumn)) {
            return [false, `CSV is missing the required column: ${requiredColumn}`]
          }
        }
      }

      // csv parser can know the type of the first row, so we have to ignore it
      const firstRow  = results.data[0] as any
      if (!firstRow) {
        return [false, 'No data found in CSV']
      }

      const creator: string = firstRow['creator']

      if (!creator.includes('@') || !creator.includes('.') || creator.length < 5) {
        return [false, 'Creator must be a valid email address']
      }

      const target: string = firstRow['target']

      if (!target.startsWith('http')) {
        return [false, 'Target must be a valid URL. Your target did not begin with http']
      }

      const id: string = firstRow['id']

      if (!id.startsWith('http')) {
        return [false, 'ID must be a valid URL. Your ID did not being with http']
      }

      const description: string  = firstRow['description']

      if (!description) {
        return [false, 'Description is required and cannot be empty']
      }
    }
  })

  return [true, 'Parsed entire CSV without errors']
}
