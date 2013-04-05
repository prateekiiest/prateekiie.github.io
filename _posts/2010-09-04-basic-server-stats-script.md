---
layout: post
title: "Basic server statistics script for PHP"
categories:
  - php
  - linux
  - performance
  - web
---

Recently at work, I found myself needing to give a customer access to a few basic statistics
on his web servers, but seeing as they are 100% managed, and they get no type of access other
than FTP, I had to find a way to deliver them the numbers they wanted by means other than SSH.

FTP would not be a good candidate, it doesn't make sense that they would need to FTP down a file
with stats information every time they wanted to check it out. I decided to "KISS" (keep it
simple / stupid) and wrote the following PHP script to get the job done:

```php
<?php
/* Codero Dedicated Support Team <dedicatedsupport@codero.com>
 *
 * File Name: get_server_stats.php
 * Author:    Ryan R. Uber <ryanu@codero.com>
 *
 * Provides an easy http-accessible script to display commonly needed
 * server statics information.
 * 
 * Note: Enable exec() to get Apache connection stats.
 * Run:  echo -n "PASSWORD HERE" | md5sum
 *       to generate a password
 */

# Authentication Definitions
$useAuth = false;
$authMD5 = 'Paste generated MD5SUM here';

# Perform login
if ( $useAuth === true )
{
    session_start();

    if ( $_SERVER['REQUEST_METHOD'] == "POST" )
    {
        if ( md5 ( $_POST['password'] ) == $authMD5 )
        {
            $_SESSION['loggedIn'] = 'true';
        }
    }

    # Prompt for password
    if ( ! isset ( $_SESSION['loggedIn'] ) )
    {
?>
<form action=<?=$_SERVER['PHP_SELF']?> method=POST>
<font size=5>Authentication required</font><br>
<font size=2><b><i>Password: </b></i><input type=password name=password><br>
<input type=submit value="Authenticate">
</form>
<?php
        die();
    }
}

# Initialize Variables
$hostname           = $_SERVER['HTTP_HOST'];
$unique             = array();
$www_unique_count   = 0;
$www_total_count    = 0;
$proc_count         = 0;
$display_www        = false;

# Check if 'exec()' is enabled
if ( function_exists ( 'exec' ) )
{
    $display_www = true;

    # Get HTTP connections
    @exec ( 'netstat -an | egrep \':80|:443\' | awk \'{print $5}\' | grep -v \':::\*\' |  grep -v \'0.0.0.0\'', $results );
    foreach ( $results as $result )
    {
        $array = explode ( ':', $result );
        $www_total_count ++;

        if ( preg_match ( '/^::/', $result ) )
        {
            $ipaddr = $array[3];
        }

        else
        {
            $ipaddr = $array[0];
        }

        if ( ! in_array ( $ipaddr, $unique ) )
        {
            $unique[] = $ipaddr;
            $www_unique_count ++;
        }
    }
    unset ( $results );
}

# Get Server Load
$loadavg = explode ( ' ', file_get_contents ( '/proc/loadavg' ) );
$loadavg = "{$loadavg[0]} {$loadavg[1]} {$loadavg[2]}";

# Get Disk Utilization
$disktotal = disk_total_space ( '/' );
$diskfree  = disk_free_space  ( '/' );
$diskuse   = round ( 100 - ( ( $diskfree / $disktotal ) * 100 ) ) . "%";

# Get server uptime
$uptime = floor ( preg_replace ( '/\.[0-9]+/', '', file_get_contents ( '/proc/uptime' ) ) / 86400 );

# Get kernel version
$kernel = explode ( ' ', file_get_contents ( '/proc/version' ) );
$kernel = $kernel[2];

# Get number of processes
$dh = opendir ( '/proc' );
while ( $dir = readdir ( $dh ) )
{
    if ( is_dir ( '/proc/' . $dir ) )
    {
        if ( preg_match ( '/^[0-9]+$/', $dir ) )
        {
            $proc_count ++;
        }
    }
}

# Get memory usage
foreach ( file ( '/proc/meminfo' ) as $result )
{
    $array = explode ( ':', str_replace ( ' ', '', $result ) );
    $value = preg_replace ( '/kb/i', '', $array[1] );
    if ( preg_match ( '/^MemTotal/', $result ) )
    {
        $totalmem = $value;
    }

    elseif ( preg_match ( '/^MemFree/', $result ) )
    {
        $freemem = $value;
    }

    elseif ( preg_match ( '/^Buffers/', $result ) )
    {
        $buffers = $value;
    }

    elseif ( preg_match ( '/^Cached/', $result ) )
    {
        $cached = $value;
    }

}
$freemem = ( $freemem + $buffers + $cached );
$usedmem = round ( 100 - ( ( $freemem / $totalmem ) * 100 )  ) . "%";
?>

<html>
<body>
<font size=5><b><?=$hostname?></b></font><br><br>
<?php
if ( $display_www === true )
{
?>
<font size=4><b>Web Server (80 and 443)</b></font><br>
<font size=3><b><i><?=$www_unique_count?></b></i></font><font size=2> unique connections</font><br>
<font size=3><b><i><?=$www_total_count?></b></i></font><font size=2> total connections</font><br>
<?php
}
?>
<font size=3><i><b>Kernel Version:</b> <?=$kernel?></i></font><br>
<font size=3><i><b>Uptime:</b> <?=$uptime?> days</i></font><br>
<font size=3><i><b>Load Average:</b> <?=$loadavg?></i></font><br>
<font size=3><i><b>Disk Use:</b> <?=$diskuse?></i></font><br>
<font size=3><i><b>Memory Utilization: </b><?=$usedmem?></i></font><br>
<font size=3><i><b>Total Processes: </b><?=$proc_count?></i></font><br>
</body>
</html>
```

## How do I use it?
Just place the above script anywhere in an Apache-servable directory with libphp5 loaded. I attempted
to make as much of the script "exec-free" as possible, so currently you only need to configure the
exec() function (as mentioned in the script header) if you want to be able to see the number of
connections to the Apache webserver. I'm assuming that you have this turned off on your web server,
although the PHP default .ini leaves it enabled.

## Authentication
This script has a small built in "wanna-be" authentication mechanism. If you want to require a password
for a viewer to see this valuable information, all you would need to do is set the "useAuth" variable to
"true", and paste in an md5-hash for the password. I didn't both with a user for this script.

Get the MD5 password:

```
$ echo -n 'soooooooSecure' | md5sum
```

Configure the script:

```
$useAuth = true;
$authMD5 = "[paste the md5 from the above command here]";
```

## Alternate password method
You can also use a .htaccess file or similar if you want to have multiple users and passwords. Simply
disable authentication in the script, and continue on your way with the htpasswd command.

```
$useAuth = false;
```
