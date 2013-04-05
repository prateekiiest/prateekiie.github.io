---
layout: post
title: "A less-than-useful program to print crazy-colored text"
categories:
  - c
---

Just a simple C programming exercise. If you are one of those new-age people who like all
of the pretty colors in Gentoo, maybe you will enjoy this. This has absolutely no practical
use, and there are likely better ways of writing it. Just starting to learn C, this is my
first program. In celebration of tonight being all hallow's eve, I've added a color
specification for some festive output.

```c
/*
 *  crzy.c - Print text in crazy colors from stdin
 *
 *  Author: Ryan R. Uber <ryan@blankbmx.com>
 *  Date:   31 Oct 2010 04:28:47PM CDT
 *
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/*  Print a string in crazy colors. */
int main( int argc, char *argv[] )
{
    int c, offset, palette;
    offset = 0;

    char *colors[5][2] = {
            { "0;34", "0;36" },  /* Water, Default */
            { "0;31", "0;32" },  /* Christmas palette */
            { "0;31", "1;30" },  /* Halloween palette */
            { "0;32", "1;32" },  /* Forest palette */
            { "0;35", "1;35" }   /* Girly palette */
    };

    if ( argc == 1 || strcmp(argv[1], "water") == 0 )
        palette = 0;
    else if ( strcmp(argv[1], "christmas") == 0 )
        palette = 1;
    else if ( strcmp(argv[1], "halloween") == 0 )
        palette = 2;
    else if ( strcmp(argv[1], "forest") == 0 )
        palette = 3;
    else if ( strcmp(argv[1], "girly") == 0 )
        palette = 4;
    else
        help();

    /* Main loop -- Colorize each character of text */
    while ((c = getchar()) != EOF)
    {
        /* Alternate color escapes */
        ++offset;
        if (offset == sizeof(colors[palette])/4)
            offset = 0;

        /* Print character */
        printf("\e[%sm%c\e[0m", colors[palette][offset], c);
    }
}

int help ( void )
{
    char s;
    printf("\ncrzy - A less-than-helpful text colorizer\n\nUsage:\n");
    printf("%cecho \"Some Text Here\" | crzy [palette]\n\nPalettes:\n");
    printf("    water [default]\n    christmas\n    halloween\n");
    printf("    forest\n\n");
    exit(1);
}

/* EOF */
```

Here is some sample output. You know you love it:

![""](/assets/attachments/2010-10-31-crzy.png "")
