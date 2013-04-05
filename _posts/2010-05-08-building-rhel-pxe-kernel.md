---
layout: post
title: "Building a RHEL kernel optimized for PXE booting"
categories:
  - kernel
  - linux
  - c
---

Some time ago, I wrote a rather large piece of software for my employer to automate
bare-metal installs of CentOS and Ubuntu operating systems. During my endeavors, I
found the need to build a customized version of the CentOS / RHEL kernel to enable me
to netboot and simulate the entire RHEL operating system. Some key reasons for needing
this functionality include:

* Hardware identification -- this is a biggie, as the `mikinitrd` utility is heavily
  dependent on which kernel modules are loaded and which version of the Linux kernel is
  running. I can't accurately run mkinitrd while running the 2.6.32 version of the
  kernel that Ubuntu sports in 10.04 as the hardware is identified in a vastly different
  fashion.
* Modular kernel architecture -- How am I going to PXE boot this sucker? PXE is undoubtedly
  dependant on TCP/IP being functional to obtain the kernel, modules, and init environment.
  How would loading a minimalistic kernel work, since it needs to load the appropriate
  kernel modules?
* Compatibility -- The kernel in RHEL was built the way it was for a reason, as was the
  kernel for Ubuntu. If I build it my way, even if it works today, maybe tomorrow some obscure
  issue with a client's server will come up, that originated from a discrepancy in kernel
  versions during install time.

Having said that, let's explore just a few things that I did to modify my kernel to PXE boot
me to an installation-safe kernel.

The first thing I did -- for obvious reasons, was to download the kernel SRPM for the current
RHEL kernel (2.6.18-168 at the time of this writing). With that, I installed the SRPM into
my RPMBuild environment, and did the following:

```
# cd /usr/src/redhat/SRPMS
# wget [kernel SRPM url]
# rpm -ivh [kernel SRPM file name]
# cd ../SPECS
# rpmbuild -bp kernel-2.6.spec
# cd ../BUILD/[kernel BUILDROOT]
```

This gives me a kernel build environment equivalent to what the RHEL kernel would be pre-compile.
I need this because the RHEL kernel contains so many patches that would not be available if I
simply downloaded the source from [kernel.org](http://www.kernel.org). There were ~3700 patches
to give you an idea of how much stuff Red Hat has backported / patched.

The next thing I did was entered the "make menuconfig" TUI, and marked Drivers > Network Device
Support as static, rather than modular. This makes my PXE boot scenario possible because the
kernel-level networking driver is available no matter what, independent of loaded kernel modules.
If this kernel is loaded, so are the drivers I statically compiled. I did not include any drivers
that were not already marked for installation as either modular or static. I simply changed all
drivers marked as modular to static and went on my merry way.

Another critical functionality that I required was the ability to mount the root filesystem via an
NFS share. To accomplish this, I marked IP_PNP as static (as per the kernel configuration, IP_PNP=y),
which then opens up my option to mark NFS root as static as well. The NFS root option is available
under Filesystems > Network Filesystems > Root NFS. The reason that I needed this is because I will
be loading all non-boot-essential drivers from a shared directory via NFS, as well as all of my
init scripts and other hackery.

With these options in place, I am safe to proceed with a

```
make -j20 bzImage && make -j20 modules && make modules_install
```

At this point, I was able to get up and take an hour lunch and still manage to make it back before
the compilation finished, as I was using an extremely limited Xen VM for very disappointing reasons.

With the bzImage and modules compiled, it was time to start packing things up to distribute to my
provisioning machines. The modules weighed in at a hefty 398MB, which is 100% unacceptable,
especially when you are going to be loading them over NFS. The following fix is fairly simple, and
I can't see why you wouldn't do this every time you build kernel modules. Strip the darn things of
debugging info!

```
# cd /lib/modules/[kernel version number]
# find . -type f -name '*.ko' -exec strip --strip-debug {} +
```

Watch the size drop from a whopping ~400MB to a pleasant and manageable 38MB.

Copy your bzImage ([KERNBUILDROOT]/arch/[x86|x86_64]/boot/bzImage) and modules directory into whatever
format you like, in my case, .tar.bz2, and ship 'em off to the box that is doing the PXE booting.

A kernel built in this fashion will have the capability of netbooting from any networking hardware
that RHEL supports, and should have close to, if not actually 100% hardware compatibility with the actual
OS, making for an extremely easy-to-use, no-frills netboot Linux operating system.

EDIT: I felt it necessary to link to the page I formerly blogged about this application's development,
even though I have set the domain to not auto-renew now:

[baremetal-da.com](http://www.baremetal-da.com)
