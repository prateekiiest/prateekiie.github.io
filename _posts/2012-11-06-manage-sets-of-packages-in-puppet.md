---
layout: post
title: "Manage sets of packages in puppet"
categories:
  - bash
  - rhel
  - puppet
  - rpm
  - ruby
tags:
  - automatic
  - package
  - list
  - redhat
  - rpm
  - puppet
  - purge
---

Not long ago, I posted an article on managing sets of packages using encoded lists in
puppet [here](http://www.ryanuber.com/). Recently I made an update to the logic to
provide a more generic way of managing package sets. Using the following puppet module
code, you can manage an entire system of packages using a single-file list.

Here is a simple example. You want to make a "profile" of sorts of a system to enforce
on other machines. You can create a package list by running the following on a redhat system:

```bash
rpm -qa > /root/package_list.txt
```

This would result in a very long list of RPM packages, similar to the following:

```
tzdata-2012f-1.el6.noarch
cronie-anacron-1.4.4-7.el6.i686
fuse-sshfs-2.4-1.el6.i686
tmpwatch-2.9.16-4.el6.i686
libuuid-2.17.2-12.7.el6.i686
isomd5sum-1.0.6-1.el6.i686
...
...
...
```

Having run the above command, you should now have a file that describes every single
package installed on your machine. In theory, you should be able to take this list and
apply it to other machines to create an identical software stack.

Using this module, you could write a puppet manifest like the following that would
make this possible:

```ruby
apply_package_list('/root/package_list.txt')
```

And with that, you would have effectively created a package resource for each package in your list.

If you'd also like to remove packages that shouldn't be installed, this module can examine every
package already installed on your system, and compare them against the list you fed in, creating
an ensure => absent on any package not mentioned in the list. Just pass one extra option to
enable this purging feature:

```ruby
apply_package_list('/root/package_list.txt', 'purge')
```

This works especially well using puppet apply locally, like so:

```bash
puppet apply -e 'apply_package_list("/root/package_list.txt")'
puppet apply -e 'apply_package_list("/root/package_list.txt", "purge")'
```

I would advise you to run puppet with the "--noop" argument first before applying a package list
all will-nilly.

Also noteworthy is that you can choose to specify a package version and architecture, or not to
grab the latest each time. Check the documentation within the module for more information on this.

```ruby
# Dynamically create package resources from list files
#
# @author    Ryan Uber <ryan@blankbmx.com>
# @license   Apache License, Version 2.0
# @category  functions
# @package   apply_package_list
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

module Puppet::Parser::Functions
  newfunction(:apply_package_list, :type => :statement, :doc =>
    "Dynamcially creates a package resource for each element in a list, and
    ensures that each version is enforced. Any package not defined in your
    package list will automatically generate a package resource with an
    ensure => absent, giving you the power to define exactly what you want
    on your system in one list and enforce it using Puppet.

    Basic Syntax:
    apply_package_list('/path/to/list/file', '[purge=nopurge]')

    The purge option determines whether or not to purge packages that do not
    appear in your package set. It defaults to nopurge. Set it to 'purge' to
    enable pruning, or omit it to skip the purging stage.

    You need to pass in the path of a file that contains a newline-delimited
    list of package names to apply. For each package in this list, an ensure
    will be dynamically created to latest. This allows you to either place
    an exact package version in (along with the name), or simply the package
    name if you want the latest from your mirror. Example follows:

      kernel-2.6.32-220.4.1.el6.x86_64
      grub-0.97-75.el6.x86_64
      vim-enhanced

    This would ensure that kernel and grub matched the versions specified, and
    the latest vim-enhanced from your configured mirrors.

    An easy way to create a package list for an entire system is using RPM
    directly. Examples follow.

    With versions:
    rpm -qa > /path/to/list/file

    Without versions (to get latest):
    rpm -qa --qf='%{name}\\n' > /path/to/list/file

    Limitations
    1) Inability to pass plain package names (without version/arch/release etc) with the "purge" option
    2) Only RPM-based operating systems are supported at this time.") do |args|

    if args.length == 0
      raise Puppet::ParseError, "No package list specified during apply_package_list()"
    end

    file  = args[0]
    purge = args.length > 1 ? args[1] : 'nopurge'

    if not File.exists?(file)
      raise Puppet::ParseError, "File '#{file}' not found during apply_package_list()"
    end

    packages = File.read(file).split("\n")

    if not ['purge', 'nopurge'].include?(purge)
      raise Puppet::ParseError, "Invalid argument '#{purge}' during apply_package_list()"
    end

    os = lookupvar('osfamily')
    if not ['RedHat'].include?(os)
      raise Puppet::ParseError, "Unsupported operating system detected during apply_package_list()"
    end

    allowed = Array.new

    packages.each do |package|
      catalog.add_resource Puppet::Type.type(:package).hash2resource(
        {:name => package, :ensure => "latest"}
      )
      allowed << package
    end

    if purge == 'purge'
      installed = %x(rpm -qa).split("\n") if os == 'RedHat'
      if installed == nil
        raise Puppet::ParseError, "Could not query local package database during apply_package_list()"
      end
      installed.each do |package|
        # In RHEL, GPG keys show up in this output, so skip them (we really don't want
        # to uninstall imported GPG keys)
        next if os == 'RedHat' and package.start_with?('gpg-pubkey')
        if not allowed.include?(package)
          catalog.add_resource Puppet::Type.type(:package).hash2resource(
            {:name => package, :ensure => "absent"}
          )
        end
      end
    end

  end
end
```
