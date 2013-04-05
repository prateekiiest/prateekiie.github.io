---
layout: post
title: "tell - A puppet module to notify external parties of resource changes"
categories:
  - http
  - mail
  - puppet
  - ruby
---

Over this past weekend, I experimented with writing a puppet module to invoke web hooks
and / or send email messages when things change in Puppet. I wanted something that would
notify me whenever the kernel package was updated on any of my systems, so that I could
plan on rebooting them myself at a convenient time. I thought for quite some time about
just automatically rebooting them, but later decided that I wanted to be at the computer
as they were rebooting just in case anything went wrong.

The solution came out pretty nice - which is why I've posted it on forge.puppetlabs.com
and created a git repo for it. It allows very simple syntax to notify via email or
webhooks whenever a resource changes, based on relationships, much the same way the the
'exec' type relationships work with the 'refreshonly' option.

You can find release 0.1.0 of this project at the following locations:
[Github](https://github.com/ryanuber/puppet-tell)
[Puppet Forge](http://forge.puppetlabs.com/ryanuber/tell)

## Example
In this example, the vim-enhanced package changes to 'latest' from 'absent'. The example
results would be POST'ed to a web service via HTTP if you are using a web hook, or an
email would have been sent through the default system relay if you are 'telling' an
email address about the resource change.

```
Package {
    notify => [
        Tell['package_updated_email'],
        Tell['package_updated_webhook']
    ]
}

package { "vim-enhanced": ensure => "latest" }

tell {
    'package_updated_email':
        dest => 'myself@mydomain.com';

    'package_updated_webhook':
        dest => 'http://rest.example.com/v1/package-update-notifications',
        post => 'packagedata';
}
```

When you run it, you will see something like this:

```
/Stage[main]//Package[vim-enhanced]/ensure: created
/Stage[main]//Tell[package_updated_webhook]: Triggered 'refresh' from 1 events
/Stage[main]//Tell[package_updated_email]/returns: Successfully told myself@mydomain.com
/Stage[main]//Tell[package_updated_email]: Triggered 'refresh' from 1 events
Finished catalog run in 8.26 seconds
```

Results in the default YAML format:

```
---
  - exported: false
    title: vim-enhanced
    parameters:
      !ruby/sym configfiles: !ruby/sym keep
      !ruby/sym ensure: "7.2.411-1.8.el6"
      !ruby/sym provider: !ruby/sym yum
      !ruby/sym loglevel: !ruby/sym notice
      !ruby/sym notify:
        - Tell[package_updated]
    type: Package
    tags:
      - package
      - vim-enhanced
      - class
  - exported: false
    title: Main
    parameters:
      !ruby/sym name: admissible_Class[Main]
      !ruby/sym loglevel: !ruby/sym notice
    type: Admissible_class
    tags:
      - admissible_class
      - main
```

Results in JSON format (requires 'json' rubygem)

```
[
  {
    "title": "vim-enhanced",
    "type": "Package",
    "parameters": {
      "ensure": "7.2.411-1.8.el6",
      "configfiles": "keep",
      "provider": "yum",
      "loglevel": "notice",
      "notify": [
        "Tell[package_updated]"
      ]
    },
    "exported": false,
    "tags": [
      "package",
      "vim-enhanced",
      "class"
    ]
  },
  {
    "title": "Main",
    "type": "Admissible_class",
    "parameters": {
      "name": "admissible_Class[Main]",
      "loglevel": "notice"
    },
    "exported": false,
    "tags": [
      "admissible_class",
      "main"
    ]
  }
]
```
