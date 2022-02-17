import * as core from '@actions/core'
// import * as github from '@actions/github'
import {existsSync, promises as fsp} from 'fs'

interface Checkdiff {
  checksum: string
}

async function run(): Promise<void> {
  try {
    const modulePath: string = core.getInput('faktory_module')
    core.debug(`Reading from ${modulePath}`)

    const checkdiffPath = `${modulePath}/.faktory/checkdiff`
    if (existsSync(checkdiffPath)) {
      const fileData = await fsp.readFile(
        `${modulePath}/.faktory/checkdiff`,
        'utf8'
      )

      const fkdata: Checkdiff = JSON.parse(fileData)
      core.setOutput('checksum', fkdata.checksum)
    } else {
      core.setOutput('checksum', '')
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
