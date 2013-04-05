---
layout: post
title: "Screenshot sharing made easy with ImageMagick"
categories:
  - linux
  - bash
  - hacks
  - web
---

As a person who does a lot of collaborative development, I constantly find the need to display
a screenshot of exactly what I am seeing to another developer. I came up with this stupid little
script that will do just that.

On invocation, it presents you with a "select area" cursor on your mouse pointer so that you can
drag out the area you want to screenshot. It does this using the "import" utility from ImageMagick.
Naturally, this means that ImageMagick is required for this script to work.

Here is the script, explanation shall follow:

```bash
#!/bin/bash
# SCREENSHOT UTILITY
MY_IPADDRESS=$(/sbin/ifconfig eth0 | grep 'inet addr' | awk '{print $2}' | awk -F: '{print $2}')
SCREENSHOT_COUNT=$(ls ~/www | wc -l)
let SCREENSHOT_NUM=${SCREENSHOT_COUNT}+1
FILE="~/www/screenshot_${SCREENSHOT_NUM}"
import ${FILE}.gif
mogrify -quality 100 -border 2x2 -bordercolor '#FFFFFF' ${FILE}.gif
mogrify -quality 100 -border 1x1 -bordercolor '#000000' ${FILE}.gif
mogrify -quality 100 -border 5x15 -bordercolor '#CCCCCC' ${FILE}.gif
convert -quality 100 -border 1x1 -bordercolor '#000000' ${FILE}.gif ${FILE}.jpg
mogrify -quality 100 -pointsize 9 -fill '#555555' -font helvetica -gravity SouthEast -annotate +20+3 "$(whoami)@$(hostname), $(date +%x\ %X)" ${FILE}.jpg
rm -f ${FILE}.gif
xmessage "http://${MY_IPADDRESS}/screenshot_${SCREENSHOT_NUM}.jpg" &
echo "http://${MY_IPADDRESS}/screenshot_${SCREENSHOT_NUM}.jpg" | xsel -i
```

Now let's pick it to pieces:

```
MY_IPADDRESS=$(/sbin/ifconfig eth0 | grep 'inet addr' | awk '{print $2}' | awk -F: '{print $2}')
```

This piece of code grabs the IP address of your machine. Particularly, the primary IP address on
the eth0 interface. This line may need to be modified a bit. If you have a static IP address, it
would not be a bad idea to simply do something like "MYIPADDRESS=x.x.x.x".

```
SCREENSHOT_COUNT=$(ls ~/www/screenshots | wc -l)
```

This line finds the number of files located in our target screenshot directory. In my case, this
is a directory served by thttpd (so I can send a link directly to each screenshot to anyone
on my network).

```
let SCREENSHOT_NUM=${SCREENSHOT_COUNT}+1
```

This line simply defines a new variable, SCREENSHOT_NUM, with the sum of the number we calculated
one line up, plus one. This will be used in the file name.

```
FILE="~/www/screenshots/screenshot_${SCREENSHOT_NUM}"
```

This defines the destination file using its absolute path. The "~" allows easy access to my home
directory.

```
import ${FILE}.gif
```

This line calls an ImageMagick utility. It only provides it with one option (the file name),
because the rest of the data will be selected directly from my screen. At this point, you will
notice the mouse pointer change into a crosshair, and allow you to drag a selection for your
screenshot.

```
mogrify -quality 100 -border 2x2 -bordercolor '#FFFFFF' ${FILE}.gif
mogrify -quality 100 -border 1x1 -bordercolor '#000000' ${FILE}.gif
mogrify -quality 100 -border 5x15 -bordercolor '#CCCCCC' ${FILE}.gif
```

These 3 lines add the border to the image. Firstly, it adds a 2x2 white space around the image.
Then outside of that, it adds a 1x1 black border. Then around that, it adds a 5x15 border
(WxH, we need the additional height for the labelling later).

```
convert -quality 100 -border 1x1 -bordercolor '#000000' ${FILE}.gif ${FILE}.jpg
```

This line converts our current .gif image into a .jpg image with a 1x1 black border. We need to
do this because the "mogrify" utility will refuse to write text data onto anything other than a
.jpg at the time of this writing.

```
mogrify -quality 100 -pointsize 9 -fill '#555555' -font helvetica -gravity SouthEast -annotate +20+3 "$(whoami)@$(hostname), $(date +%x\ %X)" ${FILE}.jpg
```

This line will add, at the "SouthEast" corner of the image, 3 pixels from the bottom, 20 pixels
from the right, my username, my hostname, and the current date. This will help me to know when
the screenshots were taken, and on what machine they were taken.

```
rm -f ${FILE}.gif
```

We no longer need the .gif file, as we converted it into a .jpg already.

```
xmessage "http://${MY_IPADDRESS}/screenshot_${SCREENSHOT_NUM}.jpg" &
echo "http://${MY_IPADDRESS}/screenshot_${SCREENSHOT_NUM}.jpg" | xsel -i
```

These two lines are a little tricksy. It will pop up my URL to the image in a small window, and at
the same time, copy the contents of the URL to the clipboard. The reason I still pop the image up is
so that if I end up copying something else before pasting my URL, I can still copy it out of the
popup window. I run Ubuntu on my desktop, and actually had to install the "xsel" utility (it comes
installed by default on most other distributions I have used with X windows).

I can now follow the link, which serves up my image, presenting me with a screenshot of the exact area
I selected, timestamped alongside my username and hostname. Excellent!
