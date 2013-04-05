---
layout: post
title: "Manage sets of packages using simple encoded lists in Puppet"
categories:
  - rhel
  - linux
  - puppet
  - rpm
  - ruby
  - security
tags:
  - ensure
  - absent
  - puppet
  - resource
---

## Update
An easier and more portable solution has been posted
[here](http://www.ryanuber.com/manage-sets-of-packages-in-puppet.html)

If you need to manage systems in a more hands-free than hands-on type of way, there will
inevitably come a time during the life cycle of a machine where you need to remove a
package. Whether it is because its functionality has been replaced by something better,
because the system's role within its environment is changing, or if you simply decided
you no longer need some piece of software installed, there is little that you can do in
any configuration management system short of creating a package rule that says that you
explicitly do not want that package installed.

The problem: Configuration management code pollution. Whether that means your code is
Puppet DSL, some Chef cookbooks, or in a software-independent encoding type like JSON,
XML, or YAML, somewhere, some place, you have to maintain the logic that you do not want
package "xyz" installed. A puzzling question then is when to remove that rule from your
code and be rid of the software completely, by content and by reference. If you remove
the reference to the package removal rule shortly after creating it, can you say with
confidence that the particular artifact has been removed from all of your systems? How
do you validate that it is indeed missing without having to maintain that reference forever?

One possible solution, which I have implemented in a Puppet parser function below, takes
in a list of packages from a standard encoding type, and enforces that *only* the packages
you want are installed on the machine. This is a two-step process in Ruby code. First, the
list is iterated over and a package resource is dynamically created with an ensure on the
specific version you have specified. Second, a list of all packages installed on the system
is compared to the list you fed in, and if there are any packages installed that you have
not specifically asked for, a package resource is dynamically created against that package
with an ensure => absent.

As cool as this is, you must exercise extreme caution while using it. If you do not review
your package list carefully you could end up accidently creating an ensure => absent on all
packages in the file system! If you have read this far, then you likely aren't the type to
make this kind of mistake and push it to production - but fair warning is due anyways. The
function defaults to not purging any un-mentioned packages, but the real
power in its use is by passing "purge" as the 3rd argument.

A good practice would be to check your package lists into source control somewhere, so
that packages added to your systems or leaving your systems is clearly traceable in your
application's history somewhere.

Install this function into puppet's parser/functions directory (in RHEL,
/usr/lib/ruby/site_ruby/1.8/puppet/parser/functions/apply_package_list.rb), then you can
write manifests using the function, or make calls to puppet from the command line very
easily with a command like one of these to test without actually evaluating:

```
$ puppet apply --noop -e 'apply_package_list("/path/to/yaml/file", "yaml", "purge")'
$ puppet apply --noop -e 'apply_package_list("/path/to/json/file", "json", "nopurge")'
```

Some sample lists are included in the puppet docs within the function, which can be
browsed post installation on the node by executing:

```
$ puppet doc -r function
```

Currently this function is only really tested under CentOS 6. That said, since Puppet
abstracts package management very easily, the only part of this that is OS-specific would be
the query for a list of installed packages (no built-in abstraction layer exists for this
that I am aware of). You will see in the code that I have included what I think would be
correct on Debian-based systems for querying a list of all installed packages, but I am not
sure if it is correct or not. I would also be interested in opinions on the list format.
Does Debian honor the same concepts that RedHat does with version and release? Are there
any additional version or package name parameters that would be missing for Debian, Solaris,
or other systems? Feedback is more than welcome, enjoy!

```ruby
# Dynamically create package resources from encoded lists
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
    "Dynamcially creates a package resource for each element in an encoded
    object, and ensures that each version is enforced. Any package not
    defined in your package list will automatically generate a package
    resource with an ensure => absent, giving you the power to define
    exactly what you want on your system in one list and enforce it using
    Puppet.
 
    Basic Syntax:
    apply_package_list('/path/to/list/file', '[encoding=yaml]', '[purge=nopurge]')
 
    The encoding option will default to YAML if omitted, but can optionally
    be set to JSON to decode a JSON file instead. JSON decoding requires the
    json gem to be installed.

    The purge option determines whether or not to purge packages that do not
    appear in your package set. It defaults to nopurge.
 
    You need to feed in one encoded object containing a structure
    of package data. Examples follow.
 
    YAML:
    -
      name: \"kernel\"
      version: \"2.6.32\"
      release: \"220.4.1.el6\"
      arch: \"x86_64\"
    -
      name: \"grub\"
      version: \"0.97\"
      release: \"75.el6\"
      arch: \"x86_64\"
 
    JSON:
    [
      {
        \"name\":\"kernel\",
        \"version\":\"2.6.32\",
        \"release\":\"220.4.1.el6\",
        \"arch\":\"x86_64\"
      },
      {
        \"name\":\"grub\",
        \"version\":\"0.97\",
        \"release\":\"75.el6\",
        \"arch\":\"x86_64\"
      }
    ]
 
    This would ensure that kernel and grub matched the versions specified.
    You can also use keywords rather than versions by passing in an empty
    release, and using the keyword you want in the version section. For
    example, you could pass an empty release and \"latest\" as the version.
    This would ensure that the latest version of the package is installed.
 
    The architecture is not required on any package. However, if present,
    it does affect the way this function operates. If a non-null value
    other than the rare '(none)' architecture type is specified, the
    arch will be appended to the package name, creating a way for puppet
    to enforce architecture.
 
    Limitations:
    1) When checking installed packages against the provided list, only the
    name is validated. If there are multiple versions of an RPM installed,
    versions other than what is specified in your list would not be flagged
    for removal.
    2) Only RPM-based operating systems are supported at this time.") do |args|
 
    if args.length == 0
      raise Puppet::ParseError, "No package list specified during apply_package_list()"
    end

    file  = args[0]
    type  = args.length > 1 ? args[1] : 'yaml'
    purge = args.length > 2 ? args[2] : 'nopurge'
 
    if not File.exists?(file)
      raise Puppet::ParseError, "File '#{file}' not found during apply_package_list()"
    end
 
    if type == 'yaml'
      require 'yaml'
      packages = YAML.load_file(file)
    elsif type == 'json'
      require 'json'
      packages = JSON.parse(open(file).read)
    else
      raise Puppet::ParseError, "Encoding type '#{type}' not recognized during apply_package_list()"
    end

    if not ['purge', 'nopurge'].include?(purge)
      raise Puppet::ParseError, "Invalid argument '#{purge}' during apply_package_list()"
    end
 
    os = lookupvar('osfamily')
    if not ['RedHat', 'Debian'].include?(os)
      raise Puppet::ParseError, "Unsupported operating system detected during apply_package_list()"
    end

    allowed = Array.new
 
    packages.each do |package|
      ['name', 'version', 'release', 'arch'].each do |index|
        if not package.has_key?(index) or not package[index].kind_of?(String)
          raise Puppet::ParseError, "Unrecognized package format in file '#{file}' during apply_package_list()"
        end
      end
      e_name = package['name'] + ((package['arch'] != '') ? '.' + package['arch'] : '')
      e_version = package['version'] + (package['release'] != '' ? '-' + package['release'] : '')
      catalog.add_resource Puppet::Type.type(:package).hash2resource(
        {:name => e_name, :ensure => e_version}
      )
      allowed << package['name']
    end
 
    if purge == 'purge'
      installed = %x(rpm -qa --qf='%{name}\n').split("\n") if os == 'RedHat'
      installed = %x(dpkg --get-selections | awk '/install$/ {print $1}').split("\n") if os == 'Debian'
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
