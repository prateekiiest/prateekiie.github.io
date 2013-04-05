---
layout: post
title: "Conditionally create a file in puppet"
categories:
  - puppet
  - linux
---

I came up with this solution to conditionally create / initialize a configuration
file using Puppet. What I wanted to do was create the file if it did not exist or
if it was empty, add my header comments to it. As far as I know, and after an hour
or so of poking around Puppet's documentation,  I could not find an integrated way
of doing this. I like to avoid using rickity methods of accomplishing something
wherever possible, so I was about to scrap the idea altogether. However, I came up
with a moderately elegant solution that I was satisfied with to accomplish just
this, using an "unless" requirement. Here is the actual code, modified for this post:

```puppet
class httpd {
    $httpd_extras_file = "/etc/httpd/conf.d/zz_extras.conf"
    $httpd_extras_text = "# ADDITONAL APACHE CONFIGURATION FILE"
    exec { "c_zzhttpdextras":
        command     => "/bin/echo '$httpd_extras_text' > $httpd_extras_file",
        unless      => "/usr/bin/test -s $httpd_extras_file",
        require     => [
            File["dir_httpd_confd"],
            Package["httpd"]
        ];
    }
}
```

You could certainly reverse this logic to achieve the reverse effect, by using the
"onlyif" function rather than "unless".

Also notice the simple shell command that I run. I am using the `/usr/bin/test` command
to test a certain condition on the target file. From the man page of the `test` utility:

```
-s FILE
FILE exists and has a size greater than zero
```

The "unless" and "onlyif" statements listen to return codes only. So this achieves exactly
what I wanted. If the file is empty, or does not exist, the return code is "1", so the
shell command executes. If the file meets both conditions, a "0" is returned, and the
shell command is not run.

Also note my use of variables. The httpd_extras_file variable is used twice, so I am saving
some typing and hard code there. The httpd_extras_text variable is more of just keeping
the code clean visually, I could have just entered the text into the shell command.
However, I'll be editing these classes by hand in the future, so why not keep it clean and
readable.

## Follow up (April 28th, 2010)
I later found that it is more efficient to simply use the "replace" element of the file type.
You can see here that I explicitly tell Puppet not to replace the contents of the file:

```puppet
file { "zz_extras.conf":
    path    => "/etc/httpd/conf.d/zz_extras.conf",
    ensure  => present,
    require => Package["httpd"],
    owner   => "root",
    group   => "root",
    mode    => 0644,
    replace => false,
    content => "# ADDITIONAL APACHE CONFIGURATION FILE";
}
```

The above will cause Puppet to initialize the file, but once it exists, it will not replace the
contents again until the file does not exist at some future date. The only caveat of this is that
it will not add the comment header to the file if the file is 0 bytes, but only if the file is
absent entirely. Nonetheless, this is very handy for initializing files that don't already exist,
and I have switched my manifests to use this over the slightly-rickity method I posted previously.
I do notice one problem with both of the above recipes, however:

Say I wanted to "initialize" the /etc/httpd/conf/httpd.conf file to my standard configuration,
but to then never replace it again. Neither of the above two recipes will do this. Maybe it would
be helpful in some future release to have an additional parameter in the file type, like so:

```puppet
file { "zz_extras.conf":
    path    => "/etc/httpd/conf.d/zz_extras.conf",
    ensure  => present,
    require => Package["httpd"],
    owner   => "root",
    group   => "root",
    mode    => 0644,
    replace => true,
    once    => true,
    content => "# ADDITIONAL APACHE CONFIGURATION FILE";
}
```

I am not entirely sure that would be possible, as I don't know what would be keeping track of if the
file had already been initialized "once".
