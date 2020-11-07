# git-status-cli

------

<p align="center">
  <b>Get the output of 'git status' from the command line, formatted as JSON or plain text.<br><br>
  Available for macOS, Windows and Linux.
</p>

------


## Contents

1. [Installation](#installation)
1. [Usage](#usage)
1. [Examples](#examples)
1. [Platform Support](#platform-support)
1. [Contribute](#contribute)
1. [Author](#author)


## <a name="installation"/></a> Installation

### Installation as global NPM package

```bash
$ npm install --global git-status-cli
```


## <a name="usage"/></a> Usage

```bash
$ git-status [--format <output-format>] [--cwd <path>] [--git <path>]
```

- Parameters
   - -f, --format **output-format** - Output format (Options: *json*, *text*)
   - -c, --cwd **path** - Path to Git repository (Example: */home/user/myrepository*)
   - -g, --git **path** - Path to Git executable (Example: */usr/bin/git*)


## <a name="examples"/></a> Examples

### Standard usage

```bash
$ git-status
>> {
>>     "modified": [ "README.md", "lib/index.js" ],
>>     "added": [ "LICENSE" ]
>> }  
```

### Custom format

```bash
$ git-status-cli --format text
>> modified:		README.md, file2
>> added:		file3, file4
```

### Custom repository path

```bash
$ git-status-cli --cwd "/Users/joeqpublic/Documents/myrepository"
>> modified:		README.md, file2
>> added:		file3, file4
```

### Show Help

```bash
$ git-status-cli --help
```

### Show Version

```bash
$ git-status-cli --version
```


## <a name="platform-support"/></a> Platform Support

Tested on:

- macOS Mojave (10.14.6)
- Windows 10 Spring Creators Update
- Ubuntu (18.04)


## <a name="contribute"/></a> Contribute ![Contribute](https://img.shields.io/badge/contributions-wanted-red.svg?style=flat-square)

Read the [contribution documentation](https://github.com/sidneys/git-status-cli/blob/release/CONTRIBUTING.md) first.

- [Dev Chat](http://gitter.im/sidneys/git-status-cli): Talk about features and suggestions.
- [Issues](http;//github.com/sidneys/git-status-cli/issues) File bugs and document issues.


## <a name="author"/></a> Author

[sidneys](http://sidneys.github.io) 2018

