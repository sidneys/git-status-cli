'use strict'


/**
 * Modules
 * Node
 * @constant
 */
const os = require('os')
const path = require('path')

/**
 * Modules
 * External
 * @constant
 */
const appRootPath = require('app-root-path')
appRootPath.setPath(path.join(__dirname, '..'))
const chalk = require('chalk')
const indentString = require('indent-string')
const pad = require('pad')
const wordWrap = require('word-wrap')

/**
 * Modules
 * Internal
 * @constant
 */
const packageJson = require(path.join(appRootPath.path, 'package.json'))


/**
 * Environment
 * @constant
 */
const isCli = process.stdout.isTTY

/**
 * @constant
 * @default
 */
const widthIndent = 4

/**
 * Layout Sizes
 */
let widthTotal = 80
if (isCli) {
    const windowSize = require('window-size')
    widthTotal = windowSize['width']
}
const widthMax = widthTotal - (widthIndent * 2)
const widthColumn = Math.floor(widthTotal / 4)


/**
 * Format table headers
 * @param {String} text - Text
 * @returns {String} Padded Text
 */
let formatTextHeader = (text) => {
    let header
    header = `${chalk['bold'](text.toUpperCase())}`

    return header
}

/**
 * Format and wrap multi-line text
 * @param {String} text - String
 * @returns {String} Formatted string
 */
let formatTextParagraph = (text) => {
    return `${wordWrap(text, { indent: ' '.repeat(widthIndent), width: widthMax })}${os.EOL}`
}

/**
 * Format table row
 * @param {String} rowTitle - String
 * @param {String=} rowText - String
 * @returns {String} Formatted string
 */
let formatTableRow = (rowTitle, rowText = '') => {
    let row

    row = `${indentString(pad(rowTitle, widthColumn, { colors: true }), widthIndent)} ${rowText}${os.EOL}`

    return row
}

/** @namespace packageJson.bin */
/** @namespace packageJson.homepage */

/**
 * Help
 */
let print = () => {
    console.log(formatTextHeader('name'))
    console.log(formatTextParagraph(`${packageJson.name} v${packageJson.version}`))

    console.log(formatTextHeader('homepage'))
    console.log(formatTextParagraph(`${packageJson.homepage}`))

    console.log(formatTextHeader('usage'))
    console.log(formatTableRow(`${chalk['bold'](Object.keys(packageJson.bin)[0])} [ ${chalk['bold']('--format')} ${chalk['underline']('output-format')} ] [ ${chalk['bold']('--cwd')} ${chalk['underline']('path')} ] [ ${chalk['bold']('--git')} ${chalk['underline']('path')} ]`))

    console.log(formatTextHeader('options'))

    console.log(formatTableRow(`${chalk['bold']('-f, --format')} ${chalk['underline']('output-format')}`, `Output format (Options: json, text)`))
    console.log(formatTableRow(`${chalk['bold']('-c, --cwd')} ${chalk['underline']('path')}`, `Path to Git repository (Example: /home/user/myrepository)`))
    console.log(formatTableRow(`${chalk['bold']('-g, --git')} ${chalk['underline']('path')}`, `Path to Git executable (Example: /usr/bin/git)`))

    console.log(formatTableRow(`${chalk['bold']('-h, --help')}`, `Show this help`))
    console.log(formatTableRow(`${chalk['bold']('-v, --version')}`, `Print version`))
}


/**
 * @exports
 */
module.exports = {
    print: print
}
