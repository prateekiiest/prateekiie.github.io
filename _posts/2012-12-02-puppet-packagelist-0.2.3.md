---
layout: post
title: "Puppet packagelist module version 0.2.3 released"
categories:
  - rhel
  - linux
  - puppet
  - rpm
  - ruby
---

I have released version 0.2.3 of
[puppet-packagelist](http://forge.puppetlabs.com/ryanuber/packagelist). It contains some
very nice enhancements, which I'll be expanding upon very soon.

Differences in [0.2.3](http://forge.puppetlabs.com/ryanuber/packagelist/0.2.3):

* Custom type / provider replace the parser function
* Basic Debian support
* Much improved call syntax
* Ability to pass in lists derived from other places in puppet DSL
* Fixed name-only issue with RPM package provider, making it possible to specify packages
  without a version and still use the purging functionality
* Added lots of debugging statements for traceability

Calls to the module can now be made in ways similar to the following examples:

Create a package list:

```
# RedHat
rpm -qa > my-packages.lst
# Debian
dpkg-query --show > my-packages.lst
```

Keep kernel and grub at latest, don't purge other packages:

```
# RedHat
packagelist { 'mypackagelist': packages => [ 'kernel', 'grub' ] }
# Debian
packagelist { 'mypackagelist': packages => [ 'linux-image-generic', 'grub-common' ] }
```

Load in a packagelist from a list file (one package per line):

```
# RedHat / Debian
packagelist { '/root/my-packages.lst': }
```

Load in a packagelist file, purging anything not mentioned within it:

```
# RedHat / Debian
packagelist { '/root/my-packages.lst': purge => true }
```

Pass in a packagelist loaded from somewhere else, using both versioned and unversioned packages:

```ruby
# RedHat
$packages = [
  'kernel-2.6.32-279.el6.x86_64',
  'grub-0.97-77.el6.x86_64',
  'vim-minimal'
]

# Debian
$packages = [
  'linux-image-generic 3.5.0.17.19',
  'grub-common 2.00-7ubuntu11',
  'vim'
]

# RedHat / Debian
packagelist { 'mypackagelist':
  packages => $packages,
  purge    => false;
}
```

Pass in a packagelist loaded from a file using the source parameter:

```ruby
# RedHat / Debian
packagelist { 'mypackagelist':
    source => '/root/my-packages.lst',
    purge  => true;
}
```

[puppet-packagelist 0.2.3](http://forge.puppetlabs.com/ryanuber/packagelist/0.2.3) is release
under the MIT license. Previous versions were released under the Apache 2.0 license.
