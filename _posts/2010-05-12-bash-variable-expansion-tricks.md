---
layout: post
title: "Bash variable expansion tricks"
categories:
  - bash
  - linux
---

I've just stumbled upon this little bash gem. In one simple line of a bash script, without invoking
any external commands whatsoever, you can effectively replace and otherwise manipulate text within
variables.

If you use variable protection regularly (ex: "${VAR}" versus "$VAR" ), then this will look pretty
obvious to you right away -- one of those "a-ha!" moments. If you aren't familiar with variable
protection, you should seriously look into it. It will make your bash scripting life easier.

Below I'll show you a quick example of how you can eliminate calling another shell, and the `sed`
command, in your bash scripts:

```bash
#!/bin/bash
TEST="yodawg"
TEST=( ${TEST/yo/werd} )
echo $TEST
```

You can see  how similar the syntax is to using the `sed` command in a similar fashion. One of the
nicer things about using this method, is that it parses the text within the variable. I find this
particularly useful and beneficial to the cleanliness of my code. Traditionally, I would define an
extra variable to hold the content of my sed-replaced variable, or call a subshell, like
`$(echo ${VAR} | sed s/a/b/g)`. Below I'll show you a comparison of the way my coding has changed
since I discovered this.

Before:

```
VAR="this is a test"
NEWVAR=$(echo ${VAR} | sed s/test/string/g)
echo ${NEWVAR}
```

And after:

```
VAR="this is a test"
echo ${VAR/test/string}
```

Both achieve precisely the same effect, but the later piece of code leaves one less variable dirty,
saves a line of code, looks cleaner, is smaller in size, and requires no external commands to run.

Pretty nifty, right?

The above examples only replace the first occurance of the string. If you want to replace globally in
the string, you can use a double-slash instead of a single-slash, like this:

```
VAR="this is a test. this is another test."
echo ${VAR//test/string}
```

Edit: I found another extremely handy bash tip for variables -- Wish I would have found it earlier,
3000 shell scripts later.

```
[ryan@home]$ TEST="this is a test"
[ryan@home]$ echo ${#TEST}
14
```

Using variable protection along with the "#" sign in front of the variable's name will print the number
of characters contained in the string variable, just like "wc", or sizeof().

Edit:
Another useful function is the percent sign "%". You can use it to trim a string from the end of a
variable. Say I am converting a PNG image to a JPG image. I could do something like the following
with the variable name to change the extension:

```
[ryan@home]$ FILENAME="test.png"
[ryan@home]$ echo "${FILENAME%png}jpg"
test.jpg
```

Edit:
Once again I stumbled upon another great bash variable feature. This one acts conditionally, and provides
an easy and built-in mechanism for a "default value". Observe the script below:

```bash
#!/bin/bash
TEST="test"
echo ${TEST-not set}
```

The above will output "test". Now observe the revised script:

```bash
#!/bin/bash
#TEST="test"
echo ${TEST-not set}
```

The above will output "not set" because the "TEST" variable was empty. Nifty, right?

Edit:
The above example prints some string if the variable is *not* set (using the "-" operator). The
following example will print something if the variable *is* set:

```bash
#!/bin/bash
TEST="test"
echo ${TEST+set}
```
