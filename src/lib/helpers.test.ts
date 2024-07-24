import { validGeoconnexCSV } from "./helpers";
import { test, expect } from 'vitest';

const fs = require('fs');
const path = require("path");
// Papaparse requires a File object as it would be presented in the DOM, but in node we can't read using 
//  readFileSync so we need to create a mock stream for testing purposes
const empty = fs.createReadStream(path.resolve(__dirname, 'testData/empty.csv'));


test("validGeoconnexCSV", () => {
    const [valid, errMsg] = validGeoconnexCSV(empty);

    expect(valid).toBe(false);
})