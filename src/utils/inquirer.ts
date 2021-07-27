import inquirer from 'inquirer'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { getRootDirectory } from './fs'

export const askGithubCredentials = (): Promise<{ username: string; password: string }> => {
  const questions = [
    {
      name: 'username',
      type: 'input',
      message: 'Enter your GitHub username or e-mail address:',
      validate: function (value: string) {
        if (value.length) {
          return true
        } else {
          return 'Please enter your username or e-mail address.'
        }
      }
    },
    {
      name: 'password',
      type: 'password',
      message: 'Enter your password:',
      validate: function (value: string) {
        if (value.length) {
          return true
        } else {
          return 'Please enter your password.'
        }
      }
    }
  ]

  return inquirer.prompt(questions)
}

export const getTwoFactorAuthenticationCode = (): Promise<Record<string, string>> => {
  return inquirer.prompt({
    name: 'twoFactorAuthenticationCode',
    type: 'input',
    message: 'Enter your two-factor authentication code:',
    validate: function(value) {
      if (value.length) {
        return true
      } else {
        return 'Please enter your two-factor authentication code.'
      }
    }
  })
}

export const askRepoDetails = (): Promise<Record<string, string>> => {
  const { argv } = yargs(hideBin(process.argv))

  const questions = [
    {
      type: 'input',
      name: 'name',
      message: 'Enter a name for the repository:',
      default: argv._[0] || getRootDirectory(),
      validate: function(value: string) {
        if (value.length) {
          return true
        } else {
          return 'Please enter a name for the repository.'
        }
      }
    },
    {
      type: 'input',
      name: 'description',
      default: argv._[1] || null,
      message: 'Optionally enter a description of the repository:'
    },
    {
      type: 'list',
      name: 'visibility',
      message: 'Public or private:',
      choices: [ 'public', 'private' ],
      default: 'public'
    }
  ]

  return inquirer.prompt(questions)
}

export const askIgnoreFiles = (filelist: string[]): Promise<{ ignore: string[] }> => {
  const questions = [
    {
      type: 'checkbox',
      name: 'ignore',
      message: 'Select the files and/or folders you wish to ignore:',
      choices: filelist,
      default: ['node_modules']
    }
  ]

  return inquirer.prompt(questions)
}
