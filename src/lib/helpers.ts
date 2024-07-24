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

export enum CSVError {
  PARSING = 'Your CSV appears to be improperly formatted. Please check the formatting and try again.',
  EMPTY = 'Your CSV appears to be empty or missing data.',
  CREATOR_AS_EMAIL = 'Inside your CSV, the creator column does not appear to use a valid email address',
  MISSING_ID = 'You are missing the id column in your CSV',
  MISSING_TARGET = 'You are missing the target column in your CSV',
  MISSING_CREATOR = 'You are missing the creator column in your CSV',
  MISSING_DESCRIPTION = 'You are missing the description column in your CSV',
  TARGET_AS_URL = 'Inside your CSV, the target column is not using a valid URL',
  ID_AS_URL = 'Inside your CSV, the id column is not using a valid URL'
}

type CSVResult = CSVError | 'Success'

function isValidHttpUrl(string: string | URL) {
  let url

  try {
    url = new URL(string)
  } catch (_) {
    return false
  }

  return url.protocol === 'http:' || url.protocol === 'https:'
}

export async function validGeoconnexCSV(file: File): Promise<[boolean, CSVResult]> {
  // Check if the user submitted CSV is valid. Just checks the first row for validity
  // These checks are meant to be reasonable sanity checks, not fully exhaustive

  // Papaparse usually has a callback based API. We need to wrap it in a promise
  // to block and get the results by awaiting before we submit the form
  function csvPromise(file: File): Promise<[boolean, Papa.ParseResult<unknown>]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
          resolve([true, results])
        },
        error: function (error) {
          reject([false, error])
        }
      })
    })
  }

  const [didSucceed, parseResult] = await csvPromise(file)

  if (!didSucceed) {
    return [false, CSVError.PARSING]
  }

  if (parseResult.data.length === 0) {
    return [false, CSVError.EMPTY]
  }

  const firstRow = (parseResult.data as Record<string, string>[])[0]

  const creator = firstRow['creator']
  const target = firstRow['target']
  const id = firstRow['id']
  const description = firstRow['description']

  if (!id || id.length === 0) {
    return [false, CSVError.MISSING_ID]
  }

  if (!target || target.length === 0) {
    return [false, CSVError.MISSING_TARGET]
  }

  if (!description || description.length === 0) {
    return [false, CSVError.MISSING_DESCRIPTION]
  }

  if (!creator || creator.length === 0) {
    return [false, CSVError.MISSING_CREATOR]
  }

  if (!creator.includes('@') || !creator.includes('.') || creator.length < 5) {
    return [false, CSVError.CREATOR_AS_EMAIL]
  }

  if (!isValidHttpUrl(target)) {
    return [false, CSVError.TARGET_AS_URL]
  }

  if (!isValidHttpUrl(id)) {
    return [false, CSVError.ID_AS_URL]
  }

  return [true, 'Success']
}
