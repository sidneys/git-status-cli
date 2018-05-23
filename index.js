#!/usr/bin/env node
'use strict'


/**
 * Modules
 * Node
 * @constant
 */
const { execFileSync } = require('child_process')
const path = require('path')

/**
 * Modules
 * External
 * @constant
 */
const appRootPath = require('app-root-path')
const chalk = require('chalk')
const gitStatusUtils = require('git-status-utils')
const jsonStringify = require('json-stringify-pretty-compact')
const logger = require('@sidneys/logger')({ write: true })
const minimist = require('minimist')
const parseGitStatus = require('parse-git-status')

/**
 * Modules
 * Configuration
 */
appRootPath.setPath(path.join(__dirname))

/**
 * Modules
 * Internal
 * @constant
 */
const packageJson = require(path.join(appRootPath.path, 'package.json'))


/**
 * Log prefix
 * @constant
 */
const logPrefix = chalk['bold']['cyan'](`[${packageJson.name}]`)
const errorPrefix = chalk['bold']['red'](`[${packageJson.name}]`)

/**
 * Get Git Status
 * @returns {String} - Status
 */
let getGitStatusJson = () => {
    logger.debug('#getGitStatusJson')

    // Get git status array
    const parsedGitStatusList = parseGitStatus(execFileSync('git', ['status', '--porcelain=v1', '-z']).toString())

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

    // Return welformed JSON
    return jsonStringify(statusObject, { indent: 4, margins: true, maxLength: 80 })
}


/**
 * Commandline interface
 */
if (require.main === module) {
    // Parse arguments
    const argv = minimist(process.argv.slice(2), {
        'boolean': ['version']
    })

    // DEBUG
    logger.debug('argv', argv)

    const argvVersion = argv['version']

    // Version
    if (argvVersion) {
        console.log(logPrefix, `v${packageJson.version}`)
        process.exit(0)
    }

    // Run
    try {
        console.log(getGitStatusJson())
    } catch (error) {
        //console.log(errorPrefix, error.message.replace(/(?:\r\n|\r|\n)/g, ' '))
        //console.log(errorPrefix, error)
        process.exit(1)
    }
}