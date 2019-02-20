#!/usr/bin/env node
'use strict'


/**
 * Modules
 * Node
 * @constant
 */
const { execFile } = require('child_process')
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
const jsonStringify = require('json-stringify-pretty-compact')
const logger = require('@sidneys/logger')({ write: true })
const minimist = require('minimist')
const parseGitStatus = require('parse-git-status')
const which = require('which')

/**
 * Modules
 * Internal
 * @constant
 */
const help = require(path.join(appRootPath.path, 'lib', 'help'))
const packageJson = require(path.join(appRootPath.path, 'package.json'))


/**
 * Log prefix
 * @constant
 */
const logPrefix = chalk['bold']['cyan'](`[${packageJson.name}]`)
const errorPrefix = chalk['bold']['red'](`[${packageJson.name}]`)


/**
 * Default Configuration
 * @constant
 * @default
 */
const outputFormatList = [ 'json', 'text' ]
const defaultOutputFormat = 'json'
const defaultWorkingDirectory = path.resolve(process.cwd())
const defaultGitPath = which.sync('git')


/**
 * Get Git Status
 * @param {String} outputFormat - 'text', 'json'
 * @param {String} workingDirectory - Path to repository
 * @param {String} gitPath - Path to Git executable
 * @param {function} callback - Callback
 */
let getGitStatus = (outputFormat, workingDirectory, gitPath, callback = () => {}) => {
    logger.debug('getGitStatus')

    execFile(gitPath, [ '-C', workingDirectory, 'status', '--porcelain=v1', '-z' ], (error, stdout, stderr) => {
        logger.debug('getGitStatus', 'execFile')

        // Error
        if (error) {
            callback(error.toString())
            return
        }

        // StdErr
        if (stderr) {
            callback(stderr.toString())
            return
        }

        // Empty (no git status changes)
        if (!Boolean(stdout.toString())) {
            callback(null)
        }

        // Get git status array
        const parsedGitStatusList = parseGitStatus(stdout.toString())

        // Transpose Git status Array into Hash MAp
        const statusMap = new Map()

        // Loop Git file status types
        parsedGitStatusList.forEach((status) => {
            // Get file status, file name
            const fileStatus = parseGitStatus.describeCode(status['y'])
            const fileName = status['to']

            // If not available, create Hash Map key for each file status
            if (!statusMap.has(fileStatus)) {
                statusMap.set(fileStatus, [])
            }

            // Get current content of file status Hash Map key
            const fileNameSet = new Set(statusMap.get(fileStatus))

            // Add applicable file names to file status Hash Map key
            fileNameSet.add(fileName)

            // Update file status Hash Map key
            statusMap.set(fileStatus, [ ...fileNameSet ])
        })

        // Convert Hash Map into plain object
        const statusObject = {}
        statusMap.forEach((value, property) => {
            statusObject[property] = value
        })

        // Generate JSON
        const statusJson = jsonStringify(statusObject, { indent: 4, margins: true, maxLength: 80 })

        // Generate Plaintext
        let statusText = String()
        statusMap.forEach((value, property) => {
            statusText = `${statusText}${property}: ${value.join(', ')}${os.EOL}`
        })
        statusText = statusText.trim()

        // Switch JSON/Plaintext output
        let statusOutput
        switch (outputFormat) {
            case 'text':
                statusOutput = statusText
                break
            case 'json':
                statusOutput = statusJson
        }

        // Callback
        callback(null, statusOutput)
    })
}


/**
 * Commandline interface
 */
if (require.main === module) {
    // Parse arguments
    let argv
    try {
        argv = minimist(process.argv.slice(2), {
            'boolean': [ 'help', 'version' ],
            'string': [ 'format', 'cwd', 'git-path' ],
            'default': {
                'format': defaultOutputFormat,
                'cwd': defaultWorkingDirectory,
                'git-path': defaultGitPath
            },
            'unknown': () => {
                return false
            }
        })
    } catch (error) {}

    // DEBUG
    logger.debug('argv', argv)

    // Help
    const argvHelp = argv['help']
    if (argvHelp) {
        help.print()
        process.exit(0)
    }

    // Version
    const argvVersion = argv['version']
    if (argvVersion) {
        console.log(logPrefix, `v${packageJson.version}`)
        process.exit(0)
    }

    // --format
    const argvFormat = argv['format']
    if (!outputFormatList.includes(argvFormat)) {
        console.log(errorPrefix, '[Error]', `Illegal format: "${argvFormat}"`)
        console.log(errorPrefix, '[Error]', `Allowed formats: "${outputFormatList.join('", "')}"`)
        process.exit(1)
    }

    // --cwd
    const argvCwd = argv['cwd']

    // --git-path
    const argvGitPath = argv['git-path']

    // Run
    getGitStatus(argvFormat, argvCwd, argvGitPath, (error, result) => {
        if (error) {
            console.log(errorPrefix, error.replace(/(?:\r\n|\r|\n)/g, ' '))
            process.exit(1)

            return
        }

        if (result) {
            console.log(result)
        }

        process.exit(0)
    })
}
