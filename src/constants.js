export const phi = 1.618

export const multipliers = {
  baseText: 1 / phi ** 2,
  teaser: 1 / phi,
  h4: 1,
  h3: phi,
  h2: phi ** 2,
  h1: phi ** 3,
  margin: 1.5
}

export const monkeyMarginCoeff = -0.182945154

export const lineHeightCoeff = 1.2

export const defaultSettings = {
  minBaseText: 8,
  font: { family: "Kaspersky Sans Display", style: "Medium" },
  defaultFont: { family: "Roboto", style: "Regular" },
}

export const order = ["h1", "h2", "h3", "h4", "teaser", "baseText"]

export const fractions = [
  ["6:3", 5],
  ["1:1", 3],
  ["3:2", 3],
  ["1:8", 1],
  ["2:3", 3],
  ["8:1", 8],
  ["1:8", 1],
  ["2:3", 3],
  ["3:1", 5],
  ["1:3", 1.5],
]
