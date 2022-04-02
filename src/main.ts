import * as core from '@actions/core'
// import * as github from '@actions/github'
import * as path from 'path'
import {existsSync, promises as fsp} from 'fs'

interface Checkdiff {
  checksum: string
}

async function run(): Promise<void> {
  try {
    const allDiffs = await walkDir('.')
    const bigDiff = allDiffs
      .sort((a: CheckdiffInfo, b: CheckdiffInfo) =>
        a.basePath < b.basePath ? -1 : b.basePath < a.basePath ? 1 : 0
      )
      .map(value => value.checkdiff)
      .join('|')

    core.debug(`bigDiff ${bigDiff}`)
    core.setOutput('checksum', bigDiff)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

async function walkDir(basePath: string): Promise<CheckdiffInfo[]> {
  const files = await fsp.readdir(basePath, {withFileTypes: true})
  const allDiffs: CheckdiffInfo[] = []
  for (const file of files) {
    if (file.isDirectory()) {
      if (file.name === '.faktory') {
        const checkdiffPath = `${path.join(basePath, file.name, 'checkdiff')}`
        if (existsSync(checkdiffPath)) {
          const fileData = await fsp.readFile(checkdiffPath, 'utf8')
          const fkdata: Checkdiff = JSON.parse(fileData)
          return [new CheckdiffInfo(basePath, fkdata.checksum)]
        }
      } else {
        const otherDiffs = await walkDir(path.join(basePath, file.name))
        allDiffs.push(...otherDiffs)
      }
    }
  }

  return allDiffs
}

class CheckdiffInfo {
  basePath: string
  checkdiff: string
  constructor(basePath: string, checkdiff: string) {
    this.basePath = basePath
    this.checkdiff = checkdiff
  }
}

run()
