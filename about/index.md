---
layout: default
title: About
published: true
---

![""](https://avatars2.githubusercontent.com/u/16035442?s=460&v=4)

Personal Website: <http://prateekiiest.github.io>  
GitHub: <https://www.github.com/prateekiiest>  
LinkedIn: <https://www.linkedin.com/in/prateek-chanda-iiest/>

## Objective
I love working in fast-paced, Unix-based development / server administration roles (devops) as part of a highly collaborative and innovative team. Keeping up with the latest technologies is a very high priority. Furthering and broadening my knowledge of the Linux operating system and the various programming languages that make it useful.

## Capabilities
* Proficient in UNIX-like environments, including Red Hat Enterprise and variants, Debian and variants, and FreeBSD.
* I am a Red Hat Certified Technician / Engineer and plan on furthering my certification with Red Hat.
* Proficient in Bash/Shell, Python, ANSI C, and PHP for both web-based front-ends as well as server-side automation.
* Understanding of object-oriented programming models and MVC.
* Knowledgeable in standard networking protocols and tools (SMB, SMTP, IMAP, SSH, NFS, IPTables, etc...)
* Familiarity with Windows Server 2003 / 2008 Standard, Enterprise, and Datacenter edition, and basic services such as RDC, Terminal Server, and MSSQL. Some experience with Hyper-V.
* Strong knowledge with the Linux kernel, customizing Linux kernels, and the Linux boot process.
* Familiarity with Cisco PIX hardware firewalls, mainly the 501 model.
* Strong background in server management, including distributed management of many like computers.
* In-depth understanding of newer technologies such as Puppet. Skilled in formulating Puppet manifests, including classes, file / exec / cron / package / service resources etc. I pay close attention to patterns and make heavy use of relationships (run stages, inheritance, dependencies)
* Strong packaging skills in RPM format. Experience building and maintaining multiple versions of packages while keeping dependency resolution consistent.
* Experience in back-porting software in the Linux kernel, Apache HTTP server, bash shell, and other programs to bring newer, needed features into an enterprise distribution without deviating otherwise from the original patched sources.
* I have an innovative mind and am capable of inventing ways around problems and road blocks.
* Experience using VMWare, utilizing OVF properties to automate deployment, and working with the VMWare Linux tools suite.
* Experience in working with different open source licenses within a large corporation

## Relevant Experience
### Cisco Systems, Inc. (January 2011 - Present)
* Relocated to the bay area, California
* Automated remastering of a RHEL-based Linux distribution, including custom packages and installation procedures.
* Utilized kickstart heavily, and invented work-arounds for features that are not officially supported by Anaconda, such as configuring an LVM PV on a raw block device. 
* Wrote a custom CLI shell in C utilizing ncurses to provide a clean and consistent "closed-box" feel. It included features such as networking configuration, name resolution configuration, puppet client configuration, an interface using PAM to change the administrator's account password, and access to common VM tasks such as shut down and reboot.
* Converted a large number of Python-based deployment scripts into Puppet manifests to streamline installation procedures and provide a "desired state" enforcement mechanism for all of our virtual machines. Made use of Puppet's external nodes feature to hand management of nodes and service subscriptions off to a database table and eliminate parsing/writing puppet manifests with code.
* Automated deployment of many services (installation, configuration, service monitoring), including mongodb with multiple replication slaves, Oracle, memcached, Tomcat instances, Openfire XMPP server, ActiveMQ, and more.
* Wrote a modular, object-oriented REST API using PHP and PDO to provide a central interface to all deployment functions of the product. Business logic was implemented as modules, and the core of the API was left untouched, making it extremely re-usable and extensible. Features include multiple/pluggable encoding types (JSON, XML, and YAML provided by default), individual API versioning to support up-to-date and legacy clients concurrently, a "hooks" facility to allow adding custom pre- or post-execution tasks on a per-API basis, and a module to provide OAuth 1.0a support, including and interface to manage consumer tokens. Our own administrative * Web UI was a consumer of the API.
* Wrote an extension to the aforementioned API to provide virutal machine verification, which included a combination of a full RPM verify, configuration dry-run with change notification, and authentication reporting. These verification utilities provided insight to any manual modifications made to a system since its deployment.
* Assisted a team working towards a common deployment architecture, which included building virutal machine images automatically from JSON configuration inputs and automated testing and verification of the images before being "promoted" to production deployments.
* Automated in-place upgrades from RHEL 5 to RHEL6 using puppet, RPM, and YUM. Involved patching a few YUM functions, installing a custom version of RPM to perform the upgrade, and a reboot at the end.</ul> </li> 

### Codero.com (Formerly Aplus.net, August 2008 - January 2011)
* Promoted to Manager, Dedicated Server Engineering from my former Aplus.net position.
* Relocated to Kansas City, Kansas to work from Codero's headquarters.
* Developed and implemented a larger-scale management platform utilizing Puppet, which is controlled and configured through a centralized management interface written in object-oriented PHP from the ground up.
* Scripted and maintained our "Managed Services" provisioning procedure, which involved rewriting many configuration files, installation of a large application stack, testing of remote logging services, implementing iptables firewall rules, locking down the secure shell daemon to key authentication, updating insecure packages, installing control panel software, and configuring remote server management services. All of the listed items were carried out automatically with no user interaction. Server roles were templated and easily pushed to new infrastructure.
* Built and maintained an RPM package repository to provide more recent technologies than stock CentOS packages could provide to our customers. This included building pre-patched versions of software to protect servers against known security exploits or to fix common bugs that were not being given priority upstream. Maintained binary and dependency compatibility with the underlying operating system so that when official packages were released we could install them instead.
* Watched a number of "announce" mailing lists to ensure the latest and most stable versions of software were implemented on customer servers.
* Managed a team of engineers (small group, between 4 and 8 people at once).
* Assisted superiors with internal product and procedure development.

### Aplus.net (April 2006 - August 2008)
* Hired into Level II support, dealing mainly with system configurations and troubleshooting.
* Transferred to a datacenter position one month after hire.
* Much time spent installing, troubleshooting, and configuring dedicated servers, ranging from simple stand-alone servers to more complex server farms behind a Web Mux load balancer or Cisco firewall.
* Promoted to a Lead Dedicated Server Technician early in 2007
* Traveled to Phoenix, Arizona to help establish a new datacenter location. Flew back and forth for 3-4 months. * Traveled to Kansas City to aid in development of a new department.
* Assisted in relocation of an entire datacenter, with inventory including arrays of servers, private networks, hardware firewalls, and load balancers.
* Ported server provisioning software from Trustix Secure Linux to CentOS 5.1, which required porting Perl 5.8.5 scripts to 5.8.8.
* Wrote an IP address database from scratch in PHP / Javascript with a web front-end which keeps track of over 15,000 active IP addresses, which customer they belong to, LAN information, MAC addresses, and physical locations of servers.
* Established the Managed Services department, promoted to Manged Services Administrative Lead. Configured services for clients such as centralized remote syslogging via secured TCP, services monitoring and alerts, custom software repositories with pre-configured packages, and complete OS / Control Panel mirrors.

### California Reigonal Intranet / Complex Drive Business Internet (2005 - 2006)
* Began as a sales representative in early 2005
* Transferred to Support department a few months after hire
* Worked mainly with server configurations, as well as providing support to network engineers and sysadmins.
* Attended weekly training seminars in the Complex Drive colocation facility, covering shell scripting, mail troubleshooting, and other various administration essentials.

## Specialized Training
* RedHat Certified Technician # 605007617314710 (verify at <https://www.redhat.com/training/certification/verify>)
* RedHat Certified Engineer # 805008830334209 (verify at <https://www.redhat.com/training/certification/verify>)
* RedHat Certified System Administrator # 100-018-837 (verify at <https://www.redhat.com/training/certification/verify>)
* Parallels Automation Professional for Parallels Plesk Panel for Linux
* Parallels Automation Engineer for Parallels Plesk Panel for Linux
* Parallels Certified Virtualization Professional for Linux

## Other Qualifications
* Implemented automated unit testing and static analysis using PHPUnit and home-grown software testing tools.
* Familiar with Nagios and other monitoring platforms, and have scripted many daily duties as the administrator of such servers.
* Performed kernel-level patching and packaging in RPM format
* Familiar with remote logging mechanisms (primarily rsyslogd) and the monitorware database schema, as well as configuration and maintenance of GUI interfaces such as Adicson Log Analyzer and Splunk.
* Re-wrote many scripts used on a daily basis for a growing dedicated server business, including automated customer notification emails, simple fixes for common dedicated server problems, and automations for tedious everyday tasks.
* Wrote a Linux debugging script that repaired root-compromised servers. Parts of the script were deployed across a network and serviced many dedicated servers.
* Managed a small group of desktop computers with both Linux and Microsoft operating systems, including tasks such as normal security updates, filesystem maintenance, user management, remote home directories / NIS authentication, and application installation / configuration.
* Ran a dedicated server for many years, successfully migrated it with no data loss and minimal service interruption.
* Understandiong of the importance of monitoring server logs and resource utilization.
* Wrote server provisioning software capable of booting a computer via PXE and DHCP, partitioning hard drives, and deploying an operating system. The program is completely manageable through a self-written and easy-to-use web interface. It is capable of being implemented on large networks, and utilizes modern technologies including NFS, Apache, PHP, Bash, Linux, and SQLite among many others.
* Completed a number of side-jobs, mainly in web development, using utilities such as Flash, HTML, and CSS. Many of these projects included a dynamic back-end for the user to update their website on their own.
* Experience administrating devices controlled by Cisco IOS software.
* Kept regular backups of multiple hosts for a number of years. All backups were stored with multiple increments.
