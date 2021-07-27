import fs from 'fs'
import Clui from 'clui'
import AsyncGit from 'simple-git/promise'
import touch from 'touch'

import { getFileNames } from './fs'
import { GitHubService } from './git'
import { askIgnoreFiles, askRepoDetails } from './inquirer'

const git = AsyncGit()

const Spinner = Clui.Spinner

export class RepoService {
  private static instance: RepoService

  private constructor() {
    // The constructor is made private to prevent creating a
    // new instance of the class with the new keyword.
  }

  static getInstance(): RepoService {
    if (!RepoService.instance) {
      RepoService.instance = new RepoService()
    }

    return RepoService.instance
  }

  static async createRemoteRepo(): Promise<string | void> {
    const github = GitHubService.getInstance()
    const answers = await askRepoDetails()

    const data = {
      name: answers.name,
      description: answers.description,
      private: (answers.visibility === 'private')
    }

    const status = new Spinner('Creating remote repository...')

    status.start()

    try {
      const response = await github.repos.createForAuthenticatedUser(data)

      return response.data.ssh_url
    } finally {
      status.stop()
    }
  }

  static async createGitignore(): Promise<void> {
    const filenames = await getFileNames('.') ?? []
    const filelist = filenames.filter(filename => !['.git', '.gitignore'].includes(filename))

    if (filelist.length) {
      const answers = await askIgnoreFiles(filelist)

      if (answers.ignore.length) {
        fs.writeFileSync( '.gitignore', answers.ignore.join( '\n' ) )
      } else {
        touch( '.gitignore' )
      }
    } else {
      touch('.gitignore')
    }
  }

  static async setupRepo(url: string): Promise<void> {
    const status = new Spinner('Initializing local repository and pushing to remote...')

    status.start()

    try {
      await git.init()
      await git.add('.gitignore')
      await git.add('./*')
      await git.commit('Initial commit')
      await git.addRemote('origin', url)
      await git.push('origin', 'main')
    } finally {
      status.stop()
    }
  }
}