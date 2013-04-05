---
layout: post
title: "Configuring console blanking on RHEL5-based distributions"
categories:
  - c
  - kernel
  - linux
---

As the title states, the following patch will give you the ability to configure screen
blanking persistently on a RHEL5-compatible kernel, without having to make a bash loop
on startup. If you aren't modifying the RHEL kernel already, then I'd recommend you just
do some bash-fu on startup, however, if you already have some custom patches or
extensions / modules in your RHEL-derivative kernel, may as well stick this patch into
your build repository as well.

Feedback would be greatly appreciated. I'm not really a kernel developer but would love
to know if you have any suggestions.

```diff
The "consoleblank=" is a very handy little addition to the kernel boot arguments,
especially nowadays with virtual machines growing in number quite rapidly.

There is, generally speaking, no damageable screen attached to most Linux machines
these days. Since using "setterm" does not make customizations persistent, the only
way to disable screen blanking without this patch is by adding some script-fu
to /etc/rc.local or similar start script, with "setterm -blank N", for each TTY
you do not wish to activate a screensaver for.

Rather, let's add this functionality (which is already available in later versions
of the Linux kernel) as a configurable argument to the kernel boot line.

The "consoleblank" kernel argument will take an integer value, which will specify
the blanking timeout in seconds. Set it to "0" to disable screen blanking entirely.

Ryan R. Uber <ryan@blankbmx.com>

--- a/Documentation/kernel-parameters.txt   2011-02-08 23:30:42.758108332 +0000
+++ b/Documentation/kernel-parameters.txt   2011-02-08 23:31:14.309331657 +0000
@@ -425,6 +425,10 @@
            switching to the matching ttyS device later.  The
            options are the same as for ttyS, above.
 
+   consoleblank=   [KNL] The console blank (screen saver) timeout in
+           seconds. Defaults to 10*60 = 10mins. A value of 0
+           disables the blank timer.
+
    cpcihp_generic= [HW,PCI] Generic port I/O CompactPCI driver
            Format:
            <first_slot>,<last_slot>,<port>,<enum_bit>[,<debug>]
--- a/drivers/char/vt.c 2011-02-08 23:30:39.667988520 +0000
+++ b/drivers/char/vt.c 2011-02-09 00:16:56.715662063 +0000
@@ -171,8 +173,24 @@
 int console_blanked;
 
 static int vesa_blank_mode; /* 0:none 1:suspendV 2:suspendH 3:powerdown */
-static int blankinterval = 10*60*HZ;
 static int vesa_off_interval;
+static unsigned long blankinterval = 10*60;
+
+/*
+ *  Newer kernel releases use core_param here, as seen below:
+ *  core_param(consoleblank, blankinterval, int, 0444);
+ *  The EL5 kernel does not yet have the core_param() function,
+ *  so we backport by using module_param_named() instead, add
+ *  a call to __setup(), and provide a function to set the
+ *  proper value.
+ */
+static int __init consoleblank_config(char *val)
+{
+    blankinterval = simple_strtoul(val,NULL,0);
+    return 0;
+}
+__setup("consoleblank=", consoleblank_config);
+module_param_named(consoleblank, blankinterval, int, 0444);
 
 static DECLARE_WORK(console_work, console_callback, NULL);
 
@@ -1374,7 +1392,7 @@
            update_attr(vc);
            break;
        case 9: /* set blanking interval */
-           blankinterval = ((vc->vc_par[1] < 60) ? vc->vc_par[1] : 60) * 60 * HZ;
+           blankinterval = ((vc->vc_par[1] < 60) ? vc->vc_par[1] : 60) * 60;
            poke_blanked_console();
            break;
        case 10: /* set bell frequency in Hz */
@@ -3374,7 +3392,7 @@
        return; /* but leave console_blanked != 0 */
 
    if (blankinterval) {
-       mod_timer(&console_timer, jiffies + blankinterval);
+       mod_timer(&console_timer, jiffies + (blankinterval * HZ));
        blank_state = blank_normal_wait;
    }
 
@@ -3408,7 +3426,7 @@
 static void blank_screen_t(unsigned long dummy)
 {
    if (unlikely(!keventd_up())) {
-       mod_timer(&console_timer, jiffies + blankinterval);
+       mod_timer(&console_timer, jiffies + (blankinterval * HZ));
        return;
    }
    blank_timer_expired = 1;
@@ -3438,7 +3456,7 @@
    if (console_blanked)
        unblank_screen();
    else if (blankinterval) {
-       mod_timer(&console_timer, jiffies + blankinterval);
+       mod_timer(&console_timer, jiffies + (blankinterval * HZ));
        blank_state = blank_normal_wait;
    }
 }


```
