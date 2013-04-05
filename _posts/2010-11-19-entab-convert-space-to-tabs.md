---
layout: post
title: "entab - A utility to convert from white-space to tabbed output"
categories:
  - c
---

The following program was another exercise from "The C Programming Language" by Brian
Kerrigan and Dennis Ritchie. This exercise was presented at the end of the first chapter, and
no starting point is provided. Utilizing what I had learned from reading and previous
exercises, I was able to get through the whole program, and it seems to work perfectly so far.

Here is the description of the exercise, directly from the book:

```
Write a program entab that replaces strings of blanks by the minimum number of tabs and
blanks to achieve the same spacing. Use the same tab stops as for detab*. When either
a tab or a single blank would suffice to reach a tab stop, which should be given
preference?
```

Some additional thoughts / potential TODO's before you read the program:
* Should the tab-stop length (in spaces) be hard-set? Perhaps this would better be written
  as a command-line option for usability on programs and files where the programmer has
  set their editor to use, say, 4 spaces in place of a '\t'.
* Possibly add white space trimming to the end of the line, as in my previous getline.c
  program. This should likely happen before converting to tabbed output.
* Should the end-of-line white space trimming be in a function of its own? Perhaps there
  is already such a function available in string.h.

```c
/*
 *  entab.c - Convert white space into tabbed output, being mindful that
 *            a tab stop is not simply a fixed number of consecutive
 *            white space.
 *
 *  Author: Ryan R. Uber <ryan@blankbmx.com>
 *  Date:   Fri Nov 19 04:39:29 CST 2010
 *
 */

#include <stdio.h>

#define MAXLINE 1000    /*  Maximum input per line */
#define TAB     8       /*  Tab stop interval */
#define TRUE    1       /*  Just symbolic names for readability. */
#define FALSE   0       /*  These could have just as effectively been
                            written as a 1 or 0 in the program */

void copy (char from, char to[]);
int getline (char line[], int lim);

/*  Replace white space with proper tabbing */
int main (void)
{
    int len, i, j, nspaces, stop;
    char line[MAXLINE], output[MAXLINE];

    nspaces = 0;

    while ((len = getline(line, MAXLINE)) > 0)
    {
        for (i = 0; i < len; ++i)
        {
            /*  This defines whether we are at a tab stop position. The
             *  division operation returns a zero if the quotient is an
             *  even number. As an example, try:
             *      ( 8 % 8 )
             *  in a separate C program. This would be the exact operation
             *  run if TAB is set to '8' and you are on the 8th character
             *  of input.
             */
            if ( i != 0 && i % TAB == 0 )
            {
                stop = TRUE;
            }

            else
            {
                stop = FALSE;
            }

            /*  We will not be adding any detected white space to our array
             *  if we are not currently at a tab stop. However, we need to
             *  keep track of the detected white space until to later determine
             *  if we need to replace it with the '\t' character.
             */
            if (line[i] == ' ' && stop == FALSE)
            {
                ++nspaces;
            }

            /*  The following tests that white space was detected all the way
             *  from the last non-white space up to the next tab stop. If this
             *  condition is true, we replace the white space with a tab stop.
             */
            else if (nspaces > 0 && stop == TRUE)
            {
                /*  Copy the '\t' character to the output array, and set our
                 *  space counter back to 0 in preparation for the next test.
                 */
                copy ('\t', output);
                nspaces = 0;

                /*  The current position we are at (i) has not yet had its
                 *  corresponding character added to the output array. We only
                 *  want to copy this character if it is not white space.
                 */
                if ( line[i] != ' ' )
                {
                    copy (line[i], output);
                }

                /*  As before, keep track of the white space if detected for
                 *  accurate white space replacement in the next tab stop.
                 */
                else
                {
                    ++nspaces;
                }
            }

            /*  If we have detected 1 or more white spaces that do not lead us
             *  all the way up until a tab stop, we need to add the actual white
             *  space to our output array so they are not lost.
             */
            else
            {
                /*  Add white space for each ' ' character counted */
                for (j = 0; j < nspaces; ++j)
                {
                    copy (' ', output);
                }

                /*  Set space count to 0 to count any remaining space before we
                 *  encounter the next tab stop. Copy non-white space characters.
                 */
                nspaces = 0;
                copy (line[i], output);
            }
        }
    }

    /*  Display the newly-formatted string and return */
    printf("%s", output);
    return 0;
}

/*  Append provided output to a designated character array */
void copy (char from, char to[])
{
    /*  Set character position to 0 */
    int pos;
    pos = 0;

    /*  Determine where we will append characters in the pre-existing array */
    while ( to[pos] != '\0' )
    {
        ++pos;
    }

    /*  Copy provided character to the last position in the array */
    to[pos] = from;
    to[pos+1] = '\0';
}

/*  Read input from stdin */
int getline (char s[], int lim)
{
    int c, i;

    /*  Read in characters until a newline '\n' is encountered */
    for (i = 0; i < lim-1 && (c=getchar()) != EOF && c != '\n'; ++i)
        s[i] = c;

    /*  If a newline was encountered, add to the array and increment counter */
    if (c == '\n')
    {
        s[i] = c;
        i++;
    }

    /*  Terminate input line, return number of characters found in the line */
    s[i] = '\0';
    return i;
}

/* EOF */
```
