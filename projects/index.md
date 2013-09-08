---
layout: default
title: Projects
---

<div class="post_title">Open Source Projects</div>
Below are some original open source projects I have released. I usually release
software under the MIT license.

---

### oaf
Oaf is a web app proof-of-concept framework for quickly creating dynamic
applications using whatever programming language is most natural to the
developer. Simple inputs and outputs plus the flexibility of any language which
can be run as an executable make it an easy solution for mocking and
prototyping.

([GitHub](https://github.com/ryanuber/oaf)) ([RubyGems](http://rubygems.org/gems/oaf))

---

### pakrat
Pakrat is a python library and command line utility for mirroring and optionally
versioning YUM repositories.

([GitHub](https://github.com/ryanuber/pakrat)) ([PyPI](https://pypi.python.org/pypi/pakrat))

---

### veneer
veneer is an experimental framework for creating RESTful API's in PHP. It
features a simple router, built-in input validation and documentation
facilities, and integrates easily with other useful frameworks and protocols.

([GitHub](https://github.com/ryanuber/veneer))

---

### veneer-swagger
veneer-swagger is an endpoint definition for the veneer framework that exposes
all defined endpoint documentation via a RESTful interface that can be directly
consumed by the swagger protocol from Wordnik. When coupled with swagger-ui
(also from Wordnik), you can have interactive API documentation almost for free.

([GitHub](https://github.com/ryanuber/veneer-swagger))

---

### puppet-packagelist
puppet-packagelist is a puppet module which can be used to define all packages
to be installed on a given system. It offers a `purge` option, which can remove
any packages that are not defined in the list you pass in. Lists can be passed
in as simple text files or within puppet as an array.

([GitHub](https://github.com/ryanuber/puppet-packagelist)) 
([Puppet Forge](http://forge.puppetlabs.com/ryanuber/packagelist))

---

### puppet-tell
puppet-tell is an experimental puppet module which can notify external parties
when resources are changed. As an example, you want to notify a web hook
whenever the Linux kernel is updated as part of your puppet run, puppet-tell can
do that for you. It supports web hooks and SMTP.

([GitHub](https://github.com/ryanuber/puppet-tell)) 
([Puppet Forge](http://forge.puppetlabs.com/ryanuber/tell))

---

### Sertify
Sertify was a weekend project to create an easy way of defining input validation
functions one time in a short and descriptive YAML file, and then generating
code in many languages based on the YAML template. It can generate code for
Bash, PHP, Ruby, and Python.

([GitHub](https://github.com/ryanuber/sertify))