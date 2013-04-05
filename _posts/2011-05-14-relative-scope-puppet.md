---
layout: post
title: "Global definitions and relative scope in Puppet"
categories:
  - puppet
---

After completing some big piece of code, before committing it is almost always helpful
to take a step back and look at it at a high level. Look for patterns and ways it can
be simplified. Using software like puppet, you will inevitably find many, many patterns
to the things you normally do with Unix systems. For instance, file permissions and
group ownership. Recently, I realized that I used the `mode`, `owner`, `group`, and
`notify` tags far too often throughout my puppet manifests when dealing with individual
files.

I realized that not all of the files need the same permissions, and not all of them need
the same owner or group. Most manifests, however, will contain 3 basic types: a package,
a file, and a service, or "PFS". These 3 types are related to the same thing, and most
likely will have the same owner and the same group at the minimum. My thinking behind
this is, you should only need to specify what user / group is going to own these files
and folders one time, and have it apply to everything else.

To demonstrate, here is what a typical puppet manifest might look like, writing
everything out, plain and simple:

```puppet
file {

    "file_1":
        path    => "/path/to/file_1",
        owner   => "someuser",
        group   => "somegroup",
        mode    => 0644,
        content => "This is a test.\n";

    "file_2":
        path    => "/path/to/file_2",
        owner   => "someuser",
        group   => "somegroup",
        mode    => 0644,
        content => "This is another test.\n";
}
```

You can already see the patterns emerging even though we have only defined two files so far.
So lets say we have 5 of these files. With the above method of defining the files /
attributes, your manifests might become quite long, especially if you are defining more
attributes that are common, like a <strong>require</strong> or maybe a <strong>notify</strong>.

The following example achieves the exact same effect as specifying the owner, group, and mode 
in each file definition, saving us 15 lines of duplicate definitions in just 5 file statements:

```puppet
File {
    owner   => "someuser",
    group   => "somegroup",
    mode    => 0644
}

file {
    "file_1":
        path    => "/path/to/file_1",
        content => "This is a test.\n";

    "file_2":
        path    => "/path/to/file_2",
        content => "This is another test.\n";

    "file_3":
        path    => "/path/to/file_3",
        content => "This is test 3.\n";

    "file_4":
        path    => "/path/to/file_4",
        content => "This is test 4.\n";

    "file_5":
        path    => "/path/to/file_5",
        content => "This is test 5.\n";
}
```

Now things might get a little trickier. You obviously won't have every file you manage owned
by the same user, or the same group, or with the same permissions. Two things come into play
here:

* The fact that we are only defining the defaults, and<
* Scope

Since what we have specified for owner, group, and mode already are only the defaults, you
can still define those attributes per-file. For instance:

```puppet
File {
    owner   => "someuser",
    group   => "somegroup",
    mode    => 0644
}

file {
    "file_1":
        path    => "/path/to/file_1",
        content => "This is a test.\n";

    "file_2":
        path    => "/path/to/file_2",
        owner   => "someotheruser",
        content => "This is another test.\n";
}
```

In the above example, "file_1" will get the defaults for all 3 attributes, and therefore
be owned by "someuser:somegroup". "file_2", however, overrides the default owner, and
will thus have ownership of "someotheruser:somegroup".

Now for scope. Suppose I have an Apache class and a MySQL class. These should not have
the same ownership. However, if I have defined the files, services, and other things
related to each piece of software in separate classes, then I am in luck.

Global defaults can be defined per-class, and are inherited.

```puppet
File {
    owner   => "root",
    group   => "root",
    mode    => 0700;
}

class "mysql"
{
    File {
        owner   => "mysql",
        group   => "mysql",
        mode    => 0644
    }

    file { "my.cnf":
        path    => "/etc/my.cnf",
        content => "This is a test.\n";
    }
}

class "httpd"
{
    File {
        owner   => "apache",
        group   => "apache",
        mode    => 0644
    }
    file { "httpd.conf":
        path    => "/etc/httpd/conf/httpd.conf",
        content => "This is another test.\n";
    }
}
```

You can see how the global defaults are defined at the top here, as "root:root" with
"0700" permissions. Then, within each class, new defaults are set for the files, and
therefore, within the scope of that class only, all file statements get the class-specific
permissions.

Use this technique throughout your manifests, and you will notice they will start to
appear much more simplistic and organized while accomplishing the same result. Also
keep in mind that this makes it infinitely easier to modify attributes at a wide scale
without re-keying the modifications again and again. Do be warned, however, adding a
new attribute to a defaults definition will affect many files, so be sure that it will
not negatively impact any one particular item in your manifests.
