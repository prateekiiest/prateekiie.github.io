---
layout: post
title: Measuring the Quality of Code
categories:
  - continuous integration
  - code
  - testing
  - documentation
  - collaboration
  - tools
  - automation
  - ruby
tags:
  - code
  - quality
  - statistics
  - exposure
  - testing
  - continuous integration
  - coveralls
  - travis ci
  - code climate
---

**What do you think about when you hear the phrase "code quality" ?** For me it
used to be more about reliability of the operation of code, which is in part
accurate, but leaves much to be assumed. When considering a new project for
non-experimental use, you would probably want the answers to these 3 questions:

### Does it work reliably?

Setting up a development environment and getting an application to work as
expected once is normally pretty easy (as it should be). Determining if a
program will exhibit the same expected behavior in N number of other
circumstances is a bit harder. A consumer of any application will want to know
two things:

* Does it work for most normal use cases?
* Does it work for my edge cases?

Writing unit tests is a good way to take care of "most normal use cases" in an
automated and repeatable way that will be visible to any interested consumer
without any footwork on their own. By including typical sunny-day (positive)
test cases as well as negative test cases for as much of the code as possible,
it becomes easier for consumers to determine if the application in question
meets the requirements.

### Is it well tested?

Tests passing is a very good sign, but without taking a look at the code doing
the testing, it doesn't really tell you much other than "something executed, and
it worked out". The next step to unit testing is code coverage, which is also
gaining popularity in many projects. Some unit testing frameworks have code
coverage built right into them, and most others have a module that implements
it. Essentially what this gives you is a general idea of how much of the code is
exercised during testing.

There are two useful ways to look at code coverage. The first and most obvious
is a generated percentage. This can tell you at a glance how much code is
executed during your tests. The second useful way of looking at code coverage is
in generated reports, which could be in XML form, JSON, or if your test suite
supports it, HTML. I find the HTML report to be the easiest to digest,
especially if it contains clickable links to any given class or include, and a
way of visualizing line-by-line whether the code was executed or not.

Code coverage in the high-90's or even 100% does not come easy. I found that
code that performs a `fork()` or similar is not easy to cover, since the process
that is running the test code is now in a different thread and will likely not
communicate coverage back to the main process. This means that the code
coverage rating as indicated by your test suite is not always 100% accurate.

In multi-threaded applications, the results from worker processes are easily
testable if they are returned to `main()` (or equivalent), or even testing side
effects is generally somewhat easy to do. Some unit test frameworks allow you to
claim coverage with annotations, even if the test framework would otherwise
indicate a block of code as not covered. The reason that this exists is clear,
but I would argue that it is better to let the coverage be less than 100% to
expose the amount of code that is not truly considered in the line-for-line
metrics.

### Is it maintainable?

Code complexity is completely ignored by unit tests. It does not matter how
complex or unreadable the code is. If it works, the tests pass.

Tests passing is a very machine-centric way of determining code quality. The
fact of the matter is that humans are writing the code being tested, so how is
it possible to determine human readability and comprehension? If there is a
300-line method that forks two separate times and depends on the side effects of
other bits of code in the application, how long would it take for a new
developer to fully understand what that method accomplishes and what its
dependencies are versus having five or six separate methods that perform
smaller tasks to accomplish the same thing?

[Code Climate](https://codeclimate.com) is an awesome approach at surfacing
coding practice for open source applications. Code Climate will measure things
like number of lines in any given method, how many conditions are in each
method, number of nested loops, assignments, and a number of other things to
determine the overall complexity of any given code block. Code Climate also
detects code repetition, which makes determining when something needs to be
broken out into a function very easy. Code Climate also breaks all of this down
into an easy-to-understand "GPA" of sorts (0.0 through 4.0) to indicate at a
glance what the overall complexity of the application looks like.

Having readable and comprehensible code is critical to the maintainability of
the application, and deterministic to patches submitted versus bugs opened in
hopes that the maintainer will fix it.

Exposing code quality metrics
-----------------------------

There are probably a number of ways to expose the quality metrics of a given
application. Some online application quality and testing tools even expose a
small GIF image that can be used on a project's main web page to indicate the
current metrics, which is great if you have an open source project with a
publicly-accessible home page or project namespace. Some examples include:

[Travis CI](https://www.travis-ci.org)

[Coveralls](https://coveralls.io)

[Code Climate](https://codeclimate.com)

Exposing code quality metrics is like maintaining a front lawn - having a thick,
lush green carpet across the yard shows passersby that it is cared for and
enjoyed by its maintainer. In the same way, having unit tests that pass along
with a high rating in both code coverage and code climate says something about
the quality of a project that a good README file just can't.

### Example Application

I recently released a small open source application called
[Oaf](https://github.com/ryanuber/oaf), which demonstrates all of the code
quality tools mentioned in this post. Below are example "badges", which are a
more-or-less live representation of build status, code coverage, and code
climate:

[![Build Status](https://travis-ci.org/ryanuber/oaf.png)](https://travis-ci.org/ryanuber/oaf)
[![Coverage Status](https://coveralls.io/repos/ryanuber/oaf/badge.png)](https://coveralls.io/r/ryanuber/oaf)
[![Code Climate](https://codeclimate.com/github/ryanuber/oaf.png)](https://codeclimate.com/github/ryanuber/oaf)

You can also click on the above badges to view test output and coverage /
climate trending.

### A few bottom lines

* Using metrics like build status, code coverage, and code climate can give you
  an **idea** of the state of code in an application.
* Perfect ratings don't always mean better code.
