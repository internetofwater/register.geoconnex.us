import { validGeoconnexCSV } from './helpers'
import { test, expect } from 'vitest'
import { CSVError } from './helpers'

// Node imports for testing
const fs = require('fs')
const path = require('path')

function getTestFile(fileName: string) {
  // Papaparse requires a File object as it would be presented in the DOM, but in node we can't read using
  //  readFileSync so we need to create a mock stream for testing purposes
  return fs.createReadStream(path.resolve(__dirname, 'testData', fileName))
}

test('Completely empty CSV', async () => {
  const [valid, message] = await validGeoconnexCSV(getTestFile('empty.csv'))
  expect(valid).toBe(false)
  expect(message).toBe(CSVError.EMPTY)
})

test('Headers but no data', async () => {
  const [valid, message] = await validGeoconnexCSV(getTestFile('justHeaders.csv'))

  expect(valid).toBe(false)
  expect(message).toBe(CSVError.EMPTY)
})

test('Valid 1:1 Data', async () => {
  const [valid, message] = await validGeoconnexCSV(getTestFile('valid1to1.csv'))
  expect(message).toBe('Success')
  expect(message).toBe('Success')

  expect(valid).toBe(true)
})

test('Invalid email in 1:1 Data', async () => {
  const [valid, message] = await validGeoconnexCSV(getTestFile('invalidEmail.csv'))

  expect(valid).toBe(false)
  expect(message).toBe(CSVError.CREATOR_AS_EMAIL)
})

test('Missing target', async () => {
  const [valid, message] = await validGeoconnexCSV(getTestFile('missingTarget.csv'))

  expect(valid).toBe(false)
  expect(message).toBe(CSVError.MISSING_TARGET)
})

test('Missing Description', async () => {
  const [valid, message] = await validGeoconnexCSV(getTestFile('missingDescription.csv'))

  expect(valid).toBe(false)
  expect(message).toBe(CSVError.MISSING_DESCRIPTION)
})

test('Missing Creator', async () => {
  const [valid, message] = await validGeoconnexCSV(getTestFile('missingCreator.csv'))

  expect(valid).toBe(false)
  expect(message).toBe(CSVError.MISSING_CREATOR)
})

test('Missing ID', async () => {
  const [valid, message] = await validGeoconnexCSV(getTestFile('missingID.csv'))

  expect(valid).toBe(false)
  expect(message).toBe(CSVError.MISSING_ID)
})

test('ID not a URL', async () => {
  const [valid, message] = await validGeoconnexCSV(getTestFile('idNotURL.csv'))

  expect(valid).toBe(false)
  expect(message).toBe(CSVError.ID_AS_URL)
})

test('Target not a URL', async () => {
  const [valid, message] = await validGeoconnexCSV(getTestFile('targetNotURL.csv'))

  expect(valid).toBe(false)
  expect(message).toBe(CSVError.TARGET_AS_URL)
})
