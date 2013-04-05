---
layout: post
title: "SpamAssassin Filter Failure"
categories:
  - linux
  - mail
  - spam
  - zimbra
---

An interesting topic that I had forgotten entirely about until recently was a pretty serious
SpamAssassin flaw in one of the built-in filters. Many of you have probably seen this in the past:

```
3.4 FH_DATE_PAST_20XX The date is grossly in the future.
```

I noticed this on a Plesk server today. Apparently, they have not released any of their "hotfixes"
that would prevent this from tagging legitimate email as spam.

Just look at that score that it gets you, a whopping 3.4! Most people find it necessary to set their
spam filters to a pretty aggressive threshold, maybe around 4-ish for a message to never make it to
your inbox, but go directly to spam. That means that in essence, almost any other SpamAssassin or
email-in-general no-no would sink you email battleship.

Whoever wrote this rule initially never took into account the "20XX" is actually inclusive of the
current year, 2010. This also begs the question, why on earth is this particular rule written
relative to the time the rule was published, rather than relative to the current date on the
server instead?

Now there may have been a patch or similar released for this by now that does just that, but in
case the version you are running is "organizing" all of your legitimate email into the spam folder,
here is a quick and dirty way around it. I run Zimbra, so the file location in this example might
not match your installation. Add the following information to:

/opt/zimbra/conf/spamassassin/local.cf:

```
# This is the right place to customize your installation of SpamAssassin.
#
# See 'perldoc Mail::SpamAssassin::Conf' for details of what can be
# tweaked.
#
# Only a small subset of options are listed below
#
#############################################

#   Add *****SPAM***** to the Subject header of spam e-mails
#
# rewrite_header Subject *****SPAM*****

score FH_DATE_PAST_20XX 0.0

#   Save spam messages as a message/rfc822 MIME attachment instead of
#   modifying the original message (0: off, 2: use text/plain instead)
#
# report_safe 1


#   Set which networks or hosts are considered 'trusted' by your mail
#   server (i.e. not spammers)
#
# trusted_networks 212.17.35.


#   Set file-locking method (flock is not safe over NFS, but is faster)
#
# lock_method flock


#   Set the threshold at which a message is considered spam (default: 5.0)
#
# required_score 5.0


#   Use Bayesian classifier (default: 1)
#
# use_bayes 1


#   Bayesian classifier auto-learning (default: 1)
#
# bayes_auto_learn 1


#   Set headers which may provide inappropriate cues to the Bayesian
#   classifier
#
# bayes_ignore_header X-Bogosity
# bayes_ignore_header X-Spam-Flag
# bayes_ignore_header X-Spam-Status
```

Restart SA, and you should be good to go. As I said already this is a dirty fix that really should
get some attention if it hasn't already.
