---
layout: post
title: "Open Source: The Contributor's Angle"
categories:
  - open source
  - organization
  - collaboration
tags:
  - contributing
  - etiquette
---

Open source is undoubtedly changing the software world we live in today. People
building applications, frameworks, modules, and all kinds of of other software
things are able to feed off of one another's design and style ideas. There are a
slew of online code collaboration websites that make writing programs with
others easier than it has ever been before.

The advantages that open source software brings to life also bring new
challenges in etiquette and adaptation. When contributing to an external
open-source project, it is important to keep an open mind and consider the use
case.

## Style consistency

When contributing to an open source project, it is important to put your own
personal preferences and style practices aside. If the program you are
contributing to uses tabs for indentation, use tabs. If the comments are all
written in C-style, double-slashed, or block quotes, write yours the same way.
If the code follows some particular style guideline, adhere to it. If you don't,
you are forcing the maintainter(s) to choose between accepting inconsistency in
their project, asking you to change your code, ignoring you, or flat out
rejecting your contribution. Keep in mind that it is easiest to ignore, so shape
your code properly before asking for a merge to maximize your chances of being
accepted.

## Use what they are using

There are so many ways to solve the same problem in software, which makes it
very easy to import multiple libraries that accomplish the same task, perhaps
without knowing you are doing so. Take the time to familiarize yourself with the
project. What functions or modules does it use for mathematics? String
comparison and manipulation? Date and time formatting? Using multiple libraries
to accomplish the same task based on developer preference is an anti-pattern
that we should all try to avoid.

## Suggest changes, don't ask for them

As a software developer, you will have your own opinions on what would work
better, or how a project could be more effecient, and that's a good thing. If
you feel that one of your ideas is beneficial to the project in reasonable
balance with any negative impact to productivity or uncertainty, suggest it to
the maintainer(s) using the appropriate channels, be it a forum, feature
request, bug report, or email. Pull requests, patches, and any other form of
code submission is inappropriate, even if well-intended. Some form of evaluation
or validation by the maintainer(s) on the project should precede the change.
Pitch before you push.

Think about what it would take for you to merge someone's changes into your
favorite original project and apply it to the way you go about making outbound
contributions. After all, the objective of open source software is to solve a
problem, not to have one hundred slightly varied versions of the same software
because nobody could agree on anything and forked their own.
