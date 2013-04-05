---
layout: post
title: "JSON - PrettyPrint in PHP, pre-5.4"
categories:
  - rhel
  - php
---

In an enterprise product that I work on, we use the stock RHEL versions of all major
software packages. Makes sense, right? Enterprise-quality software for an enterprise-quality
product. However, this sometimes makes things a bit inconvenient, especially in certain
components such as PHP, where updates and enhancements are released frequently. It doesn't
always make sense to begin maintaining these packages on your own just to get the few new
features that they add, and for us it was simply not an option.

The following is just one example of how some of these features can be implemented in a
temporary fashion. Some concepts were borrowed from an article located
[here](http://recursive-design.com/blog/2008/03/11/format-json-with-php).

PHP implementations with versions less than 5.4.x will lack the ability to pretty-print JSON
out of the box. This doesn't necessarily create any functional disadvantages, but say you
were implementing some kind of API in PHP. End-users will likely try querying it with tools
such as cURL, and it would be nice if they didn't need to throw the data through some external
pretty-print program to make it legible. After all, one of the many advantages of JSON
serialization is its implicit human-readability.

```php
<?php
/**
 * jsonpp - Pretty print JSON data
 *
 * In versions of PHP < 5.4.x, the json_encode() function does not yet provide a
 * pretty-print option. In lieu of forgoing the feature, an additional call can
 * be made to this function, passing in JSON text, and (optionally) a string to
 * be used for indentation.
 *
 * @param string $json  The JSON data, pre-encoded
 * @param string $istr  The indentation string
 *
 * @return string
 */
function jsonpp($json, $istr='  ')
{
    $q = FALSE;
    $result = '';
    for($p=$i=0; isset($json[$p]); $p++)
    {
        if($json[$p] == '"' && ($p>0?$json[$p-1]:'') != '\\')
        {
            $q=!$q;
        }
        else if(in_array($json[$p], array('}', ']')) && !$q)
        {
            $result .= "\n".str_repeat($istr, --$i);
        }
        $result .= $json[$p];
        if(in_array($json[$p], array(',', '{', '[')) && !$q)
        {
            $i += in_array($json[$p], array('{', '['));
            $result .= "\n".str_repeat($istr, $i);
        }
    }
    return $result;
}
```

## Update 09/14/2012
I ran into a minor nuance when handling JSON data that contained empty lists. The
previous implementation (above) would display and empty list like this:

```
"somelist":[

]
```

I figured that if the list is empty, I should express it short-hand with a quick open-close
to save document space and make it more human readable, like so:

````
"somelist":[]
```

The following updated implementation handles this, uses strchr() rather than in_array() to
speed things up a little while still remaining compact, and is 4 lines less code.

```php
<?php
/**
 * jsonpp - Pretty print JSON data
 *
 * In versions of PHP < 5.4.x, the json_encode() function does not yet provide a
 * pretty-print option. In lieu of forgoing the feature, an additional call can
 * be made to this function, passing in JSON text, and (optionally) a string to
 * be used for indentation.
 *
 * @param string $json  The JSON data, pre-encoded
 * @param string $istr  The indentation string
 *
 * @return string
 */
function jsonpp($json, $istr='  ')
{
    $result = '';
    for($p=$q=$i=0; isset($json[$p]); $p++)
    {
        $json[$p] == '"' && ($p>0?$json[$p-1]:'') != '\\' && $q=!$q;
        if(strchr('}]', $json[$p]) && !$q && $i--)
        {
            strchr('{[', $json[$p-1]) || $result .= "\n".str_repeat($istr, $i);
        }
        $result .= $json[$p];
        if(strchr(',{[', $json[$p]) && !$q)
        {
            $i += strchr('{[', $json[$p])===FALSE?0:1;
            strchr('}]', $json[$p+1]) || $result .= "\n".str_repeat($istr, $i);
        }
    }
    return $result;
}
```

Doing some quick comparisons, this update might make a significant difference in large
and/or complex datasets that contain empty lists.

```
$ wc -l before.json after.json
  620 before.json
  522 after.json
$ du -b before.json after.json 
18946   before.json
18262   after.json
```

~100 lines and ~700b savings.
