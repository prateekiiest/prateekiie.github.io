---
layout: post
title: "An epic RAID 10 failure - or was it a triumph?"
categories:
  - hardware
  - linux
---

One day a RAID issue came to my attention by means of a Nagios alert. I logged into the system
to check out the 3ware array status, figuring a disk was likely going bad, needed to be replaced
and the array rebuilt. However, to my horror and dismay, this is what I saw in tw_cli:

```
//server> show

Ctl   Model        (V)Ports  Drives   Units   NotOpt  RRate   VRate  BBU
------------------------------------------------------------------------
c0    9650SE-4LPML 4         4        1       1       1       1      -        

//server> focus c0

//server/c0> show

Unit  UnitType  Status         %RCmpl  %V/I/M  Stripe  Size(GB)  Cache  AVrfy
------------------------------------------------------------------------------
u0    RAID-10   DEGRADED       -       -       64K     279.377   Ri     ON     

Port   Status           Unit   Size        Blocks        Serial
---------------------------------------------------------------
p0     DEVICE-ERROR     u0     139.73 GB   293046768     WD-WX20C7938667     
p1     DEVICE-ERROR     u0     139.73 GB   293046768     WD-WX20C6901772     
p2     DEVICE-ERROR     u0     139.73 GB   293046768     WD-WX20C7935022     
p3     OK               u0     139.73 GB   293046768     WD-WXD0C7952295     

//server/c0>
```

A RAID 10 with 3 dying hard drives, and somehow, it was still online? This countered all of the logic
I had come to know about RAID 10. How do you lose 3 disks and still be up and running? Two I can
see happening if by coincidence two of the mirrored drives died, but this just doesn't make any sense
now, does it?

Notice the serial on each drive. All of them beginning with "WD-WX20C" died at the same time, while
the one disk with "WD-WXD0C" is running just fine. Bad batch of drives? Possible, although the serials
differ quite vastly among the "WX20C" drives.

This particular server was a miracle, no data was lost and we were able to get the array healthy again
by taking the server offline, replacing one disk and rebuilding, 3 times.

The moral of the story? Monitor your RAID arrays if you like having usable data on your systems.
