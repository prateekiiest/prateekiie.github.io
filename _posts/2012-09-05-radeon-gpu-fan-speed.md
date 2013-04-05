---
layout: post
title: "Managing GPU fan speed on ATI Radeon cards under RHEL/CentOS/Scientific Linux"
categories:
  - bash
  - rhel
  - hardware
  - linux
  - performance
---

A while ago I posted an article on [Running an Apple 27" LED Cinema display on a
standard PC](http://www.ryanuber.com/running-an-apple-27-led-cinema-display-on-a-standard-pc.html)
- which made use of a Radeon HD6870. At the time, I was running Windows 7, which was super-easy to
find a fan control program for (MSI Afterburner). Since then I have gone back to my favorite Linux
desktop (GNOME 2). Traditionally I have used Ubuntu for a Linux desktop, but in the most recent
versions, my confidence in the distribution has been tarnished.

I am currently running [Scientific Linux](http://scientificlinux.org/), using software only from
the official SL repos and EPEL. Everything is stable and super-fast, and I am happy.

My only remaining complaint was the noise from my ATI Radeon card. Using the open source drivers,
things looked great and the acceleration seemed very acceptable (full frame rate running Nexuiz
classic with all settings turned up to max). Well, acceptable for someone who doesn't typically
play games, anyways. However, the GPU constantly ran around 70 degrees Celsius, even while just
sitting at the desktop, no applications opened or anything. This temperature was reported by
lm_sensors, which at the time of this writing can be used to monitor GPU temperature, but
fancontrol cannot control the GPU fan(s).

I ended up trying a few things to solve the GPU "noisy fan" issue.

## Proprietary Drivers
Normally I am an advocate for using the open source drivers. However, the benefits I saw from
switching to ATI's proprietary driver set were too great to ignore. ~30 degrees cooler GPU idle
temperature and vastly improved performance along with fan controllability should point you to
the most practical decision.

Download the ".run" file from ATI and give it execute permission, install "rpmbuild" on your
machine, and do a "sudo ./path-to-run-file" so that you can ask it to generate RHEL6 RPM's for you.

## ATI Catalyst Control Center
This was the first thing I checked out, since it came as part of the proprietary graphics driver
software. It gives you a few options but nothing in the way of temperature monitoring or fan
control. Move on...

## ATIOverdriveCtrl (unsuccessful)
First, I tried using ATIOverdriveCtrl, since it had the same ability to set the fan speed scale
as I did in MSI Afterburner. Since I am running on Scientific Linux, I had to compile myself
(they only cater to Debian/Ubuntu users).

To get the dependencies and build

```
yum -y install wxGTK-devel gcc-c++
```

Then make, and "make install" if you are daring, or just run the binary out of the "Release" directory.

The main problem was that ATIOverdriveCtrl refused to control my fans. It seemed fairly
commonplace while researching the error. Perhaps it is an incompatibility with my card, or maybe
the specific ATI driver version I am using. Nonetheless, I dropped it at this point. It did seem
to have a decent interface though, so maybe it would be worth a shot for you before trashing it.

## Custom script
This is a good example of why, no matter what I try switching to, I always end up back at Linux as
a desktop. What I wanted was not available without what seemed to be quite a bit of hassle and
compiling, which I am really not that into for my desktop purposes. I ended up writing a little
bash script that would poll the temperature once in a while, and if above a certain threshold,
spin it up to a higher level, or down to a lower level depending on what was going on. I also made
sure to add a maximum GPU temperature, above which the fan speed shall be set to 100%.

```bash
#!/bin/bash

### SETTINGS ####################################################
MINTEMP=60   # Temp to start spinning fan up at
MAXTEMP=85   # Temp at which to set fan speed to 100%
MINSPEED=20  # When temp is below MIN_TEMP, run fan at this speed
INTERVAL=10  # Poll temperature at this interval (seconds)
#################################################################

BIN=/usr/bin/aticonfig
PRT=0
CURSPEED=0

while sleep ${INTERVAL}
do
    TEMP="$(${BIN} --od-gettemperature | awk -F ' *[ .] *' '/Sensor 0/ {print $6}')"
    if [ ${TEMP} -ge ${MINTEMP} ]
    then
        if [ ${TEMP} -ge ${MAXTEMP} -a ${CURSPEED} -ne 100 ]
        then
            CURSPEED=100
            ${BIN} --pplib-cmd "set fanspeed 0 ${CURSPEED}"
        elif [ ${TEMP} -ne ${PRT} ]
        then
            CURSPEED=$((${TEMP}-${MINSPEED}))
            ${BIN} --pplib-cmd "set fanspeed 0 ${CURSPEED}"
        fi
    elif [ ${TEMP} -lt ${MINTEMP} -a ${CURSPEED} -ne ${MINSPEED} ]
    then
        CURSPEED=${MINSPEED}
        ${BIN} --pplib-cmd "set fanspeed 0 ${CURSPEED}"
    fi
    PRT=${TEMP}
done
```

My card only has a single GPU and fan, hence my hardcoded fan ID "0" in the script. You
could modify the script to do multiple GPU fans.

This seems to work great so far, even under heavy load the temperature is typically kept
at the very highest around 73 Celsius. The only thing left to do was to make this script
start when my session starts. The aticonfig command requires that an X display environment
variable be set. Since this is a bash loop, maybe this isn't totally necessary since it
would just silently fail and do nothing, but nonetheless, the way I found best to execute
this script was to add it under my gnome-session-properties as a new startup application.
Just append an ampersand (&) so that the script forks during startup and you should be
good to go.
