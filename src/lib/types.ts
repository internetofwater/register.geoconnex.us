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

export interface ValidationReport {
  valid: boolean
  errorSummary: CSVResult | string
  crawlErrors: { url: string; error: string }[]
}

export interface MarkdownSection {
  sectionName: string
  body: string
}

export interface MetadataResponse {
  readme: File
  namespace: string
}

export type namespaceResult = {
  name: string
  path: string
  sha: string
  size: number
  url: string
  html_url: string
  git_url: string
  download_url: string
  type: 'dir' | 'file'
}
