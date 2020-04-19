# git-dev-time
Calculate an estimate of the time a user spend on a repository.

git-dev-time gives you various stats about users from a Git repository:
- Total number of commits
- Timeframe in which the commits have been made
- Estimated time spend on the project (based on when commits have been made)
- Number of programming sessions the user made (based on when commits have been made)
- Estimate, how much that work would have cost when paying by hours

This CLI was originally created to retroactively give an estimate of how many hours I needed to complete a project. Please don't actually use this to bill your client - this method is very inacturate in telling how much time you've actually spent and should only give a general area.

Example:
```bash
$ git-dev-time vantezzen Gert invalidUser
User "vantezzen" commited 184 times between 13/11/2019 and 24/02/2020 and spend ca. 2:11:19:31 (DD:HH:MM:SS) in 52 sessions on this repository.
With an hourly wage of $70 this would cost $4200.

User "Gert" commited 124 times between 01/12/2019 and 24/02/2020 and spend ca. 1:21:21:46 (DD:HH:MM:SS) in 35 sessions on this repository.
With an hourly wage of $70 this would cost $3220.

All selected users combined commited 308 commits and spend ca. 4:8:41:17 (DD:HH:MM:SS) in 87 sessions on this repository.
With an hourly wage of $70 this would cost $7350.
```

In order for the CLI to calculate the time spend on the repository, it will simply calculate the time between commits.

## Installation
In order for git-dev-time to work, you'll have to have [NodeJS](https://nodejs.org/) with npm and the [Git CLI](https://git-scm.com/downloads) installed on your computer first.

### Using npx
Simply execute
```bash
npx git-dev-time <usernames...>
```
in a directory that contains a Git repository. Replace `<usernames...>` with a list of usernames you want the stats for (see [Usage](#usage) below for more information).

### Installing the CLI globally
Alternatively you can install the CLI globally using npm or yarn
```bash
npm i -g git-dev-time
```

You can then execute the CLI using
```bash
git-dev-time <usernames...>
```
in a directory that contains a Git repository.

### Installing the CLI locally
You can also clone this repository and install its dependencies using
```bash
npm install
```

You can then execute the CLI using
```bash
npm start <usernames...>
```

When installing the CLI locally you probably want to use the `--directory (-d)` flag to set a path to a Git repository outside the current one.

## Usage
```bash
Usage: git-dev-time [options] <usernames...>

Calculate an estimate of time a git user spend on a repository

Options:
  -V, --version                   output the version number
  -m, --max-duration <duration>   Maximum duration in minutes between two commits in order to count as one session (default: 3h = 180)
  -d, --directory <directory>     Directory of the git repository (default: "./")
  -n, --no-days                   Only calculate the total hours and don't calculate days
  -s, --session-begin <duration>  Number of minutes to add to each session (default: 0)
  -a, --all                       Check on all branches
  -w, --wage <wage>               Hourly wage (to calculate cost of the work) (default: 70)
  -h, --help                      output usage information
```

Examples:
```bash
git-dev-time vantezzen # Get stats for user "vantezzen"
git-dev-time vantezzen notch # Get stats for user "vantezzen" and user "notch"
git-dev-time vantezzen -d /usr/home/me/repositories/example # Get stats for user "vantezzen" for the Git repository that's inside the directory
```

#### CLI behaviour
Users that have never commited will be ignored and nothing will be output. When trying to get stats for a directory that doesn't contain a Git repository, an error will be thrown.

The CLI will use the username contained _in the commit_ itself - this isn't always the GitHub/GitLab/etc. username! Please check the Git log to see the Git username a developer used.

You don't necessarily have to run the CLI in the root directory in order for it to detect your Git repository. git-dev-time uses the Git command under the hood which allows you to execute it in any subdirectory of your Git repository.

If you get stats for multiple users, the CLI will also print a combined summary.

#### --all
By default, git-dev-time will only use commits on the current branch. If you want to use commits from all branches, supply the `--all` argument.

#### Sessions
There is a duration threshold between commits (`--max-duration`): If this threshold is reached, the time between the commits will not be counted (e.g. to not count the times when the developer has slept or took a longer break).

These blocks of commits are called "sessions". You can specify a number of minutes that should be added for each session, e.g. to accommodate for the time spend before the first commit of a session was made, using `--session-begin`.

## License
This project is licensed under the MIT License.