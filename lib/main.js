#!/usr/bin/env node
'use strict'


/**
 * Modules
 * Node
 * @constant
 */
const { execFile } = require('child_process')
const path = require('path')

/**
 * Modules
 * External
 * @constant
 */
const appRootPath = require('app-root-path')
appRootPath.setPath(path.join(__dirname, '..'))
const chalk = require('chalk')
const gitStatusUtils = require('git-status-utils')
const jsonStringify = require('json-stringify-pretty-compact')
const logger = require('@sidneys/logger')({ write: true })
const minimist = require('minimist')
const parseGitStatus = require('parse-git-status')

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
 * Output formats
 * @constant
 * @default
 */
const outputFormatList = ['json', 'text']
const defaultOutputFormat = 'json'


/**
 * Get Git Status
 * @param {String} outputFormat - 'text', 'json'
 * @param {function} callback - Callback
 * @returns {String} - Status
 */
let getGitStatus = (outputFormat, callback = () => {}) => {
    logger.debug('getGitStatus')

    execFile('git', ['status', '--porcelain=v1', '-z'], (error, stdout, stderr) => {
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

        // Transpose git status array into hashmap/dictionary
        const statusMap = new Map()
        parsedGitStatusList.forEach((status) => {
            // Pick filestate and file name
            const filestate = parseGitStatus.describeCode(status['y'])
            const filename = status['to']

            // Prepare filelist for each filestate key 
            if (!statusMap.has(filestate)) {
                statusMap.set(filestate, new Array())
            }

            // Associate filenames to filestates
            const fileSet = new Set(statusMap.get(filestate))
            fileSet.add(filename)
            statusMap.set(filestate, [...fileSet])
        })

        // Convert hashmap into plain object
        const statusObject = new Object()
        statusMap.forEach((value, property) => {
            statusObject[property] = value
        })

        // Format output JSON
        let statusJson = new String()
        statusJson = jsonStringify(statusObject, { indent: 4, margins: true, maxLength: 80 })

        // Format output text
        let statusText = new String()
        statusMap.forEach((value, property) => {
            statusText = `${statusText}${property}: ${value.join(', ')}\r\n`
        })
        statusText = statusText.trim()

        // Decide output format
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
            'boolean': ['help', 'version'],
            'string': ['format'],
            'default': {
                'format': defaultOutputFormat
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

    // Output Format
    const argvFormat = argv['format']
    if (!outputFormatList.includes(argvFormat)) {
        console.log(errorPrefix, '[Error]', `Illegal format: "${argvFormat}"`)
        console.log(errorPrefix, '[Error]', `Allowed formats: "${outputFormatList.join('", "')}"`)
        process.exit(1)
    }

    // Run
    getGitStatus(argvFormat, (error, result) => {
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