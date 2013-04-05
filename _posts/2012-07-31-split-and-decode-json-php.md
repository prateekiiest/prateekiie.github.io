---
layout: post
title: "Splitting and Decoding multiple JSON objects in PHP"
categories:
  - php
---

If you are reading this text, then chances are you are some form of developer. Being a
developer, you have likely been happily parsing JSON documents for some time now and
making all kinds of magical things happen with it.

Perhaps at some point, you were writing a PHP application, and came across some
multi-object JSON that you needed to parse, like this:

```
{"server-1.example.com": true}
{"server-2.example.com": true}
{"server-3.example.com": true}
{"server-4.example.com": true}
```

Or maybe this:

```
{"event":"suiteStart","suite":"","tests":13}{"event":"suiteStart","suite":"MyClass_test","tests":5 {"event":"testStart","suite":"MyClass_test","test":"MyClass_test::test_one"}
```

Sometimes, multiple JSON objects as an output is intended to provide a performance benefit,
generating parse-able chunks as execution happens in the background. In this case, you would
need to come up with something more creative and involved than the solution I am offering
here. If you just want to parse out some values from some JSON that happens to be presented
to you by your tools of choice in multiple objects, then the following function might help you.

This function will take one long string of JSON which expresses multiple objects, and separate
out the objects in their original JSON form to an array list. To preserve functionality,
this function does not actually json_decode() for you, but rather sets you up to do so. This
will let you loop over the returned array and json_decode() / array_merge(), or whatever else
you want to do to your heart's content.

```php
<?php
/**
 * json_split_objects - Return an array of many JSON objects
 *
 * In some applications (such as PHPUnit, or salt), JSON output is presented as multiple
 * objects, which you cannot simply pass in to json_decode(). This function will split
 * the JSON objects apart and return them as an array of strings, one object per indice.
 *
 * @param string $json  The JSON data to parse
 *
 * @return array
 */
function json_split_objects($json)
{
    $q = FALSE;
    $len = strlen($json);
    for($l=$c=$i=0;$i<$len;$i++)
    {   
        $json[$i] == '"' && ($i>0?$json[$i-1]:'') != '\\' && $q = !$q;
        if(!$q && in_array($json[$i], array(" ", "\r", "\n", "\t"))){continue;}
        in_array($json[$i], array('{', '[')) && !$q && $l++;
        in_array($json[$i], array('}', ']')) && !$q && $l--;
        (isset($objects[$c]) && $objects[$c] .= $json[$i]) || $objects[$c] = $json[$i];
        $c += ($l == 0);
    }   
    return $objects;
}
```

You can give it a shot with some multi-object JSON strings, like below for instance:

```php
print_r(json_split_objects('["one","two","three",{"test":"one"}]["four","five","six"]'));
print_r(json_split_objects('{"testone":["one","two","three"],"testtwo":{"one":1,"two":2,"three":3}}["one","two"]["three","four"]'));
```

The above code should yield some output like the following:

```
Array
(
    [0] => ["one","two","three",{"test":"one"}]
    [1] => ["four","five","six"]
)
Array
(
    [0] => {"testone":["one","two","three"],"testtwo":{"one":1,"two":2,"three":3}}
    [1] => ["one","two"]
    [2] => ["three","four"]
)
```
