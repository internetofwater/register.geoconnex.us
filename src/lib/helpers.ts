import Papa from 'papaparse'
import { CSVError, type MarkdownSection, type ValidationReport } from './types'

export async function fetchMarkdownContent(url: string): Promise<string> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`)
  }

  const data = await response.json()
  const markdown = atob(data.content) // Decode content from Base64
  return markdown
}

export function generateReadMe(title: string, rawInput: MarkdownSection[]): string {
  let output = `# ${title}\n\n`

  for (const section of rawInput) {
    output += `## ${section.sectionName}\n\n${section.body}\n\n`
  }
  return output
}

function isValidHttpUrl(string: string | URL) {
  let url

  try {
    url = new URL(string)
  } catch (_) {
    return false
  }

  return url.protocol === 'http:' || url.protocol === 'https:'
}

export async function targetsAreAlive(
  targets: string[]
): Promise<[boolean, { url: string; error: string }[]]> {
  try {
    // Generate an array of all promises for each target
    const promises = targets.map(async (url) => {
      try {
        // If we don't get a response after 6 seconds, just assume the target is dead
        const response = await fetch(url, {
          signal: AbortSignal.timeout(15000),
          redirect: 'follow'
        })
        if (response.ok) {
          return { url, alive: true, error: '' }
        } else {
          return { url, alive: false, error: response.statusText as string }
        }
      } catch (error) {
        return { url, alive: false, error: error as string }
      }
    })

    // Wait for all promises to resolve
    const results = await Promise.all(promises)

    // Output only the targets which are not alive
    const notAliveTargets = results.filter((result) => !result.alive)

    // Drop the alive property, all these are not alive
    const notAliveUrls = notAliveTargets.map((result) => {
      return { url: result.url, error: result.error }
    })

    // All targets are alive
    if (notAliveTargets.length === 0) {
      return [true, []]
    } else {
      return [false, notAliveUrls]
    }
  } catch (error) {
    console.error('Error while checking targets:', error)
    return [false, []]
  }
}

function checkHeaderAndFirstRow(
  dataOutput: Record<string, string>[]
): [boolean, CSVError | 'Success'] {
  // Run a series of sanity checks on the first row and header of the CSV

  const creator = dataOutput[0]['creator']
  const target = dataOutput[0]['target']
  const id = dataOutput[0]['id']
  const description = dataOutput[0]['description']

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

export async function validGeoconnexCSV(
  file: File,
  skipAliveCheck = false
): Promise<ValidationReport> {
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
    return {
      valid: false,
      errorSummary: CSVError.PARSING,
      crawlErrors: []
    }
  }

  if (parseResult.data.length === 0) {
    return {
      valid: false,
      errorSummary: CSVError.EMPTY,
      crawlErrors: []
    }
  }

  const dataOutput = parseResult.data as Record<string, string>[]

  // Before we do fetch queries on the targets, check to make sure the CSV is generally sane
  const [isValid, error] = checkHeaderAndFirstRow(dataOutput)
  if (!isValid) {
    return {
      valid: false,
      errorSummary: error,
      crawlErrors: []
    }
  }

  const targets = []
  for (let i = 0; i < dataOutput.length; i++) {
    try {
      const isRegex = dataOutput[i]['id'].startsWith('https://geoconnex.us/' + '/')
      if (isRegex) {
        continue
      } else {
        targets.push(dataOutput[i]['target'])
      }
    } catch (error) {
      return {
        valid: false,
        errorSummary: `In your CSV, you specified a target URL which is not valid: ${dataOutput[i]['target']}`,
        crawlErrors: []
      }
    }
  }

  if (!skipAliveCheck) {
    const [isAlive, crawlErrors] = await targetsAreAlive(targets)

    if (!isAlive) {
      const response = `You listed target URLs which did not return a valid HTTP response. This could be a sign on a target URL is down. However, this could be a false positive. Some servers may block these requests.`
      return {
        valid: false,
        errorSummary: response,
        crawlErrors: crawlErrors
      }
    }
  }

  return {
    valid: true,
    errorSummary: 'Success',
    crawlErrors: []
  }
}
