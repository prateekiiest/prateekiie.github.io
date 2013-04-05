---
layout: post
title: "Running an Apple 27-inch LED Cinema Display on a standard PC"
categories:
  - gadgets
  - hardware
---

During a trip to the local computer store, found myself walking through the Apple section.
Normally I won't be found in there as I generally run Linux for just about everything
(desktop, server), but this time, the LED Cinema displays really caught my eye. Such a
beautiful display, so bright and crisp, and so clean-looking. I had to have one for myself.
(Of course I didn't buy at the store. Ordered online and saved $100.)


![""](/assets/attachments/2011-11-23-apple-led-display-box.jpg "")

Now then, first thing's first: Connecting the thing to the PC. The Apple 27" LED display
that I purchased comes with *only* a mini displayport connection. No DVI, no HDMI. This
actually didn't bother me so much, since the mini displayport is present on a number of
ATI cards. I set out to find a new graphics card. The first one I came across (and
actually ended up purchasing alongside the monitor) was the Apple GeForce GT120. Yes,
its an Apple product meant to be an upgrade to the Mac Pro's from early 2009, but it was
a PCI Express card, nothing out of the ordinary (probably just re-branded). Remembering
back to my Hackintosh days, I figured that I probably had the best bet with this card.
Apple makes it, so it should work right?

![""](/assets/attachments/2011-11-23-apple-graphics-card.jpg)

Wrong! While the DVI graphics worked just fine on an older monitor (Samsung P2350), the
mini displayport would give me no video. I am guessing that Apple probes the card in some
way that my PC does not. Also note, at this point I had still never seen the display
even power on, since the new LED displays are controlled completely via the MDP, and
thus there is not a single button on the entire monitor.

A little disgruntled, I removed the GT120 from my PC and moved on to the next solution:
an ATI card with MDP. I found one at my local Fry's Electronics, and ordered online for
local pickup. It was the  AMD HD 6870 XOC. All of the specifications looked correct on
the site; 1x Dual-Link DVI, 1x Single-Link DVI, 1x HDMI, and 2x mini displayports. I
picked the card up from the store and headed home for installation. To my surprise, when
I pulled the card out of the box, it had 2x DVI ports and 1x displayport, not even a
minidispalyport or any HDMI connections. It was identical to the item on the website in
every other way, shape, and form, but the interface description on the left side of the
box had a sticker over it with the downgraded specifications.

Needless to say, I had to return it. I didn't want to run any displayport to
mini-displayport adapters or any other nonsense like that.

I ended up finding the XFX version of the Radeon HD 6870 at MicroCenter for around the
same price. This time I verified before walking out the door with the card.

![""](/assets/attachments/2011-11-23-radeon-graphics-card.jpg)

While I was installing the card, I noticed the box sitting next to me mentioning the
interface was PCI Express 2.1. I didn't think anything of it, because I had done my
homework beforehand and learned that any PCIE 2.1 card would work in a 2.0 slot.

To my surprise, after installing the card and connecting everything in my Gigabyte
H55M-S2V, the card did not function at all! After further reading and research, I still
did not find an answer as to why the card would not function in this particular
motherboard. A BIOS update and still, nothing. Irritated and ready to just start using
the darn monitor and stop fiddling with hardware, I went out and bought a new motherboard.
My processor was LGA1156 based, so I had limited options. I ended up with an ASUS
P7P55D-ELX. It had a few goodies that my old board didn't, like 6GB/s SATA and USB 3.0.
After further ripping apart/assembling my PC, I finally was able to boot up, and see
the display work perfectly!

The BIOS POST showed up just fine, stretched to the size of the 2560x1440 native on the
LED. Everything was all well and good. I did notice though, that the back light was
looking pretty dim. I then realized that the factory default for the brightness setting
is not set to the max, or even a reasonable brightness. It is in fact pretty dim, even
with the ambient light detection/adjustment in the iSight. What I ended up doing to solve
this was installing Windows 7, and on top of that, installing Boot Camp from a Snow
Leopard DVD that I had. It is noteworthy though, that the version of Boot Camp that came
on the Snow Leopard disk did not give me full access to the brightness control. Even
with the slider all the way up to max, I still only had maybe 50% brightness. After
running the Apple Software Update utility and getting the latest Boot Camp, and a
subsequent reboot, I watched my Cinema Display come to life as I dragged the slider all
the way up and the brightness began to burn my pupils!

After all of this fighting to get a Cinema Display to work sans the Mac, I would indeed
say that it is worth it. After setting the brightness settings in Boot Camp, feel free
to nuke your Windows installation and go back to using Ubuntu, Fedora, SuSE, or whatever
it is you like using. The LED display will remember the settings internally and won't
need to set them again.

A note about the video card:
I found the XFX HD 6870 to be a bit noisy for my taste. Not overpowering noisy, but my
tower sits right next to me on my desk and I don't like the sound of fans for hours on end.
Installing MSI Afterburner and setting an automatic fan profile like the following,
the noise level is more than acceptable and the GPU remains relatively cool (~50-55C).

![""](/assets/attachments/2011-11-23-msi-afterburner.jpg)

In conclusion: It is totally worth it. You should do it.
