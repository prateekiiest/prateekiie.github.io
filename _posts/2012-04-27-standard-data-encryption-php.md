---
layout: post
title: "Standards-based data encryption in PHP"
categories:
  - php
  - security
---

Let's say you are a good sysadmin, and you back up your database regularly. It contains
all kinds of configration data, some of which is sensitive (like passwords), and stored
in plain text. For most modern software, you can generate a one-way hash and just store
that rather than the clear-text data. However, there might be times when different
components or applications simply won't support any hashing comparison or other alternatives.
In these cases, you might have to pass in some clear text.

Since you are a good sysadmin, you are concerned about storing clear text. The general
concern is that any physical storage where this data lives might not be safe 100% of the
time (removable media, for instance). If someone obtains a copy of your data, you don't
want any sensitive information to be compromised without at least putting up a fight.

Many encryption methods use a "key" during encryption that acts as the secret sauce to
converting the encrypted data back into readable, usable data. It is always important
to be very cautious about where this key is stored and who/what has access to it. I've
seen a few proprietary encryption methods that use hard-coded keys, which makes any
compromise catastrophic to multiple data sets.

The following algorithm performs the task of encrypting data using 256-bit AES encryption.
It provides a mechanism for you to input a custom key on each instance, eliminating the
concern for "one key unlocks all the doors". As an example of how this can be handy, you
might provision one key for each of your individual customers. This way, customer B will
never be able to decrypt customer A's top secret documents.

One interesting/debatable topic is whether or not 2-way encryption algorithms are even
necessary.
[This guy](http://www.j2eegeek.com/blog/2005/08/22/are-clear-text-passwords-better-than-2-way-encrypted-passwords)
has an interesting blog post with his stance, and I tend to agree with him on most of it.

A debatable item in my implementation is the assemble() and disassemble() methods. A
knowledgeable colleague of mine suggested that it is not necessary to do my own padding /
prefixing length etc. In PHP's openssl_encrypt() and openssl_decrypt() functions, it
appears that this padding and its removal is handled for you if you simply pass in a
string of arbitrary length. I didn't want to get rid of the code just yet, but opinions
(especially excerpts from RFC's) are always appreciated. I'd be interested to know if
perhaps the data passed to openssl_encrypt is already of correct size, it is left alone,
or if the padding method will still pad an extra 16 bytes for AES-256. Maybe a follow-up
post will come some future day.

```php
<?php
/**
 * StandardDataEncryption - At least it's better than clear text.
 *
 * PHP Version 5.3+
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * @category   Encryption
 * @package    StandardDataEncryption
 * @author     Ryan Uber <ryan@blankbmx.com>
 * @copyright  2012 Ryan Uber <ryan@blankbmx.com>
 * @link       http://www.ryanuber.com/standard-data-encryption-in-php.html
 */
 
/**
 * Provides a standards-base encryption algorithm for safe storage of
 * sensitive data. This algorithm is not designed to provide over-the-
 * wire security, but rather protecting data saved to non-volatile
 * memory and stored some place where the decryption algorithm (or at
 * least the cipher password) is not present.
 *
 * This algorithm is mostly useful when you want/need to have access
 * to clear-text data (maybe you have to store a clear-text password
 * for use in a script somewhere), but dont want to / can't store
 * without encryption.
 *
 * This algorithm implements the following features:
 *  - Data padding to nearest cipher block size
 *  - Randomly generated initialization vectors
 *  - Settable cipher password
 *  - Hexadecimal data returned for easy storage
 *  - Configurable cipher method
 */
class StandardDataEncryption
{
    /**
     * Name of encryption cipher
     *
     * @const string $cipher_name
     */
    const CIPHER_NAME = 'AES-256-CBC';
 
    /**
     * Block size of cipher (in bytes)
     *
     * @const integer $cipher_blocksize
     */
    const CIPHER_BLOCKSIZE = 16;
 
    /**
     * Cipher password
     *
     * @var string $cipher_password
     */
    private static $cipher_password = null;
 
    /**
     * Cipher Initialization Vector
     *
     * @var integer cipher_iv
     */
    private static $cipher_iv = null;
 
    /**
     * Debugging mode (enabled=TRUE, disabled=FALSE)
     *
     * @var bool $debug
     */
    private static $debug = FALSE;
 
    /**
     * Simple constructor to make it possible to encrypt / decrypt string
     * data without making explicit calls to set the password and
     * initialization vector.
     *
     * @param string $cipher_password  The cipher password
     * @param string $cipher_iv  The cipher initialization vector
     * @returns bool
     */
    public function __construct( $cipher_password=null )
    {
        if(!is_null($cipher_password))
        {
            self::set_cipher_password($cipher_password);
        }
    }
 
    /**
     * Method to enable debug messages. Encryption is generally difficult to
     * troubleshoot if you can't see what is going on behind the scenes, but
     * it is equally annoying to receive debug messages when you don't want
     * them. This allows us to set debug mode on an instance of this class.
     * Non-printable characters will show up as a star (*).
     *
     * @param string $Message  The message to output to the debug channel
     * @returns bool
     */
    private static function debug( $Message )
    {
        if(self::$debug)
        {
            $out='';
            foreach(str_split($Message) as $c)
            {
                $out .= ctype_print($c)?$c:'*';
            }
            print "\n*** DEBUG ***\n[".time()."] ".$out."\n";
        }
    }
 
    /**
     * Prepare data to be encrypted. This manipulates the data and pads
     * it up to the next full block-size with zeros. It will prepend the
     * length of the actual string data before returning.
     *
     * @param string $Data  Arbitrary string data to encrypt
     * @returns string
     */
    private static function assemble( $Data )
    {
        $padlen = self::CIPHER_BLOCKSIZE - (strlen($Data) % self::CIPHER_BLOCKSIZE);
        $result = str_pad($padlen, self::CIPHER_BLOCKSIZE, 0, STR_PAD_LEFT) . $Data . self::pad($padlen);
        self::debug('Assembled '.mb_strlen($result).'-byte string for encryption: '.$result);
        return $result;
    }
 
    /**
     * After decrypting data, we are left with a string in "prepared"
     * state, basically the return of the assemble() method. We need to convert
     * this into a usable text value and chop the padding off.
     *
     * @param string $Data  Prepared string from original assemble() method
     * @returns string
     */
    private static function disassemble( $Data )
    {
        self::debug('Assembled '.mb_strlen($Data).'-byte string found in decrypted data: '.$Data);
        $padlen = abs((int)substr($Data, 0, self::CIPHER_BLOCKSIZE));
        $result = substr($Data, self::CIPHER_BLOCKSIZE, (strlen($Data)-self::CIPHER_BLOCKSIZE-$padlen));
        return $result;
    }
 
    /**
     * Convert hex data into an ASCII string. In PHP >= 5.4.0, this method
     * could be replaced by hex2bin(), but alas in 5.3.x, it is absent.
     *
     * @param string $Data  Hexadecimal data
     * @returns string
     */
    private static function fromhex( $Data )
    {
        self::debug('Decoding from hexadecimal value: '.$Data );
        $result = '';
        for($i=0; $i<strlen($Data)-1; $i+=2 )
        {
            $result .= chr(hexdec($Data[$i].$Data[$i+1]));
        }
        return $result;
    }
 
    /**
     * Convert an ASCII string to hexadecimal format.
     *
     * @param string $Data  ASCII string to convert
     * @returns string
     */
    private static function tohex( $Data )
    {
        return bin2hex($Data);
    }
 
    /**
     * Set the initialization vector
     *
     * @param string $IV  The initialization vector
     * @returns bool
     */
    private static function set_cipher_iv( $IV=null )
    {
        if(is_null($IV))
        {
            self::debug('Null initialization vector passed - Auto-generating');
            $IV = openssl_random_pseudo_bytes(self::CIPHER_BLOCKSIZE);
        }
        self::$cipher_iv = $IV;
    }
 
    /**
     * Generates fixed-length padding with repeating values, implemented per
     * RFC 2315 Section 10.2. Characters will likely be non-printable and will
     * not be displayed in debugging output.
     *
     * @param integer $len  The length of padding to return
     * @returns string
     */
    private static function pad( $len=0 )
    {
        return str_repeat(chr('0x'.str_pad($len, strlen(self::CIPHER_BLOCKSIZE), 0, STR_PAD_LEFT)), $len);
    }
 
    /**
     * Set the secret cipher password for use in encryption
     *
     * @param string $Password  The cipher password
     * @returns bool
     */
    public function set_cipher_password( $Password )
    {
        self::$cipher_password = $Password;
    }
 
    /**
     * Set debugging mode. Valid states are TRUE of FALSE (enabled or disabled).
     * While debugging mode is set, you will see extra messages that could be
     */
    public function set_debug( $State=FALSE )
    {
        self::$debug = $State;
    }
 
    /**
     * Using OpenSSL and the supplied parameters, prepare the arbitrary
     * string and encrypt it, returning a value suitable for safe storage.
     * During encryption, the initialization vector is randomly generated
     * so that two encryptions of the same data do not yield the same hash.
     *
     * @param string $Data  Prepared string data as returned by assemble()
     * @returns mixed
     */
    public function encrypt( $Data )
    {
        self::set_cipher_iv();
        $encrypted = self::tohex(self::$cipher_iv . openssl_encrypt(
            self::assemble( $Data ), self::CIPHER_NAME, self::$cipher_password,
            TRUE, self::$cipher_iv
        ));
        if(!$encrypted)
        {
            self::debug('Failed while encrypting data: '.$Data);
            return false;
        }
        return $encrypted;
    }
 
    /**
     * Decrypt a string and convert the result from its prepared state to a
     * readable, usable string.
     *
     * @param string $Data  Encrypted data
     * @returns mixed
     */
    public function decrypt( $Data )
    {
        $raw = self::fromhex($Data);
        if((($raw?strlen($raw):1) % self::CIPHER_BLOCKSIZE) != 0)
        {
            self::debug('Provided hexadecimal data was invalid.');
            return false;
        }
        self::set_cipher_iv(mb_strcut($raw, 0, self::CIPHER_BLOCKSIZE));
        $decrypted = self::disassemble(openssl_decrypt(
            mb_strcut($raw, self::CIPHER_BLOCKSIZE), self::CIPHER_NAME,
            self::$cipher_password, TRUE, self::$cipher_iv
        ));
        if(!$decrypted)
        {
            self::debug('Failed while decrypting data: '.$Data);
            return false;
        }
        return $decrypted;
    }
}
 
/* EOF */
?>
```

Some example usage is below:

```php
<?php
include 'StandardDataEncryption.php';
$e = new StandardDataEncryption('My Encryption Key Here');
$e->set_debug(TRUE);
$encrypted = $e->encrypt('Hack Me!');
print "\nEncrypted value is: ".$encrypted."\n";
$decrypted = $e->decrypt($encrypted);
print "\nDecrypted value is: ".$decrypted."\n";
?>
```

And it will yield some output like:

```
*** DEBUG ***
[1335560630] Null initialization vector passed - Auto-generating

*** DEBUG ***
[1335560630] Assembled 32-byte string for encryption: 0000000000000008Hack Me!********

Encrypted value is: ce5b31f1144c93094ffbb805e5d053b04fd9f27821b7f91475ef47688c7495df02681e498933dee6d997ade66506c363b71682277738f1983899935b0c604aa6

*** DEBUG ***
[1335560630] Decoding from hexadecimal value: ce5b31f1144c93094ffbb805e5d053b04fd9f27821b7f91475ef47688c7495df02681e498933dee6d997ade66506c363b71682277738f1983899935b0c604aa6

*** DEBUG ***
[1335560630] Assembled 32-byte string found in decrypted data: 0000000000000008Hack Me!********

Decrypted value is: Hack Me!
```
