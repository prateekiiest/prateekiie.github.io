---
layout: post
title: "Puppet package list module available on puppetforge"
categories:
  - puppet
  - rhel
  - ubuntu
tags:
  - absent
  - uninstall
  - ensure
  - centos
  - packagelist
  - puppet
  - redhat
  - scientific
  - uninstall
---

I put some time into completing and submitting my puppet packagelist module to puppetforge.
This means 2 things: I've created a public git repository on Github for the project, and
I've packaged it using puppet module build, making it available on puppetforge.

You can install the module on any system using the command:

```bash
puppet module install ryanuber-packagelist
```

## Public Github repo
[ryanuber/packagelist](https://github.com/ryanuber/puppet-packagelist)

## PuppetForge project page
[Packagelist Module](http://forge.puppetlabs.com/ryanuber/packagelist)

I must say I am impressed with the speed and ease that Puppet Labs has made my module
available for installation via the module install command. The build was a breeze, and
every step was self-explanatory and quick.

If you have some useful puppet module code lying around somewhere that you think others
could benefit from and would like to share, take it from me, it is way easier to make
it available to the public than some other open source projects.
