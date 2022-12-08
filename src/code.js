import logo from "./logo.svg"
import { multipliers, sizeCoeff, order, fractions } from "./constants"
import { closestFraction } from "./helpers"

figma.showUI(__html__, { themeColors: true, height: 300 })

export const defaultFont = { family: "Roboto", style: "Regular" }

figma.ui.onmessage = ({ type, count = 1.5 }) => {
  if (type === "start") {
    // find the aspect ratio of the selected node
    if (figma.currentPage.selection.length === 0) {
      figma.notify("Please select a node")
      return
    } else if (figma.currentPage.selection.length > 1) {
      figma.notify("Please select only one node")
      return
    } else {
      const node = figma.currentPage.selection[0]
      const { width, height } = node
      const ratio = width / height

      const [closest, count] = closestFraction(ratio, fractions)

      figma.ui.postMessage({ type: "ratio", count, closest }, { origin: "*" })
    }
  } else if (type === "apply-guide") {
    const node = figma.currentPage.selection[0]
    const { width, height } = node

    // draw logo count times on the bottom of the node
    // so that logo width is width / count
    const logoWidth = width / count

    const logoNodes = []
    for (let i = 0; i < Math.ceil(count); i++) {
      const logoNode = figma.createNodeFromSvg(logo)
      node.appendChild(logoNode)
      const height = logoNode.height * (logoWidth / logoNode.width)
      logoNode.resize(logoWidth, height)
      logoNode.x = i * logoWidth
      logoNode.y = node.height - height
      logoNode.name = "helper " + i
      logoNodes.push(logoNode)
    }

    const logoGroup = figma.group(logoNodes, figma.currentPage)
    for (let i = 0; i < logoNodes.length; i++) {
      const logoNode = logoNodes[i]
      figma.ungroup(logoNode)
    }
    logoGroup.name = "Grid Helper"

    // find horizontal-margin and vertical-margin
    const k = logoGroup.findOne((node) => node.name === "horizontal-margin")
    const [kHeight, margin] = [k.height, k.width] // base module

    // draw grid

    // draw vertical lines
    // draw a vertical line from top to bottom
    // with x position equal to margin
    const left = figma.createLine()
    node.appendChild(left)
    left.name = "vertical-line"
    left.rotation = -90
    left.x = margin
    left.y = 0
    left.resize(height, 0)
    left.strokes = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }]
    left.strokeWeight = 0.25

    const right = figma.createLine()
    node.appendChild(right)
    right.name = "vertical-line"
    right.rotation = -90
    right.x = width - margin
    right.y = 0
    right.resize(height, 0)
    right.strokes = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }]
    right.strokeWeight = 0.25

    // draw horizontal lines
    // draw a horizontal line from left to right
    // with y position equal to margin
    const top = figma.createLine()
    node.appendChild(top)
    top.name = "horizontal-line"
    top.x = 0
    top.y = margin
    top.resize(width, 0)
    top.strokes = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }]
    top.strokeWeight = 0.25

    const bottom = figma.createLine()
    node.appendChild(bottom)
    bottom.name = "horizontal-line"
    bottom.x = 0
    bottom.y = height - margin
    bottom.resize(width, 0)
    bottom.strokes = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }]
    bottom.strokeWeight = 0.25

    // draw text
    const font = { family: "Kaspersky Sans Display", style: "Medium" }

    figma.loadFontAsync(font).then(() => {
      let offset = 0
      order.forEach((key) => {
        const text = figma.createText()
        text.fontName = font
        node.appendChild(text)

        // if key starts with h, then it's a header
        if (key.startsWith("h")) {
          text.characters = "Head " + key[1]
          text.name = text.characters
        } else {
          // capitalize first letter of key
          text.characters = key[0].toUpperCase() + key.slice(1)
          text.name = text.characters
        }

        const fontSize = kHeight * multipliers[key] * sizeCoeff
        text.fontSize = fontSize
        text.lineHeight = { value: 100, unit: "PERCENT" }
        // place h1 on top of node offset by margin
        text.x = margin
        text.y = margin - 0.1458264599 * fontSize + offset
        offset = text.y + text.height
      })
      figma.closePlugin()
    })

    //   figma.currentPage.selection = [text]
    //   figma.viewport.scrollAndZoomIntoView([text])
  } else if (type === "cancel") {
    figma.closePlugin()
  }
}
