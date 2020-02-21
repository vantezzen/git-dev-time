#!/usr/bin/env node
/**
 * Calculate an estimate of time a git user spend on a repository
 * 
 * @version 1.0.0
 * @author vantezzen
 * @license MIT
 * @copyright 2020
 */
// Load dependencies
const program = require('commander');
const simpleGit = require('simple-git/promise');
const path = require('path');

// Prepare variables for CLI arguments
let usernames;

// Init commander CLI
program
  .version('1.0.0')
  .arguments('<usernames...>')
  .description('Calculate an estimate of time a git user spend on a repository')
  .option('-m, --max-duration <duration>', 'Maximum duration in minutes between two commits in order to count as one session (default: 3h)', 3 * 60)
  .option('-d, --directory <directory>', 'Directory of the git repository', './')
  .option('-n, --no-days', 'Only calculate the total hours and don\'t calculate days')
  .option('-s, --session-begin <duration>', 'Number of minutes to add to each session', 0)
  .option('-a, --all', 'Check on all branches', 0)
  .action((u) => {
    usernames = u;
  });

// Helper function: Format number of seconds into a human-readable format
// DD:HH:MM:SS or HH:MM:SS if --no-days is set
const formatTime = (totalSeconds) => {
  let seconds = totalSeconds;
  let days;
  if (program.days) {
    days = Math.floor(seconds / 86400);
    seconds %= 86400;
  }
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  seconds = seconds % 60;

  if (program.days) {
    return `${days}:${hours}:${minutes}:${seconds}`;
  } else {
    return `${hours}:${minutes}:${seconds}`;
  }
}

// Start CLI
program.parse(process.argv);
if (typeof usernames === 'undefined') {
  program.outputHelp();
  process.exit(0);
}

// Prepare variables
const repoPath = path.resolve(program.directory);
const repo = simpleGit(repoPath);

let allUsersTime = 0;
let allUsersCommits = 0;
let allUsersSessions = 0;

// Let us work in an async environment to make working with multiple users easier
(async () => {
  // Check if the repostory actually exists
  try {
    await repo.status();
  } catch(e) {
    console.log('The directory you supplied might not contain a Git repository:', e.message);
    process.exit(1);
  }

  for (const username of usernames) {
    // git log will give us information about all commits the user has made
    let log;
    try {
      log = await repo.log({
        "--author": username,
        ...program.all ? {'--all': true} : {},
      });
    } catch (e) {
      console.log(`Couldn't get log for ${username}:`, e);
      continue;
    }
    
    const commits = log.all;
    if (!commits || !commits.length) continue;
    
    // Calculate time between commits
    let previousCommitTime = false;
    let totalTime = 0;
    let totalSessions = 1;
    for (const commit of commits) {
      const date = new Date(commit.date);
  
      if (!previousCommitTime) {
        // We have no previous data - simply set to the current commits date
        previousCommitTime = date;
        totalTime += program.sessionBegin * 60;
        continue;
      }
  
      // Calculate minute difference between last commit and this commit
      const diffMs = previousCommitTime - date;
      const diff = Math.abs(diffMs / 1000);
  
      if (diff < (program.maxDuration * 60)) {
        totalTime += diff;
      } else {
        totalTime += program.sessionBegin * 60;
        totalSessions += 1;
      }
  
      previousCommitTime = date;
    }

    allUsersTime += totalTime;
    allUsersCommits += commits.length;
    allUsersSessions += totalSessions;
  
    // Format data
    const time = formatTime(totalTime);
    const firstCommit = new Date(commits[commits.length - 1].date).toLocaleDateString();
    const lastCommit = new Date(commits[0].date).toLocaleDateString();
  
    console.log(`User "${username}" commited ${commits.length} times between ${firstCommit} and ${lastCommit} and spend ca. ${time} (DD:HH:MM:SS) in ${totalSessions} sessions on this repository.`);
  }

  // Output a summary of all users if we have multiple usernames
  if (usernames.length > 1) {
    const time = formatTime(allUsersTime);
    console.log(`All selected users combined commited ${allUsersCommits} commits and spend ca. ${time} (DD:HH:MM:SS) in ${allUsersSessions} sessions on this repository.`);
  }
})();

