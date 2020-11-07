#!/usr/bin/env node
'use strict'


/**
 * Modules (Node.js)
 * @constant
 */
const { execFile } = require('child_process')
const os = require('os')
const path = require('path')

/**
 * Modules (Third party)
 * @constant
 */
const appRootPath = require('app-root-path')
const appModulePath = require('app-module-path')
const chalk = require('chalk')
const jsonStringify = require('json-stringify-pretty-compact')
const logger = require('@sidneys/logger')({ write: true })
const minimist = require('minimist')
const parseGitStatus = require('parse-git-status')
const which = require('which')

/**
 * Module Configuration
 */
appRootPath.setPath(path.resolve(path.join(__dirname), '..'))
appModulePath.addPath(appRootPath.path)

/**
 * Modules (Local)
 * @constant
 */
const help = require('lib/help')
const packageJson = require('package.json')


/**
 * Log prefix
 * @constant
 */
const logPrefix = chalk['bold']['cyan'](`[${packageJson.name}]`)
const errorPrefix = chalk['bold']['red'](`[${packageJson.name}]`)


/**
 * Convert Git Status Map to target format
 * @param {Map} status - Git Status Map
 * @param {String} format - Target format (json, text)
 * @returns {String} callback - Callback
 * @private
 */
let formatGitStatus = (status, format) => {
    logger.debug('formatGitStatus')

    // Initialize output
    let output

    // Switch format
    switch (format) {
        case 'text':
            // Generate Plaintext
            output = String()
            status.forEach((value, key) => {
                output += `${key}: "${value.join('", "')}"${os.EOL}`
            })
            output = output.trim()
            break
        case 'json':
            // Generate JSON
            output = jsonStringify(Object.fromEntries(status), {
                indent: 4,
                margins: true,
                maxLength: 80
            })
    }

    // Return
    return output
}


/**
 * Get result 'git status' for a Git repository
 * @param {String} cwd - Path to Git repository
 * @param {String} git - Path to Git executable
 * @param {function} callback - Callback
 * @public
 */
let getGitStatus = (cwd, git, callback = () => {}) => {
    logger.debug('getGitStatus')

    // Resolve absolute path to Git repository
    cwd = path.resolve(cwd)

    // Resolve absolute path to Git executable
    git = path.resolve(git)

    // Get result of 'git status'
    execFile(git, [ '-C', cwd, 'status', '--porcelain=v1', '-z' ], (error, stdout, stderr) => {
        // Error
        if (error) {
            // Callback
            callback(error)
            return
        }

        // Stderr
        if (stderr) {
            // Callback
            callback(new Error(stderr))
            return
        }

        // Get "git status" result
        const gitStatusText = stdout.toString()

        // Parse "git status" result
        const gitStatusList = parseGitStatus(gitStatusText)

        // Create "git status" Map, keyed by file status descriptions
        const gitStatusMap = new Map()
        gitStatusList.forEach((gitStatus) => {
            // Lookup filename
            const filename = gitStatus.to

            // Lookup status description
            // ' ': unmodified, M: modified, A: added, D: deleted, R: renamed, C: copied, U: unmerged, ?: untracked, !: ignored
            const statusDescription = parseGitStatus.describeCode(gitStatus.x)

            // Lookup filenames to add to status description key
            let filenameSet

            // Check if status description key exists in Map
            if (!gitStatusMap.has(statusDescription)) {
                // Key doesn't exist: Create filename Set, add filename
                filenameSet = new Set([ filename ])
            } else {
                // Key exists: Get filename Set, add filename
                filenameSet = new Set([ ...gitStatusMap.get(statusDescription), filename ])
            }

            // Create filename Array from filename Set
            const filenameList = [ ...filenameSet ]

            // Set filename Array as value for status description key
            gitStatusMap.set(statusDescription, filenameList)
        })

        // Callback
        callback(null, gitStatusMap)
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
            boolean: [ 'help', 'version' ],
            string: [ 'format', 'cwd', 'git' ],
            alias: {
                'h': 'help',
                'v': 'version',
                'f': 'format',
                'c': 'cwd',
                'g': 'git'
            },
            default: {
                'format': 'json',
                'cwd': path.resolve(process.cwd()),
                'git': which.sync('git')
            },
            unknown: () => false
        })
    } catch (error) {}

    // DEBUG
    logger.debug('argv', argv)

    // --help
    const argvHelp = argv['help']
    if (argvHelp) {
        help.print()
        process.exit(0)
    }

    // --version
    const argvVersion = argv['version']
    if (argvVersion) {
        console.log(logPrefix, `v${packageJson.version}`)
        process.exit(0)
    }

    // --format
    const argvFormat = argv['format']
    if (!argvFormat) {
        console.log(errorPrefix, '[Error]', `Unsupported format: ${argvFormat}`)
        process.exit(1)
    }

    // --cwd
    const argvCwd = argv['cwd']

    // --git
    const argvGit = argv['git']

    // Run
    getGitStatus(argvCwd, argvGit, (error, result) => {
        // Error
        if (error) {
            // Print Errors
            const messageList = error.message.trim().split(os.EOL)
            messageList.forEach((message) => {
                console.log(errorPrefix, message)
            })

            // Exit
            process.exit(1)
        }

        // Print Resultss
        if (result.size > 0) {
            console.log(formatGitStatus(result, argvFormat))
        }

        // Exit
        process.exit(0)
    })
}
