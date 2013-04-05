---
layout: post
title: "Puppet and RPM verification problems"
categories:
  - rhel
  - puppet
  - rpm
---

Over Friday and Saturday, I spent some time dealing with a funny little puppet issue
that only affects RedHat installations. Most people probably don't care too much about
RPM verification, but when you use it as one of the building blocks for your auditing
suite, you start to notice these little nuances.

The problem was a bit obscure and might not even be caught until production depending
on how you test. The Puppet RPM would verify cleanly at install time. Only once the
application did something that writes a log (like changing a resource, for example),
the problem would surface. What is actually happening is that the puppet app itself
changes the permissions of your $logdir, no matter what it is set to, to 0750. While
these are very reasonable permissions, they are not applicable to every use case.

I filed two tickets with Puppetlabs:

[#17866](http://projects.puppetlabs.com/issues/17866)

[#17876](http://projects.puppetlabs.com/issues/17876)

A helpful update on [#17876](http://projects.puppetlabs.com/issues/17876) from Dominic
Cleal was posted shortly after:

> The idea is that Puppet manages its own dirs/files by default. You can turn it off
> with manage_internal_file_permissions or you can override individual settings with
> the curly brace puppet.conf syntax. Unfortunately the latter is broken in 3.x, see
> \#17371. Sounds like the related issue is a discrepancy between the default in the RPM
> and the app.

Check out the
[curly brace puppet.conf syntax](http://docs.puppetlabs.com/guides/configuring.html#file-format)
he mentioned - it is good to know. While this curly brace syntax does fix the issue,
I still wanted a clean way (without having to modify configs) to install Puppet's RPM
and just run local apply's without breaking RPM verify. After digging through some
code and other bug reports, I decided the easiest solution would be to just update
the RPM .spec file with the correct permissions.

You can see the
[pull request at Github](https://github.com/puppetlabs/puppet/pull/1308) that I
submitted. Simple enough - but still makes me think that anyone who sets $logdir
to anything other than /var/log/puppet that is managed by some other RPM
(/var/log for example) will have broken RPM verification as a result.
