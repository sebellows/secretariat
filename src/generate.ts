import clear from 'clear'
import figlet from 'figlet'

import { logger } from './logger'
import { pathExists } from './utils/fs'
import { GitHubService } from './utils/git'
import { RepoService } from './utils/repo'

clear();

console.log(
  logger.warn(
    figlet.textSync('Secretariat', { horizontalLayout: 'full' })
  )
);

if (pathExists('.git')) {
  logger.exit('Already a Git repository!')
}

const getGithubToken = async () => {
  let token = GitHubService.getStoredGithubToken()

  if (token) {
    return token
  }

  token = await GitHubService.getPersonalAccesToken() as string

  return token;
};

const run = async () => {
  try {
    // Retrieve & Set Authentication Token
    const token = await getGithubToken()

    GitHubService.auth({ auth: token })

    // Create remote repository
    const url = await RepoService.createRemoteRepo()

    // Create .gitignore file
    await RepoService.createGitignore()

    // Set up local repository and push to remote
    await RepoService.setupRepo(url as string)

    logger.success('All done!')
  } catch(err) {
      if (err) {
        switch (err.status) {
          case 401:
            logger.error('Couldn\'t log you in. Please provide correct credentials/token.')
            break;
          case 422:
            logger.error('There is already a remote repository or token with the same name')
            break;
          default:
            logger.error(err)
        }
      }
  }
};

run();