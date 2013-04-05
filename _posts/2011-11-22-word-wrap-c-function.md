---
layout: post
title: "Word Wrapping in C"
categories:
  - c
---

I recently ran into a situation where I needed to wrap text to a certain number of columns
to support the standard 80x24 Linux console without making a complete mess of the screen.
Since I found no standard way of doing this, I wrote this little function to handle it for me.

There are no dependencies on any external libraries. Pass in your storage, your string, and
the number of columns to wrap to, and this will do the rest.

```c
void wrap( char *out, char *str, int columns )
{
    int len, n, w, wordlen=0, linepos=0, outlen=0;

    for( len=0; str[len]; ++len );

    char word[len];

    for( n=0; n<=len; n++ )
    {
        if( str[n] == ' ' || str[n] == '\n' || n == len )
        {
            if( linepos > columns )
            {
                out[outlen++] = '\n';
                linepos = wordlen;
            }

            for( w=0; w<wordlen; w++ )
            {
                out[outlen++] = word[w];
                word[w] = '\0';
            }

            if( n == len )
                out[outlen] = '\0';

            else if( str[n] == '\n' )
            {
                out[outlen] = str[n];
                linepos=0;
            }

            else
            {
                out[outlen] = ' ';
                linepos++;
            }

            outlen++;
            wordlen=0;
        }

        else
        {
            word[wordlen++] = str[n];
            linepos++;
        }
    }
}
```

## Examples

Wrap at 50 columns:

```
$ ./a.out
Lorem ipsum dolor sit amet, consectetur adipiscing
elit. Maecenas pulvinar blandit diam nec mattis.
Sed a ipsum nec ante porttitor feugiat. Morbi
ipsum lacus, dignissim at bibendum in, consectetur
eget ipsum. Donec dolor nibh, scelerisque ac
sodales et, posuere ac nulla. Aliquam eget
tincidunt ante. Vestibulum justo leo, congue ut
luctus ut, venenatis non dui. Cras sapien risus,
blandit at semper eu, cursus eu est. In hac
habitasse platea dictumst. Fusce libero dolor,
commodo nec rhoncus eu, rutrum vel arcu. Vivamus
ultrices faucibus tellus ac feugiat. Ut imperdiet
metus sed erat feugiat sed porta lorem tristique.
Mauris quis erat vel ante cursus pretium.
Curabitur arcu erat, consequat ac ornare et,
venenatis eu diam.

Curabitur posuere dui vitae tortor cursus cursus.
Pellentesque adipiscing lobortis sem at varius.
Mauris pellentesque sollicitudin ultricies.
Maecenas in tellus turpis. Integer convallis
mollis elit eu placerat. Nunc volutpat consectetur
facilisis. Curabitur eros arcu, dapibus ut
convallis non, rhoncus non magna.
```

Wrap at 20 columns:

```
$ ./a.out
Lorem ipsum dolor
sit amet,
consectetur
adipiscing elit.
Maecenas pulvinar
blandit diam nec
mattis. Sed a ipsum
nec ante porttitor
feugiat. Morbi ipsum
lacus, dignissim at
bibendum in,
consectetur eget
ipsum. Donec dolor
nibh, scelerisque ac
sodales et, posuere
ac nulla. Aliquam
eget tincidunt ante.
Vestibulum justo
leo, congue ut
luctus ut, venenatis
non dui. Cras sapien
risus, blandit at
semper eu, cursus eu
est. In hac
habitasse platea
dictumst. Fusce
libero dolor,
commodo nec rhoncus
eu, rutrum vel arcu.
Vivamus ultrices
faucibus tellus ac
feugiat. Ut
imperdiet metus sed
erat feugiat sed
porta lorem
tristique. Mauris
quis erat vel ante
cursus pretium.
Curabitur arcu erat,
consequat ac ornare
et, venenatis eu
diam.

Curabitur posuere
dui vitae tortor
cursus cursus.
Pellentesque
adipiscing lobortis
sem at varius.
Mauris pellentesque
sollicitudin
ultricies. Maecenas
in tellus turpis.
Integer convallis
mollis elit eu
placerat. Nunc
volutpat consectetur
facilisis. Curabitur
eros arcu, dapibus
ut convallis non,
rhoncus non magna.
```

Update 11/24/2011: This solution is useful if you need to word wrap inside of a C
program. If you are shell scripting, you can use the "fold" command, which comes standard
with the "coreutils" package in EL-based distributions.

```
Usage: fold [OPTION]... [FILE]...
Wrap input lines in each FILE (standard input by default), writing to
standard output.

Mandatory arguments to long options are mandatory for short options too.
  -b, --bytes         count bytes rather than columns
  -c, --characters    count characters rather than columns
  -s, --spaces        break at spaces
  -w, --width=WIDTH   use WIDTH columns instead of 80
      --help     display this help and exit
      --version  output version information and exit

Report bugs to <bug-coreutils@gnu.org>.
```
