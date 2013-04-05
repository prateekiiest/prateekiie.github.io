---
layout: post
title: "Mysterious puppet agent hangs, stale puppetdlock"
categories:
  - bash
  - puppet
---

Recently, there has been some strangeness happening with the puppet agent process
(puppetd), where during a run, the agent gets stuck and does not finish removing
the lock file. This results in a useless puppet agent, until it is restarted. This
can become a big problem for many reasons, mainly that nobody wants to have to
repeatedly log in to every machine to restart the puppetd service.

This issue is discussed at length in
[this](https://projects.puppetlabs.com/issues/12185#change-56530) thread

There is more than one way to solve this problem, so below I'll detail my solution.
Keep in mind that this is not intended to be a permanent fix, but merely a way of
keeping the machines running until a more elegant solution is implemented.

My solution is a simple cron/script type. Every 5 minutes, I run a script to check
the last modified time of the puppetdlock file, and compare it to the current
time. If it is older than 5 minutes, I call a puppetd restart. That's it!

```bash
#!/bin/bash
# File Name:     puppetd-hang-fix.sh
# Author:        Ryan Uber <ryan@blankbmx.com>
#
# Description:   This is a *TEMPORARY* fix to the common puppetdlock issue.
#                Running this script checks if the lock file is more than 5
#                minutes old, and if it is, restarts the puppet process.
#
# See Also:      https://projects.puppetlabs.com/issues/12185#change-56530

# Path to the puppetdlock file
FILE=/var/lib/puppet/state/puppetdlock

# Number of minutes since last modification that indicate a stale lock file
STALEMIN=5

# UNIX timestamp of last puppetdlock modification
MODIFIED=$(stat -c %Y ${FILE})

# Current UNIX timestamp
NOW=$(date +%s)

# Check if file is stale or not and restart if it is.
if [ $((${NOW}-${MODIFIED})) -gt $((${STALEMIN}*60)) ]
then
    /sbin/service puppet restart
fi

# EOF
````

See one of my [other posts](http://www.ryanuber.com/simple-and-efficient-cron-management.html)
if you are interested in how I went about pushing out the cron job.
