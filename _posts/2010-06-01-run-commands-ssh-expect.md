---
layout: post
title: "Run commands on a gob of linux servers easily with ssh and expect"
categories:
  - bash
  - orchestration
---

Today I am sitting in Phoenix at one of my employer's datacenter locations. One of the first
tasks that I got when I arrived was to log in via SSH to just over 500 customer servers and
run a few commands to gather inventory information, including CPU speed, # of CPU's, and OS
version.

Now, when you look at that task with the mindset of "I have to log in to all of those?", you
will probably not be too happy about the work ahead of you. However, if you get a little
creative and start looking for ways to avoid such massive repetition, you might quickly come
to a solution similar to what I came up with.

I ended up using the `expect` command for SSH, since I did not have any SSH keys installed,
and I simply could not sit and paste in passwords for hours. I got the local sysadmin to install
the `expect` package on our central shell server, and whipped up a quick little script to do my
work for me. Keep in mind that this script will likely not apply to something you are doing,
because this particular case was a customer running FreeSSH on Windows servers, but it will give
you the general idea of how much you can do with so little code:

```bash
#!/usr/local/bin/expect
# =============================================================
# Filename:    GetInfo.exp
# Description: Echo's the output of systeminfo Windows command
# =============================================================

# Get variables from argv
set remote_server [lindex $argv 0]

# Spawn SSH session
spawn /usr/bin/ssh -o "StrictHostKeyChecking=no" user@$remote_server "systeminfo"
expect {
    "assword:" {
        set timeout 60
        send -- "root_password_here\r"
        send -- "\r"
    }
}

expect eof
# EOF
```

The above script will check only a single machine upon invocation -- opening up an SSH session, running
a command, and returning results to STDOUT. A few important things to note would be:

* Timeout -- Without this, if the password is incorrect, the expect script will have unpredictable
  results. Do not set this to 0 (=infinite) unless you are absolutely sure that all of the passwords
  you will be using are correct, otherwise the first time the password is wrong, the script will hang,
  as the SSH client will be waiting for you to try entering the root password again.
* StrictHostKeyChecking -- Unless you have already accepted all of the RSA fingerprints for the hosts
  you are about to connect to, this must be set to "no" so that the SSH client does not prompt you for
  a yes / no answer.
* This script is very extensible -- with light modification, you could pass the root password as an
  argument, effectively feeding it directly into the ssh command, as if the ssh client had a `--password`
  command line argument. I can see this opening up a lot of scripting ideas.

This is only half of the equation -- I then wrote a small bash script to loop through a set of hosts
(about 500-ish), get the needed information, parse through it, and append each server's data to a CSV
file.

```bash
#!/usr/local/bin/bash
# =============================================================
# Filename:    Audit.sh
# Description: Loops through server list and runs SSH commands
# =============================================================

cat ./servers.txt | while read IPADDR; do
    DATA=$(./GetInfo.exp ${IPADDR})
    VER=$(echo "${DATA}" | grep 'OS Name' | cut -d: -f 2-  | sed -e 's/^ *//g' | sed -e 's/,/ /g')
    NUMCPU=$(echo "${DATA}" | grep 'Processor(s)' | awk '{print $2}')
    CPU=$(echo "${DATA}" | grep -A${NUMCPU} 'Processor(s)' | grep -v 'Processor(s)')
    CPU=$(echo "${CPU}" | dos2unix | sed -e 's/^ *//g' | while read CPUTMP; do echo -n "${CPUTMP},"; done)
    echo "${IPADDR},${VER},${CPU}" | dos2unix >> Info.csv
done

# EOF
```

Notice how I ended up having to use `dos2unix` to normalize the output before being able to use it
effectively. Another tricky thing about this script was that it needed to identify the type and quantity of
CPU's the hosts had. In the above bash code, I actually got the CSV to include a cell-separated list of
processors for each host.

Ghetto? Slightly. Valuable? Yes. Time-saving? Absolutely.
