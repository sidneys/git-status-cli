# git-status-cli

------

<p align="center">
  <b>Get the file status (`git status`) of the current Git repository from the commandline.<br><br>
  <b>Format output as JSON or plain text.<br>
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
$ git-status [--format <output-format>]
```

- Parameters
   - **<output-format>** (String) - json, text (*Default: json*)


## <a name="examples"/></a> Examples

```bash
$ git-status
>> {
>>     "modified": [ "file1", "file2" ],
>>     "added": [ "file3", "file4" ]
>> }  
```

### Status as Plaintext

```bash
$ git-status-cli --format=text
>> modified:		file1, file2
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

- macOS High Sierra 10.13.4
- Windows 10 Spring Creators Update
- Ubuntu 18.04


## <a name="contribute"/></a> Contribute ![Contribute](https://img.shields.io/badge/contributions-wanted-red.svg?style=flat-square)

Read the [contribution documentation](https://github.com/sidneys/git-status-cli/blob/release/CONTRIBUTING.md) first.

- [Dev Chat](http://gitter.im/sidneys/git-status-cli): Talk about features and suggestions.
- [Issues](http;//github.com/sidneys/git-status-cli/issues) File bugs and document issues.


## <a name="author"/></a> Author

[sidneys](http://sidneys.github.io) 2018

