/* eslint-disable node/no-missing-import */
import { createBasicAuth } from '@octokit/auth-basic'
import { TokenAuthentication } from '@octokit/auth-basic/dist-types/types'
import { OctokitOptions } from '@octokit/core/dist-types/types'
import { Octokit } from '@octokit/rest'
import Clui from 'clui'
import ConfigStore from 'configstore'
import { logger } from '../logger'
import { askGithubCredentials, getTwoFactorAuthenticationCode } from './inquirer'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../../package.json')

const Spinner = Clui.Spinner

const conf = new ConfigStore(pkg.name)

export class GitHubService {
  private static instance: Octokit

  private constructor() {
    // The constructor is made private to prevent creating a
    // new instance of the class with the new keyword.
  }

  static auth(options: OctokitOptions): void {
    if (!GitHubService.instance) {
      GitHubService.instance = new Octokit(options)
    }
  }

  static getInstance(): Octokit {
    if (!GitHubService.instance) {
      logger.exit('An auth token needs to be passed to `GitHubService.auth` to create a singleton.')
    }

    return GitHubService.instance
  }

  static getStoredGithubToken(): string {
    return conf.get('github.token')
  }

  static async getPersonalAccesToken(): Promise<string | void> {
    const credentials = await askGithubCredentials()
    const status = new Spinner('Authenticating you, please wait...')

    status.start()

    const auth = createBasicAuth({
      username: credentials.username,
      password: credentials.password,
      async on2Fa() {
        status.stop()

        const res = await getTwoFactorAuthenticationCode()

        status.start()

        return res.twoFactorAuthenticationCode
      },
      token: {
        scopes: ['user', 'public_repo', 'repo', 'repo:status'],
        note: 'secretariat, the command-line tool for initalizing Git repos'
      }
    })

    try {
      const res = await auth() as TokenAuthentication

      if(res.token) {
        conf.set('github.token', res.token)

        return res.token
      } else {
        throw new Error("GitHub token was not found in the response")
      }
    } finally {
      status.stop()
    }
  }
}