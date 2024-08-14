import { validGeoconnexCSV, targetsAreAlive, fetchAllNamespaces } from './helpers'
import { test, expect } from 'vitest'
import { CSVError } from './types'

// Node imports for testing
const fs = require('fs')
const path = require('path')

test('Get namespaces', async () => {
  const namespaces = await fetchAllNamespaces()
  expect(namespaces.includes('epa')).toBe(true)
  expect(namespaces.includes('usbr')).toBe(true)
})

function getTestFile(fileName: string) {
  // Papaparse requires a File object as it would be presented in the DOM, but in node we can't read using
  //  readFileSync so we need to create a mock stream for testing purposes
  return fs.createReadStream(path.resolve(__dirname, 'testData', fileName))
}

test('Fail on completely empty CSV', async () => {
  const { valid, errorSummary } = await validGeoconnexCSV(getTestFile('empty.csv'))
  expect(valid).toBe(false)
  expect(errorSummary).toBe(CSVError.EMPTY)
})

test('Fail on headers but no data', async () => {
  const { valid, errorSummary } = await validGeoconnexCSV(getTestFile('justHeaders.csv'))

  expect(valid).toBe(false)
  expect(errorSummary).toBe(CSVError.EMPTY)
})

test('Pass on valid 1:1 Data', async () => {
  const { valid, errorSummary } = await validGeoconnexCSV(getTestFile('valid1to1.csv'), true)
  expect(errorSummary).toBe('Success')
  expect(errorSummary).toBe('Success')

  expect(valid).toBe(true)
})

test('Fail on invalid email in 1:1 Data', async () => {
  const { valid, errorSummary } = await validGeoconnexCSV(getTestFile('invalidEmail.csv'), true)

  expect(valid).toBe(false)
  expect(errorSummary).toBe(CSVError.CREATOR_AS_EMAIL)
})

test('Fail on missing Target', async () => {
  const { valid, errorSummary } = await validGeoconnexCSV(getTestFile('missingTarget.csv'))

  expect(valid).toBe(false)
  expect(errorSummary).toBe(CSVError.MISSING_TARGET)
})

test('Fail on missing Description', async () => {
  const { valid, errorSummary } = await validGeoconnexCSV(getTestFile('missingDescription.csv'))

  expect(valid).toBe(false)
  expect(errorSummary).toBe(CSVError.MISSING_DESCRIPTION)
})

test('Fail on missing Creator', async () => {
  const { valid, errorSummary } = await validGeoconnexCSV(getTestFile('missingCreator.csv'))

  expect(valid).toBe(false)
  expect(errorSummary).toBe(CSVError.MISSING_CREATOR)
})

test('Fail on missing ID', async () => {
  const { valid, errorSummary } = await validGeoconnexCSV(getTestFile('missingID.csv'))

  expect(valid).toBe(false)
  expect(errorSummary).toBe(CSVError.MISSING_ID)
})

test('Fail on ID not a URL', async () => {
  const { valid, errorSummary } = await validGeoconnexCSV(getTestFile('idNotURL.csv'))

  expect(valid).toBe(false)
  expect(errorSummary).toBe(CSVError.ID_AS_URL)
})

test('Fail on target not a URL', async () => {
  const { valid, errorSummary } = await validGeoconnexCSV(getTestFile('targetNotURL.csv'))

  expect(valid).toBe(false)
  expect(errorSummary).toBe(CSVError.TARGET_AS_URL)
})

test('Pass on targets are alive', async () => {
  const [allAlive, whichNot] = await targetsAreAlive(['https://example.com', 'https://google.com'])

  expect(whichNot).toStrictEqual([])
  expect(allAlive).toBe(true)
})

test('Fail on one target is not alive', async () => {
  const urls = [
    'https://example.com',
    'https://google.com',
    'http://fdsakjfdsajkfhdskjfhjdaskfjkdskjdsaf.ca/'
  ]
  const [allAlive, whichNot] = await targetsAreAlive(urls)
  expect(whichNot[0].url).toEqual(urls[2])
  expect(allAlive).toBe(false)
})

test('Pass when skipping target checks for regex ids', async () => {
  const { valid } = await validGeoconnexCSV(getTestFile('unaliveTargetsWithRegex.csv'))

  expect(valid).toBe(true)
})

test('Pass for valid example', async () => {
  const { valid, errorSummary } = await validGeoconnexCSV(getTestFile('validExample.csv'))

  expect(errorSummary).toBe('Success')
  expect(valid).toBe(true)
})

test('Pass when submitting a larger example with 20 rows', async () => {
  const { valid, errorSummary } = await validGeoconnexCSV(getTestFile('valid20RowExample.csv'))
  expect(errorSummary).toBe('Success')
  expect(valid).toBe(true)
})

test(
  'Pass on a huge example with 1500 rows',
  async () => {
    const { valid, errorSummary } = await validGeoconnexCSV(getTestFile('validHuge.csv'))
    expect(errorSummary).toBe('Success')
    expect(valid).toBe(true)
  },
  20 * 10000
)
