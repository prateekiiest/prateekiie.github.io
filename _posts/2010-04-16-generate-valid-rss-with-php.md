---
layout: post
title: "Generate valid RSS using PHP"
categories:
  - php
  - web
---

I recently wrote a PHP script to generate an RSS feed from a MySQL database. At my job,
we used to have everything controlled via Subversion, even per-host configuration files.
You can imagine how messy that got with over 200 host configurations on our managed network.

In order to keep all of the related departments informed of what was going on with our
application, we set up Subversion post-commit hooks that would send an email off to
everyone with a diff of the changes.

We have now gotten away from enforcing revision control on all configuration files, and
we now only use Subversion for application code, shared configuration files, and a few
other things. This keeps our code base nice and clean.

Back to the RSS, I've now written a web-enabled application that actually generates
configuration files for iptables, rsyslog, mod_security, apache, php, MySQL, YUM
repositories, etc etc. Now how are we to know when someone makes a configuration change
to one of our managed servers? A-Ha! By the use of an RSS feed that people can
subscribe to. Of course!

It was easy enough to throw a little PHP together to query a database and spit out some
XML, but actually getting the RSS feed to validate at W3C was an interesting adventure.
Here are a few things that I found:

The "Content-Type" header needs to be set correctly. I accomplished this like so:

```
/* Print RSS/XML Content-Type */
header('Content-type: application/rss+xml; charset=utf-8');
```

The xml and rss version tags need to be set. In this case, I am using Atom:

```
<?xml version="1.0"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
```

Carefully define your Channel. For most of our applications, I can really only see one
channel being necessary for what I am creating the RSS feed for.

```
<channel>
    <title>My Title Here</title>
    <link>https://mysite.domain.com</link>
    <atom:link href="https://mysite.domain.com/rss.php" rel="self" type="application/rss+xml" />
    <description>Event log viewer for configuration changes</description>
```

Generate a separate item tag for each element in your feed, like this:

```
<item>
    <title>PUPPETRUN SUCCESS=ds00001</title>
    <link>https://mysite.domain.com/?e=209</link>
    <guid>https://mysite.domain.com/?e=209</guid>
    <author>me@domain.com (ryanu)</author>
    <pubDate>Thu, 15 Apr 2010 18:21:40 CDT</pubDate>
    <description></description>
</item>
```

Now, notice above that the link and guid both point to the same URL. The RSS validator would not
validate me if one or the other was missing, and the GUID needs to be in the form of a URL. I
didn't have two URL's that needed to be included, so I simply set them to the same thing. This
is not necessary, and if you can think of a better reason to use it, more power to you.

Also notice that my description is missing. I did not need this as I am using libnotify to query
my RSS feed, and all I need is a simple "This person performed this action at this time". This
is already accomplished with author, description, and pubDate.

pubDate is very sensitive. Make sure you are generating the pubDate tag in exactly the correct
format, which I accomplished by converting a UNIX timestamp like so:

```
$pubDate = date ( 'D, d M Y H:i:s T', $unixTime );
```

Make sure you close up your open tags at the end of the script, or it will not validate. </channel>
and </rss> at the end will most likely take care of this.
