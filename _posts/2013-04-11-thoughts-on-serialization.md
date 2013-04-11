---
layout: post
title: Thoughts on simplified serialization formats
categories:
  - web
  - json
  - yaml
---

Lately I have been using two rather simplified serialization formats for a number of
projects I am working on; JSON and YAML. With a fair amount of experience using both,
I can now tell you about where I think each format has its place. You probably don't
care to read a long-winded post of why's and why-not's, so let's just cut straight to
the meat and potatoes.

JSON
----

* Very rigorous standard
* Compact notation does not differ from "pretty printed" syntactically
* Supports string, integer, boolean, list, and map
* Easily identifiable and understandable
* Almost no exceptions to fundamental rules of the language

YAML
----

* 3 distinct versions in active use
* Supports compact inline and "pretty" notations, with differences
* Supports primitive data types as well as some advanced types, like objects
  and pointers
* Very appealing to the human eye

On differences between YAML parsers
-----------------------------------

YAML with its multiple and fundamentally different spec versions is not always
predictable unless the software you are using can certify that it absolutely
implements some version of the spec. There are a multitude of YAML parsers out
there, some that fully implement the spec, others that lack certain features,
and some that are written by people who have never read the spec to begin with.
The general statement you will see on the project page of any YAML parser will
be something to the tune of "Mostly implements spec version X".

On JSON portability
-------------------

I've said this many times in the past, but its worth saying again; JSON is JSON
is JSON. Almost (all?) JSON parsers will be able to read some data that another
parser emitted. I can serialize something in Ruby, load it in PHP using one
parser, dump it using another parser to a library that gets read by Python, which
serves it to an AJAX client which natively understands it, and at ALL steps data
types are preserved and there is no question or interpretation on why or how.

On YAML portability
-------------------

It is harder to describe the state of portability in YAML. Rather than bash on
it, I'll try to explain some things that are not obvious and why that makes it hard
to implement YAML, contrary to the claim on their home page.

The first issue that probably comes to anyone's mind who has dealt with YAML
using multiple parsers is indentation. Since YAML cuts down significantly on
punctuation by counting white space, all parsers need to conform very strictly to
output format for any of the YAML magic to work. Sometimes you will see YAML
indented by four spaces, sometimes by eight (gag), sometimes by just one or two,
and all are valid - as long as you consistently use the same spacing everywhere.
This is actually not a bad thing. I like this about YAML, and Python as well, as
I don't think it is unreasonable to demand consistency, especially in a data
serialization language.

Another difficult thing is that much like the English language, YAML has made some
exceptions to its own rules, which makes it harder to understand from an implementation
perspective. YAML requires that you indent everything to indicate hierarchy and
structure, EXCEPT when you are talking about a mapped list, which supports
[compact inline notation](http://www.yaml.org/spec/1.2/spec.html#style/compact%20block%20collection/).

True YAML parsers should support objects and pointers, but the fact of the matter is,
many of them don't, and are intended to be used purely as a way of relating primitive
data types to one another. If some parser does not implement a more complicated
function of the YAML specification, then said parser cannot truthfully claim that it
is compliant with that specification. This reminds me of an old slogan, "Almost
only counts in horseshoes and hand grenades".

On YAML pointers
----------------

One of the reasons I originally looked at YAML a while back was for this concept
of "symbolic linking" or "pointers". At first glance, the concept of pointing to pieces
of data by reference seems pretty awesome if you are dealing with a large document
that might contain some repetitive or similar information.

But taking another, closer look, what are you really gaining? At which point will
you pass some data through a parser that will emit YAML containing referenced data?
Does the parser decide what data is duplicate and how the pointers will work? Are
you really going to use some advanced parser functions to generate pointers in your
serialized data? Probably not. Furthermore, once deserialized, what does that data
look like? It looks like a flat array, because the code that is reading it likely
does not care that it was a pointer or reference, it only cares what the absolute
value is.

It is hard to "round-trip" YAML pointers. If you serialize something with pointers,
when you deserialize it, and then serialize those results, is your pointer still
there? Or is your document now just a large, standard-looking mapping of your data?

Random Thoughts on obviousness
------------------------------

* When I look at a piece of JSON, it is very clear to me, visually, without inferring
  anything, what data type any member of the object is.

* It's nice to be able to comment a file to explain why a certain value is set to
  something. YAML provides this, but in JSON there is no native way to accomplish it.

* Bare words, in my opinion, cause confusion more than they provide convenience in
  this context. For example, is it obvious that 1 is an integer but 1.0.1 is a string?
  Because it is definitely obvious that 1 is an integer and "1.0.1" is a string.

* It is possible to declare in a YAML document that the data contained within it
  is serialized in some particular version of the specification. However, many parsers
  ignore it, or even throw errors if they encounter YAML with front-matter (!!)

A quick word on performance
---------------------------

While you might read that JSON is faster than YAML, this isn't necessarily true.
Performance metrics for this kind of thing are very subjective in that most parsers out
there are community implemented, meaning one YAML parser is probably faster than one of
the JSON parsers, and vice versa.

A few final thoughts
--------------------

* Anything outside of actual, usable data is valuable only to a human.

* Unless you really need the advanced functionality that only YAML can provide, it would
  probably not be a bad decision to at least support JSON if not use it as your default
  until the current state of YAML parsers and their adoption and standardization improves.

* Do the minimum. If you just want to map some data and pass it along, go back to basics.

* Don't use any serialization language based on visual attractiveness unless you
  anticipate users constantly reading or writing these documents by hand.

* JSON and YAML are both great languages. If you don't like YAML, it probably isn't because
  you don't like the language specification itself, but that you don't enjoy using the
  current breed of YAML parsers out there today.
