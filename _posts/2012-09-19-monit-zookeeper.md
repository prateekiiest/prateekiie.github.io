---
layout: post
title: "monit-zookeeper - Write Monit data to Zookeeper in realtime"
categories:
  - apache
  - c
  - clustering
  - linux
  - monitoring
  - zookeeper
---

Last Friday, over some [great Thai food](https://plus.google.com/107227654526380741051), a
[good friend and colleague](http://keithchambers.com/) and I had an idea to feed Monit data
into Zookeeper in realtime, with the hopes of setting up Zookeeper watches to react to the
events. This weekend I took a stab at it and made some decent progress. All of the basic
functionality is in. First on my TODO list is making node permissions tunable (currently
always set to wide open), which means you should make appropriate security considerations
before running this patch out in the wild.

The patch applies cleanly against Monit 5.4's source, available
[here](http://mmonit.com/monit/dist/monit-5.4.tar.gz). You will need Zookeeper's C client
development libraries available. I compiled and packaged them on CentOS, which installed
them into /usr/include/zookeeper. You may need to adjust if your environment is different.

UPDATE: The patch now supports multiple zookeeper hosts for clustering setups. The
configuration file syntax is slightly different, but more intuitive.

```diff
monit-5.4-zookeeper.patch - Enable Monit to write information to Zookeeper.

Connects Monit to a Zookeeper instance and writes status information
to a host- and service-specific node, which could potentially be monitored
using Zookeeper watches (and acted upon).

The hierarchy for the nodes will be recursively created. You can configure
the parent node structure from the monit configuration file to allow multiple
instances of monit to talk to the same Zookeeper instance without overlapping
service data.

At this time, nodes are created with wide-open permissions (which will be
fixed in a soon-to-come update), so exercise caution in using this patch.

Supports configuring multiple zookeeper hosts for clustering setups.

Author: Ryan Uber <ryuber@cisco.com>

diff -Nur a/Makefile.in b/Makefile.in
--- a/Makefile.in   2012-05-06 02:40:58.000000000 -0700
+++ b/Makefile.in   2012-08-21 13:50:03.995355891 -0700
@@ -379,7 +379,7 @@
          src/process/sysdep_@ARCH@.c
 
 monit_LDADD = libmonit/libmonit.la
-monit_LDFLAGS = -static $(EXTLDFLAGS)
+monit_LDFLAGS = -static $(EXTLDFLAGS) -lzookeeper_mt
 man_MANS = monit.1
 BUILT_SOURCES = src/lex.yy.c src/y.tab.c src/tokens.h
 CLEANFILES = 
diff -Nur a/monitrc b/monitrc
--- a/monitrc   2012-05-06 02:40:45.000000000 -0700
+++ b/monitrc   2012-08-21 13:50:03.997371774 -0700
@@ -21,6 +21,16 @@
 #                           # default Monit check immediately after Monit start)
 #
 #
+## Set Apache Zookeeper connection information. If left commented, Monit will
+## function normally (no Zookeeper writes). If configured, any time a monitored
+## resource changes status, a node will be created (or updated) in Zookeeper.
+#
+#set zookeeper with prefix /monit/hosts and
+#   use address localhost port 2181
+#   use address 127.0.0.1 port 2182
+#   use address 127.0.0.2 port 2183 
+#
+#
 ## Set syslog logging with the 'daemon' facility. If the FACILITY option is
 ## omitted, Monit will use 'user' facility by default. If you want to log to 
 ## a standalone log file instead, specify the full path to the log file
diff -Nur a/src/event.c b/src/event.c
--- a/src/event.c   2012-05-06 02:40:45.000000000 -0700
+++ b/src/event.c   2012-08-21 13:50:19.145358539 -0700
@@ -62,6 +62,8 @@
 #include "event.h"
 #include "process.h"
 
+#include <zookeeper/zookeeper.h>
+
 
 /**
  * Implementation of the event interface.
@@ -656,6 +658,61 @@
     handle_action(E, E->action->succeeded);
   }
 
+  /**
+   * Primary Zookeeper Integration block
+   *
+   * This code block is triggered each time the status of a monitored resource
+   * changes. It will connect to a Zookeeper instance and write status information
+   * to a host and service-specific node, which could potentially be monitored
+   * using Zookeeper watches (and acted upon).
+   */
+  if(Run.ZookeeperEnabled)
+  {
+    char zkpath[ZOOMAXLEN], zkconnect[ZOOMAXLEN], current[ZOOMAXLEN];
+    zkpath[0] = zkconnect[0] = current[0] = '\0';
+    static zhandle_t *zh;
+    Zookeeper_T zk;
+
+    snprintf(zkpath, ZOOMAXLEN, "%s/%s/%s", Run.ZookeeperPrefix, Run.localhostname, Event_get_source_name(E));
+
+    /**
+     * Construct Zookeeper connect string from configured servers
+     */
+    for(zk = Run.ZookeeperServers; zk; zk = zk->next)
+    {
+        snprintf(current, ZOOMAXLEN, "%s:%d", zk->host, zk->port);
+        strcat(zkconnect, current);
+        strcat(zkconnect, zk->next?",":"");
+        current[0] = '\0';
+    }
+
+    void watcher(zhandle_t *zzh, int type, int state, const char *path, void *watcherCtx) {}
+    zh = zookeeper_init(zkconnect, watcher, 10000, 0, 0, 0);
+    for(int i=0;i<ZOOMAXLEN;i++)
+    {
+      if(i>0 && zkpath[i] == '/')
+      {
+        if((zoo_exists(zh, current, 0, NULL)) == (int)ZNONODE)
+        {
+          zoo_create(zh, current, NULL, -1, &ZOO_OPEN_ACL_UNSAFE, 0, 0, 0);
+        }
+      }
+      current[i] = zkpath[i];
+      current[i+1] = '\0';
+    }
+    if((zoo_exists(zh, zkpath, 0, NULL)) == (int)ZNONODE)
+    {
+      zoo_create(zh, zkpath, Event_get_message(E), strlen(Event_get_message(E)), &ZOO_OPEN_ACL_UNSAFE, 0, 0, 0);
+    }
+    else
+    {
+      zoo_set(zh, zkpath, Event_get_message(E), strlen(Event_get_message(E)), -1);
+    }
+  }
+  /**
+   * End Zookeeper
+   */
+
   /* Possible event state change was handled so we will reset the flag. */
   E->state_changed = FALSE;
 }
diff -Nur a/src/l.l b/src/l.l
--- a/src/l.l   2012-05-06 02:40:45.000000000 -0700
+++ b/src/l.l   2012-08-21 13:50:03.998624704 -0700
@@ -305,6 +305,8 @@
 register          { return REGISTER; }
 fsflag(s)?        { return FSFLAG; }
 fips              { return FIPS; }
+zookeeper         { return ZOOKEEPER; }
+prefix            { return PREFIX; }
 {byte}            { return BYTE; }
 {kilobyte}        { return KILOBYTE; }
 {megabyte}        { return MEGABYTE; }
diff -Nur a/src/monit.h b/src/monit.h
--- a/src/monit.h   2012-05-06 02:40:45.000000000 -0700
+++ b/src/monit.h   2012-08-21 13:50:03.998624704 -0700
@@ -118,6 +118,7 @@
 #define PORT_SMTPS         465
 #define PORT_HTTP          80
 #define PORT_HTTPS         443
+#define PORT_ZOOKEEPER     2181
 
 #define SSL_TIMEOUT        15
 
@@ -127,6 +128,9 @@
 #define START_HTTP         1
 #define STOP_HTTP          2
 
+/* Length for Zookeeper paths and connect string */
+#define ZOOMAXLEN          2048
+
 #define TRUE               1
 #define FALSE              0
 
@@ -375,6 +379,12 @@
         struct mymailserver *next;        /**< Next server to try on connect error */
 } *MailServer_T;
 
+typedef struct myzookeeper {
+        char *host;
+        int   port;
+        struct myzookeeper *next;
+} *Zookeeper_T;
+
 
 typedef struct myauthentication {
         char *uname;                  /**< User allowed to connect to monit httpd */
@@ -891,6 +901,7 @@
         int mailserver_timeout;    /**< Connect and read timeout for a SMTP server */
         Mail_T maillist;                /**< Global alert notification mailinglist */
         MailServer_T mailservers;    /**< List of MTAs used for alert notification */
+        Zookeeper_T ZookeeperServers;
         Mmonit_T mmonits;        /**< Event notification and status receivers list */
         Auth_T credentials;    /** A list holding Basic Authentication information */
         int dommonitcredentials;   /**< TRUE if M/Monit should receive credentials */
@@ -908,6 +919,8 @@
 #ifdef OPENSSL_FIPS
         int fipsEnabled;                /** TRUE if monit should use FIPS-140 mode */
 #endif
+        int ZookeeperEnabled;
+        char *ZookeeperPrefix;
 };
 
 
diff -Nur a/src/p.y b/src/p.y
--- a/src/p.y   2012-05-06 02:40:45.000000000 -0700
+++ b/src/p.y   2012-08-21 13:50:04.000361213 -0700
@@ -170,6 +170,7 @@
   static struct mymail mailset;
   static struct myport portset;
   static struct mymailserver mailserverset;
+  static struct myzookeeper zookeeperset;
   static struct myfilesystem filesystemset;
   static struct myresource resourceset;
   static struct mychecksum checksumset;
@@ -207,6 +208,7 @@
   static void  addargument(char *);
   static void  addmmonit(URL_T, int, int, char *);
   static void  addmailserver(MailServer_T);
+  static void  addzookeeper(Zookeeper_T);
   static int   addcredentials(char *, char *, int, int);
 #ifdef HAVE_LIBPAM
   static void  addpamauth(char *, int);
@@ -231,6 +233,7 @@
   static void  setpidfile(char *);
   static void  reset_mailset();
   static void  reset_mailserverset();
+  static void  reset_zookeeperset();
   static void  reset_portset();
   static void  reset_resourceset();
   static void  reset_timestampset();
@@ -298,6 +301,7 @@
 %token <string> TARGET TIMESPEC
 %token <number> MAXFORWARD
 %token FIPS
+%token ZOOKEEPER PREFIX
 
 %left GREATER LESS EQUAL NOTEQUAL
 
@@ -325,6 +329,7 @@
                 | setexpectbuffer
                 | setinit
                 | setfips
+                | setzookeeper
                 | checkproc optproclist
                 | checkfile optfilelist
                 | checkfilesys optfilesyslist
@@ -518,6 +523,22 @@
                 | START DELAY NUMBER { $<number>$ = $3; }
                 ;
 
+setzookeeper    : SET ZOOKEEPER zoolist {
+                    Run.ZookeeperEnabled = TRUE;
+                  }    
+                ;
+
+zoolist         : PREFIX PATH { Run.ZookeeperPrefix = $<string>2; }
+                | zoolist zoohost
+                ;
+
+zoohost         : ADDRESS STRING PORT NUMBER {
+                    zookeeperset.host = $<string>2;
+                    zookeeperset.port = $<number>4;
+                    addzookeeper(&zookeeperset);
+                  }    
+                ;
+
 setexpectbuffer : SET EXPECTBUFFER NUMBER unit {
                     Run.expectbuffer = $3 * $<number>4;
                   }
@@ -1973,6 +1994,9 @@
 #ifdef OPENSSL_FIPS  
   Run.fipsEnabled         = FALSE;
 #endif
+  Run.ZookeeperEnabled    = FALSE;
+  Run.ZookeeperPrefix     = "monit/hosts";
+  Run.ZookeeperServers    = NULL;
   for (i = 0; i <= HANDLER_MAX; i++)
     Run.handler_queue[i] = 0;
   /* 
@@ -2929,6 +2953,33 @@
   reset_mailserverset();
 }
 
+static void addzookeeper(Zookeeper_T zookeeper) {
+
+  Zookeeper_T z;
+  
+  ASSERT(zookeeper->host);
+
+  NEW(z);
+  z->host        = zookeeper->host;
+  z->port        = zookeeper->port;
+
+  z->next = NULL;
+
+  if (Run.ZookeeperServers) {
+    Zookeeper_T l;
+    for (l = Run.ZookeeperServers; l->next; l = l->next) /* empty */;
+    l->next = z;
+  } else {
+    Run.ZookeeperServers = z;
+  }
+  
+  reset_zookeeperset();
+}
+
+static void reset_zookeeperset() {
+  memset(&zookeeperset, 0, sizeof(struct myzookeeper));
+  zookeeperset.port = PORT_ZOOKEEPER;
+}
 
 /*
  * Return uid if found on the system. If the parameter user is NULL
```
