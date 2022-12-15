import logo from "./logo.svg"
import {
  multipliers,
  defaultSettings,
  order,
  fractions,
  lineHeightCoeff,
  monkeyMarginCoeff,
} from "./constants"
import { closestFraction } from "./helpers"

const { minBaseText, font } = defaultSettings

const findLineHeight = (fontSize, baseHeight) => {
  return baseHeight * Math.ceil(fontSize / baseHeight)
}

figma.showUI(__html__, { themeColors: true, height: 300 })

figma.ui.onmessage = ({ type, count = 1.5, closest = "" }) => {
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
    // for (let i = 0; i < Math.ceil(count); i++) {
    for (let i = 0; i < 1; i++) {
      const logoNode = figma.createNodeFromSvg(logo)
      node.appendChild(logoNode)
      const height = logoNode.height * (logoWidth / logoNode.width)
      logoNode.resize(logoWidth, height)
      logoNode.x = i * logoWidth
      logoNode.y = node.height - height
      logoNode.name = "helper " + i
      logoNodes.push(logoNode)
    }

    const logoGroup = figma.group(logoNodes, node)
    for (let i = 0; i < logoNodes.length; i++) {
      const logoNode = logoNodes[i]
      figma.ungroup(logoNode)
    }
    logoGroup.name = "Grid Helper"

    // find horizontal-margin and vertical-margin
    const k = logoGroup.findOne((node) => node.name === "horizontal-margin")
    const [kHeight, margin] = [k.height, k.width] // base module

    // Draw Grid
    // draw vertical lines
    // draw a vertical line from top to bottom
    // with x position equal to margin

    const scaledMargin = margin * multipliers.margin
    const left = figma.createLine()
    node.appendChild(left)
    left.name = "vertical-line"
    left.rotation = -90
    left.x = scaledMargin
    left.y = 0
    left.resize(height, 0)
    left.strokes = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }]
    left.strokeWeight = 0.25

    const right = figma.createLine()
    node.appendChild(right)
    right.name = "vertical-line"
    right.rotation = -90
    right.x = width - scaledMargin
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
    top.y = scaledMargin
    top.resize(width, 0)
    top.strokes = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }]
    top.strokeWeight = 0.25

    const bottom = figma.createLine()
    node.appendChild(bottom)
    bottom.name = "horizontal-line"
    bottom.x = 0
    bottom.y = height - scaledMargin
    bottom.resize(width, 0)
    bottom.strokes = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }]
    bottom.strokeWeight = 0.25

    // move the logo group so that
    // the k right side is aligned with the left line
    logoGroup.x = scaledMargin - k.x - k.width
    const verticalK = logoGroup.findOne(
      (node) => node.name === "vertical-margin"
    )

    // move the logo group so that
    // the vertical k top side is aligned with the bottom line
    // logoGroup.y -= verticalK.y + verticalK.height / 2 - (height - scaledMargin)
    logoGroup.y -= verticalK.y - (height - scaledMargin)

    /* Draw Text */

    // make font not less than minBaseText
    const baseFontSize = Math.max(
      Math.round(kHeight * multipliers.baseText),
      minBaseText
    )
    const coeff = minBaseText / Math.round(kHeight * multipliers.baseText)

    // calculate line height
    const baseHeight = Math.ceil(baseFontSize * lineHeightCoeff)

    figma.loadFontAsync(font).then(() => {
      let offset = scaledMargin
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

        const fontSize = Math.round(kHeight * multipliers[key] * coeff)
        text.fontSize = fontSize
        const lineHeight = findLineHeight(fontSize, baseHeight)
        text.lineHeight = {
          value: lineHeight,
          unit: "PIXELS",
        }

        // Create text style
        const style = figma.createTextStyle()
        style.fontName = font
        style.name = `${closest ? closest + " " : ""}` + text.characters
        style.fontSize = fontSize
        style.lineHeight = text.lineHeight
        text.textStyleId = style.id

        text.x = scaledMargin
        if (offset === scaledMargin) {
          const clone = text.clone()
          const geometry = figma.flatten([clone])
          const { y } = geometry
          const dafuq = y - text.y
          text.y = offset - dafuq
          geometry.remove()
        } else {
          text.y = offset
        }

        // if bottom of text is below top of the logo, remove it
        if (text.y + text.height > logoGroup.y) {
          text.remove()
        } else {
          offset = text.y + text.height
        }
      })
      figma.closePlugin()
    })

    figma.viewport.scrollAndZoomIntoView([node])
  } else if (type === "cancel") figma.closePlugin()
}
