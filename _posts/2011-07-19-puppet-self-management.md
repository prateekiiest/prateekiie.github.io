---
layout: post
title: "Puppet Self-Management"
categories:
  - linux
  - puppet
---

As configuration becomes more and more automatic while using puppet, at some point you
will start thinking about how you will go about managing puppet's configuration itself.
Your first thought was probably "I'll just use puppet!" which is certainly the right
attitude, however there are a couple of caveats. One such caveat is managing the puppet
service. Let's say you organize your manifest for managing puppet in a pretty standard
fashion. You are managing puppet.conf, which notifies the puppet service when it is
changed (or the puppet service is subscribed to the file, or both). This is all well and
good. It's how you would manage just about any other package/file/service manifest.

The problem is this: Puppet begins to run, it updates its config file, and then notifies
the service to restart due to the change. The service restart will not necessarily be
the very last thing to happen during the puppet run, so if you are in the middle of a
run and the service restarts, you are most likely going to be in a bit of trouble.
Typically what happens is that the running process gets killed prematurely, causing
puppet's state file to become corrupted. This isn't the end of the world. However, if
the lock file did not get removed as part of the service shutdown, you might be in
slightly more serious trouble. Normally at this point, you would probably need to log
in to the machine via SSH to correct the issue. Not a huge deal, unless you are managing
a large number of systems.

All of this trouble can be avoided. At some point, maybe puppetd will be able to catch
the SIGHUP correctly and handle this whole thing gracefully on its own. Until that day
comes, I have come up with a small script that will help avoid this.

Essentially, what this script does is fork an "until" loop. The loop will check if the
"puppetdlock" file exists, which would indicate that a puppet run is in progress. If it
does, the loop will go back to sleep for a second and then try again. This is repeated
until the file goes away, indicating the whatever was running is now done. At this point
it would be safe to do a puppet restart, so the loop ends and the restart is then carried
out.

This of course will not give you an accurate "puppet restarted successfully" message,
because the only thing really being tested here is the success of the fork operation.
You must rely on centralized logging or similar to catch the unlikely puppet service
failure.

```bash
#!/bin/bash
# File Name:     restart-puppetd.sh
# Author:        Ryan Uber <ryan@blankbmx.com>
#
# Description:   This script is a hack! However, it solves a very important
#                issue with puppet. Normally, if you subscribe the puppet
#                service to the puppet.conf file, the puppet service will
#                be restarted too soon, interrupting the current puppet
#                run. Various attempts at using configure_delayed_restart
#                among other things have not proven to be 100% effective.
#                This script will watch the puppetdlock file, which can
#                determine whether or not there is a run in progress. If
#                there is a run in progress, we sleep for a second and then
#                test again until the process is unlocked. Once unlocked, we
#                can safely call a puppet restart. The checker process
#                itself gets forked into the background. If it were not
#                forked into the background, the puppet run would sit and
#                wait for the process to return, or for the exec timeout,
#                whichever came first. This would cause serious trouble if
#                timeouts were disabled or very long periods of time.

# Begin waiting for the current puppet run to finish, then restart.
/bin/sh -c "
    until [ ! -f /var/lib/puppet/state/puppetdlock ]
    do
        sleep 1
    done
    /sbin/service puppet restart" &

# Always return true, since this script just forks another process.
exit 0

# EOF
```
