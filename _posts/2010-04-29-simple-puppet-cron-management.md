---
layout: post
title: "Simple and effecient cron management with puppet"
categories:
  - puppet
  - linux
  - rhel
  - automation
---

Keeping track of scheduled cron jobs is not always the easiest thing to do with Puppet --
especially if you are managing systems that other people may have added their own cron
jobs to, whether that be within the cron configuration files or in an individual user's crontab.

Equally difficult is managing a plethora of servers and being responsible for performing
and maintaining the backups for all of them. A small part of this includes dumping MySQL
databases into a portable format on a regular basis.

Puppet makes both of these tasks easy. So, in order to get the backups running via cron,
let's explore some options.

## Managing cron jobs
Keeping tabs on your cron jobs (no pun intended) is actually a lot simpler than one would
think with Puppet. However it took me a few go's at implementation before I came to a sound
solution.

The first thing I tried was using Puppet's built-in cron class, like this:

```puppet
cron { "dbdump":
    command => "/usr/local/sbin/dbdump",
    user    => "root",
    hour    => 0,
    minute  => 0
}
```

As you see, I created a script called dbdump to be run by this cron entry. It is a simple bash
script that performs a `SHOW DATABASES;`, loops through them, and dumps them all to flat text
files utilizing mysqldump.

That aside, this solution I deemed unfit for what my employer needs to accomplish with this.
Modification of a user's crontab is harshly discouraged if the crontab is also managed by Puppet.
You may not want to grant an inexperienced user access to modify your manifests (in fact, you 
absolutely don't want to do that), so to manage scheduled tasks, they might need to use the
crontab. Let's not have a human _and_ puppet modifying the same cron tab.

The next solution I pondered was simply managing /etc/crontab, that way I could let the system
administrator manage root's crontab, while I could still modify scheduled tasks via the crontab
file. This solution I also see as unfit to this implementation, as it then prevents the sysadmin
from specifying when their daily, weekly, and monthly cron jobs run, changing the email address
of the user to notify about cron failures, and all other cron specifics.

My third and final solution works brilliantly, with almost no hassle, and without any of the
mentioned potential issues. Have you ever taken a look in `/etc/cron.d`? If not, I highly recommend
it. Essentially, what this empowers you to do, is have an individual file for individual cron jobs,
in much the same fashion as Apache's `/etc/httpd/conf.d` directory works.

So let's take a look at my manifest. I wanted to maintain maximum compatibility, so I am not going
to manage the entire `/etc/cron.d` directory, but rather individual files within it. Below is an
example of my "dbdump" cron job as configured by Puppet:

```puppet
file { "dbdump.cron":
    path    => "/etc/cron.d/dbdump.cron",
    ensure  => present,
    owner   => "root",
    group   => "root",
    mode    => 0644,
    require => [
                Package["mysql-server"],
                Service["mysqld"]
               ],
    content => "0 0 * * * root /usr/local/sbin/dbdump\n";
}
```

The above in itself will effectively attempt to run `/usr/local/sbin/dbdump` once every day at midnight.
When applied to the server, the file `/etc/cron.d/dbdump.cron` is created, which the crond service reads
and executes at the specified time. Now wasn't that simple? Add as many different file clauses as you
want using this as a template and you can effectively build out your cron configuration without your
users losing any functionality whatsoever.

Also notice that rather than specifying "source" for the file, I merely used "content" since the text
within the cron script is so short in length.

One last, but important thing to note is the "\n" I have trailing the actual cron text. This is not for
aesthetics in the file -- it is a functional requirement. My cron jobs would not run without it.
