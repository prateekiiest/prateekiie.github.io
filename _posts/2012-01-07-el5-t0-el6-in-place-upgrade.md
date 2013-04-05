---
layout: post
title: "EL5 to EL6: Pushing an in-place upgrade with Puppet"
categories:
  - bash
  - rhel
  - linux
  - puppet
  - rpm
---

EL6 is a large step up from the 5.x family - There are hundreds of improvements that every sysadmin
will be eager to take advantage of; newer versions of most popular packages, a new kernel based
on 2.6.32, new software added to the enterprise linux "base", etc. With so many large changes to
the operating system, in-place upgrades become harder. You have a gang of EL5.x boxes and want to
move them to the 6.x distribution, but the fence between the two distributions is a fairly high
one, the largest feat being the updates to YUM, python (2.6), and RPM itself (4.6+). You can't
read new RPM packages with an old version of RPM (pre-4.6 can't read EL6-ready RPMs), and there
is no 4.6 version of RPM available for the EL5 distribution. Upgrading core components such as
glibc and python in-place can be scary too. However, the jump from EL5 to EL6 is not impossible.
I'll outline here how I was able to make it happen.

## What you can't be afraid of to accomplish this
* Forcefully breaking RPM dependencies (will be resolved upon completion)
* Ignoring package checksum mismatches
* Rebooting

## New version of RPM
Seeing how its not possible to install EL6 RPM's with EL5's stock version of RPM, the first thing
to do is to get that newer version of RPM installed on your system. Keith Chambers, a friend and
colleague of mine, recompiled RPM 4.6 against glibc 2.5 so that it would work with the current
EL5 system. RPM 4.8 may have worked as well, but 4.6 worked for me, and I only needed to use this
version during the big upgrade. RPM will replace itself with the stock EL6 version later on. For
dependencies, I needed to include xz-libs and lua. I force-upgraded these packages (--nodeps).
What you want to end up with is:

```
# rpm --version
RPM version 4.6.0
```

## Patch YUM
Since the new RPM's coming from the repo will be verified with a newer hashing algorithm than what
YUM/python2.4 will recognize, I needed to make a few quick patches to YUM itself to force it to
ignore conflicts. These ghetto-hack patches will be automatically removed from the system when YUM
upgrades itself, so really this is only needed one time.

```diff
diff -Nur /usr/lib/python2.4/site-packages/yum.orig/depsolve.py /usr/lib/python2.4/site-packages/yum/depsolve.py
--- /usr/lib/python2.4/site-packages/yum.orig/depsolve.py       2011-08-19 15:07:02.000000000 +0000
+++ /usr/lib/python2.4/site-packages/yum/depsolve.py    2012-01-07 20:43:21.634917883 +0000
@@ -142,6 +142,7 @@
                             'repackage': rpm.RPMTRANS_FLAG_REPACKAGE}

         self._ts.setFlags(0) # reset everything.
+        self._ts.addTsFlag(rpm.RPMTRANS_FLAG_NOMD5)

         for flag in self.conf.tsflags:
             if ts_flags_to_rpm.has_key(flag):
diff -Nur /usr/lib/python2.4/site-packages/yum.orig/__init__.py /usr/lib/python2.4/site-packages/yum/__init__.py
--- /usr/lib/python2.4/site-packages/yum.orig/__init__.py       2011-08-19 15:07:02.000000000 +0000
+++ /usr/lib/python2.4/site-packages/yum/__init__.py    2012-01-07 20:43:01.074133746 +0000
@@ -1217,6 +1217,7 @@
                 failed = True


+        failed = False
         if failed:
             # if the file is wrong AND it is >= what we expected then it
             # can't be redeemed. If we can, kill it and start over fresh
diff -Nur /usr/lib/python2.4/site-packages/yum.orig/yumRepo.py /usr/lib/python2.4/site-packages/yum/yumRepo.py
--- /usr/lib/python2.4/site-packages/yum.orig/yumRepo.py        2011-08-19 15:07:02.000000000 +0000
+++ /usr/lib/python2.4/site-packages/yum/yumRepo.py     2012-01-07 20:43:09.834466442 +0000
@@ -1467,6 +1467,7 @@
             file = fn.filename
         else:
             file = fn
+        return 1

         try:
             l_csum = self._checksum(r_ctype, file) # get the local checksum
```

I wrote a few quick lines in SED to handle this patching for me:

```bash
sed -i '/^        if failed:/i\        failed = False' /usr/lib/python2.4/site-packages/yum/__init__.py
sed -i '/^            file = fn$/a\        return 1' /usr/lib/python2.4/site-packages/yum/yumRepo.py
sed -i '/# reset everything.$/a\        self._ts.addTsFlag(rpm.RPMTRANS_FLAG_NOMD5)' /usr/lib/python2.4/site-packages/yum/depsolve.py
```

## Package Conflicts
There are a number of packages while performing an upgrade from EL5 to EL6 that will cause you
trouble, as some of the version numbers have actually decremented, and some cause dependency
resolution issues that will be solved only after the upgrade is complete. The following is a
small snippet that I used to force my way out of this situation:

```bash
declare -ra FORCEREMOVE=(
    m2crypto centos-release newt authconfig prelink tcp_wrappers sgpio
    iscsi-initiator-utils mkinitrd dmraid dmraid-events hmaccalc sysfsutils
    device-mapper device-mapper-multipath device-mapper-event
    vmware-open-vm-tools-common vmware-open-vm-tools-kmod less usermode
    libhugetlbfs lvm2 kpartx e4fsprogs-libs glib libsysfs
)
for PKG in ${FORCEREMOVE[@]}; do
    rpm -e --nodeps ${PKG}
done
```

## PAM authentication work-around
By default, the RPM's that install PAM do not clean out its include directory (/etc/pam.d). If
the authentication modules you are using change at all (new ones added, old ones removed), you
will need to manually clean out this directory. I found it easiest to just remove all of the
configs and let them be re-populated by the new RPM's. Without this step, after the upgrade
completed, I was unable to log in to the console of the machine, because some authentication
modules specified in the config files were now absent (no longer needed in the product I work
on). If you have custom configs, you will need to account for them somehow, hopefully using
Puppet or your configuration tool of choice.

```bash
rm -f /etc/pam.d/*
```

## Re-install centos-release
You will notice in one of the steps above that I force-removed the centos-release package.
The reason I needed to do this was because of the following:

```
package centos-release-5-7.el5.centos.x86_64 (which is newer than centos-release-6-0.el6.centos.5.x86_64) is already installed
```

By force-removing the centos-release package, and then performing a "yum install
centos-release", the centos-release package gets updated to  the 6.x version.

## Downgrade nss
This is a very important step. The version of "nss" actually decremented between EL5 and EL6.
Since the new glibc 2.12 requires nss-softokn-freebl, which requires nss, we need to downgrade
nss. This step should downgrade nss, install a few new packages, and update glibc. Once you do
this, there is really no going back.

```
# yum downgrade nss
Loaded plugins: fastestmirror
Setting up Downgrade Process
Loading mirror speeds from cached hostfile
Resolving Dependencies
--> Running transaction check
---> Package nss.x86_64 0:3.12.7-2.el6 set to be updated
--> Processing Dependency: nss-softokn(x86-64) >= 3.12.7 for package: nss
--> Processing Dependency: nss-util >= 3.12.7 for package: nss
--> Processing Dependency: libnssutil3.so(NSSUTIL_3.12.3)(64bit) for package: nss
--> Processing Dependency: nss-system-init for package: nss
--> Processing Dependency: libnssutil3.so(NSSUTIL_3.12)(64bit) for package: nss
--> Processing Dependency: libnssutil3.so(NSSUTIL_3.12.5)(64bit) for package: nss
--> Processing Dependency: libnssutil3.so()(64bit) for package: nss
---> Package nss.x86_64 0:3.12.8-4.el5_6 set to be erased
--> Running transaction check
---> Package nss-softokn.x86_64 0:3.12.8-1.el6_0 set to be updated
--> Processing Dependency: nss-softokn-freebl(x86-64) >= 3.12.8 for package: nss-softokn
---> Package nss-sysinit.x86_64 0:3.12.7-2.el6 set to be updated
---> Package nss-util.x86_64 0:3.12.8-1.el6_0 set to be updated
--> Running transaction check
---> Package nss-softokn-freebl.x86_64 0:3.12.8-1.el6_0 set to be updated
--> Processing Dependency: libc.so.6(GLIBC_2.7)(64bit) for package: nss-softokn-freebl
--> Running transaction check
---> Package glibc.x86_64 0:2.12-1.7.el6_0.5 set to be updated
--> Processing Dependency: glibc-common = 2.12-1.7.el6_0.5 for package: glibc
--> Running transaction check
---> Package glibc-common.x86_64 0:2.12-1.7.el6_0.5 set to be updated
--> Processing Conflict: glibc conflicts binutils < 2.19.51.0.10
--> Restarting Dependency Resolution with new changes.
--> Running transaction check
---> Package binutils.x86_64 0:2.20.51.0.2-5.11.el6 set to be updated
--> Processing Conflict: glibc conflicts prelink < 0.4.2
--> Restarting Dependency Resolution with new changes.
--> Running transaction check
---> Package prelink.x86_64 0:0.4.6-3.el6 set to be updated
--> Finished Dependency Resolution

Dependencies Resolved

=========================================================================================
 Package                   Arch          Version                     Repository     Size
=========================================================================================
Updating:
 binutils                  x86_64        2.20.51.0.2-5.11.el6        base          2.8 M
 prelink                   x86_64        0.4.6-3.el6                 base          994 k
Downgrading:
 nss                       x86_64        3.12.7-2.el6                base          735 k
Installing for dependencies:
 nss-softokn               x86_64        3.12.8-1.el6_0              base          166 k
 nss-softokn-freebl        x86_64        3.12.8-1.el6_0              base          115 k
 nss-sysinit               x86_64        3.12.7-2.el6                base           26 k
 nss-util                  x86_64        3.12.8-1.el6_0              base           46 k
Updating for dependencies:
 glibc                     x86_64        2.12-1.7.el6_0.5            base          3.7 M
 glibc-common              x86_64        2.12-1.7.el6_0.5            base           14 M

Transaction Summary
=========================================================================================
Install       4 Package(s)
Upgrade       4 Package(s)
Remove        0 Package(s)
Reinstall     0 Package(s)
Downgrade     1 Package(s)
```

Once this has completed, you are clear to upgrade the rest of the system.

```
# yum -y upgrade
```

## Re-install a few packages
A few of the packages that we force-removed for dependency resolution reasons will not get
automatically installed. Therefore, we need to install them by hand:

```
declare -ra VMW_PKGS=(
    vmware-tools-core
    vmware-tools-foundation
    vmware-tools-guestlib
    vmware-tools-libraries-nox
    vmware-tools-plugins-guestInfo
    vmware-tools-plugins-vix
    vmware-tools-services
    vmware-tools-plugins-deployPkg
)
yum -y install ${VMW_TOOLS[@]} prelink lvm2 less
```

You can ignore the vmware packages if you are not using them.

## Remove the old kernels
You should no longer need any of your EL5 kernels. You have hopped the fence and are in the
land of EL6 now. You should be able to delete (rpm -e) any kernel-2.6.18* packages that are
still installed.

## Rebooting
Since I added all of the above logic in a script and executed it during a pre-install stage
with Puppet, I had to have a way to automatically reboot the machines as well. In one of my
previous posts, [Puppet Self-Management](http://www.ryanuber.com/puppet-self-management.html),
I detailed how to patiently wait for a puppet run to finish before executing some action
from within a script. I applied this same technique to the reboot for my EL5 to EL6 upgrade
script. Since I am executing my upgrade script during a puppet run, I do not want to bounce
the machine before the run completes to avoid corrupting the state, and also to ensure that
all of my other puppet-managed updates are applied before the machine boots in to EL6 for the
first time. I accomplished this with the following code at the very end of my upgrade script:

```
/bin/sh -c "
    until [ ! -f /var/lib/puppet/state/puppetdlock ]
    do
        sleep 1
    done
    /sbin/shutdown -r now" &
```
