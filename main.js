const core = require('@actions/core')
const exec = require('@actions/exec')
const github = require('@actions/github')

async function run() {
  // Inputs
  const repository = core.getInput('repository', {required: true})
  const ref = core.getInput('ref', {required: true})
  const token = core.getInput('token', {required: true})
  const name = core.getInput('name', {required: true})

  // Git clone
  await exec.exec('git', ['clone', `https://github.com/${repository}`])

  // Chdir
  const repositoryName = repository.split('/')[1]
  process.chdir(`${repositoryName}/src`)
  await exec.exec('pwd')

  // Git checkout
  await exec.exec(git, ['checkout', ref])

  // Build
  await exec.exec('./dev.sh', ['layout'])

  // Chdir
  process.chdir('../_layout')
  await exec.exec('pwd')

  // Config
  await exec.exec(
    './config.sh',
    [
      '--unattended',
      '--replace',
      '--name',
      name,
      '--url',
      `https://github.com/${github.context.repo.owner}/${github.context.repo.repo}`,
      '--token',
      token
    ])

  // Run
  await exec.exec('./config.sh')
}

run()
.catch((err) => {
  core.error(err.message)
  process.exitCode = 1
})