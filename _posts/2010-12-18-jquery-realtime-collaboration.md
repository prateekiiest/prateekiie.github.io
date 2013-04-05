---
layout: post
title: "jQuery delivers real-time collaboration to business with ease"
categories:
  - jquery
  - php
  - web
---

I have known what jQuery is and what it does for some time now, but never picked it up myself
to try it out. Recently, I was working on a miniature web interface to assist myself and my
colleagues in collaborating on a large-scale overhaul to many of our systems. A few thoughts
and potential caveats immediately come to mind when working on sensitive systems among a group
of engineers:

* How are we going to keep track of our progress? For years, this has traditionally been done
  with an Excel sheet. However, this is not a good option because of sharing issues,
  particularly with file locking and corruption.
* How can every engineer see what is going on at all times? It can turn into a sad, sad day 
  very quickly if two people log into the same system and start applying the same patches at
  the same time. The only way to do this using the old Excel sheets would be to do it through
  policy rather than through technology itself. For instance, you enforce a policy where
  every engineer _must_ open a fresh copy of the Excel document and check out "who's working
  on what" before going to town on the server. He would then need to mark it as "in progress"
  or similar, save and exit so that the next person could open the Excel sheet from the
  share, and then go on his merry way. This is a huge waste of time, and far more clerical
  work than is necessary.

These concerns are solved quite easily with a little developer time, PHP, and jQuery. Using
these technologies, you can slap an extremely useful web page together with minimal effort
and amazing results in a justifiable amount of time.

Consider how much easier things would be if everyone had a dynamic, real-time view of
everything going on in your project right in their browser. If employee "X" updates
something, his update appears on employee "Y"'s screen in seconds without him ever refreshing
the page. He then knows what employee "X" is doing and can avoid stepping all over his
toes and potentially breaking things.

Perhaps the most impressive thing to me about jQuery is how small and simple it actually
is, but at the same time, what tremendous things it can achieve. Opening up the source to
jQuery in your favorite editor will show you that it is actually just a bunch of plain
old javascript. Easy to read? Maybe not, but very minimalistic at its core.

jQuery's syntax is very intuitive as well. Let's take a quick look at a simple little
jQuery function:

```javascript
function setUser ( server, user )
{
    $.ajax({
        url: 'update.php?type=user&srv='+server+'&user='+user,
        success: function(){
            document.getElementById('user'+server).innerHTML=user;
        },
        error: function(){alert('Failed to update user log');}
    }); 
}
```

In just those few lines of javascript code, I have made an AJAX call to the "update.php"
script (which updated my database in the background) using GET, checked whether or not the
operation succeeded, updated the page in real time if it did, and threw an error if it did
not. Now anywhere in my application's HTML, I can throw in something like:

```
<script type="text/javascript">setUser('serverIdHere','userNameHere');</script>
```

or like this:

```
<a href="javascript:void(0);" onclick="setUser('serverIdHere','userNameHere');">Click it!</a>
```

to update the last user who performed a certain action on the page. The "onclick" function
in the hyperlink is more useful in this scenario, as it helps me instantly call the
function each time I click it.

So there, in its simplest form, is an AJAX update to my back end database. Now the trickier
part comes in: Although the information is already updated on my browser, how does that
update get to everyone else's browser?

I did this by means of an additional jQuery function. Depending on how your application is
laid out, there are different ways of going about doing this. The easiest way, which is
only effective for a very small number of dynamic fields, would be to use the
"setInterval()" javascript function, making an AJAX call to another backend PHP script,
maybe called "fetch.php" that would provide the data to your javascript, and then update
the page in realtime using "document.getElementById(element).innerHTML", or ".value", or
any number of other settable attributes in HTML.

The method mentioned above was my first approach at keeping my data up to date and
real-time for all users. However, I ran into a problem with this. For each system we
needed to update, I was running an AJAX call in the background every 20 seconds to get
updated information. In my application, there were about 200 systems that were on any
given page, so you can imagine that making 200 calls every 20 seconds to the web
server in the background gets a little nutty. At times, the forms would stop allowing
input until the javascript was finished executing, but sometimes that would not happen
quickly enough for me to make my submission before the next event was queued, causing
serious delays to the page updates.

While the page was technically working, the user experience was awful. I decided to
try something a little more involved, and got outstanding results. Rather than querying
individual items from my "fetch.php" script, I wanted to fetch everything in one run.
To do that, I needed a way to get data from MySQL into an array that both PHP and
jQuery could understand. XML seemed like the perfect fit.

Here is my PHP script to gather data and output XML:
```php
<?php
header('Content-type: application/xml; charset=utf-8');
print "<?xml version=\"1.0\" encoding=\"utf-8\" ?>\n<DATA>\n";
require_once ( 'classes/DB.class.php' );
$DB = new DB; 
$result = $DB->Query("SELECT * FROM servers;");
while ( $row = mysql_fetch_assoc ( $result ) ) 
{
    print <<<EOF
  <SERVER>
   <ID>{$row['serverId']}</ID>
   <STATUS>{$row['serverStatus']}</STATUS>
   <USER>{$row['user']}</USER>
   <NOTES>{$row['notes']}</NOTES>
  </SERVER>

EOF;
}
print "</DATA>";
?>
```

This would spit out everything I had in my database in XML format. Fortunately, jQuery
had a very easy way of handling XML without needing any plugins or parsing anything
manually. Here is what I ended up with to update the page in real time:

```javascript
function refresh ( ) 
{
    $.ajax({
        url: 'fetch.php',
        dataType: 'xml',
        success: function(xml){
            $(xml).find('SERVER').each(function(){
                if ( document.getElementById($(this).find('ID').text()) )
                {
                    if ( $(this).find('STATUS').text() == 0 ) { var class = 'pending'; }
                    if ( $(this).find('STATUS').text() == 1 ) { var class = 'progress'; }
                    if ( $(this).find('STATUS').text() == 2 ) { var class = 'complete'; }
                    if ( $(this).find('STATUS').text() == 3 ) { var class = 'review'; }
                    document.getElementById($(this).find('ID').text()).setAttribute('class',class);
                    document.getElementById('user'+$(this).find('ID').text()).innerHTML=''+
                        $(this).find('USER').text();
                    document.getElementById('notes'+$(this).find('ID').text()).innerHTML=''+
                        $(this).find('NOTES').text();
                    document.getElementById('select'+$(this).find('ID').text()).selectedIndex=''+
                        $(this).find('STATUS').text();
                }
            });
        }
    }); 
}
```

The above code does a few things:

* Changes the background color of the affected row
* Updates the "User" column with the last username that updated the item
* Updates the select box that contains the status of the item (changes the item that is actually selected)
* Updates the "notes" column with fresh data

With all of these fields dynamic, what you end up with is essentially a web page that you and
many others can all work on at the same time as if you were sharing a computer screen, but
had your own mice and keyboards.

Since the above function cut down so much on the intensity of the web page (1 HTTP GET rather
than 200), I was also able to set the update time to a lower value. At the end of my HTML
document, I placed a line like this:

```
<script type="text/javascript">setInterval("refresh()", 10000 );</script>
```

This will call my refresh() javascript function every 10 seconds and update the page with
new data.

I have left a lot out of this article for brevity's sake. However, with a basic
understanding of how Javascript works as well as PHP, you will likely be able to create such
useful applications with little time investment.
