---
layout: post
title: "osCommerce Password Hashing Concept"
categories:
  - php
  - security
---

I had the sincere displeasure of troubleshooting an osCommerce site this morning. The user had lost
their password, so naturally, I had to generate them a new one. I found their password hashing
function burried in the "admin/includes/functions/password_funcs.php" script:

```
  function tep_encrypt_password($plain) {
    $password = '';

    for ($i=0; $i<10; $i++) {
      $password .= tep_rand();
    }

    $salt = substr(md5($password), 0, 2);

    $password = md5($salt . $plain) . ':' . $salt;

    return $password;
  }
```

Now then, I had a quick look in the database itself, at the "admin" table:

```
mysql> select * from administrators;
+----+-----------+-------------------------------------+
| id | user_name | user_password                       |
+----+-----------+-------------------------------------+
|  1 | admin     | 60a272d8be550ff714cf6bb385531d3a:6b | 
+----+-----------+-------------------------------------+
1 row in set (0.00 sec)
```

Hmmm.... so its not a plain MD5sum. I was interested to see what they were doing beyond just MD5'ing the
password so I actually went through what the code is doing.

Firstly, we call the function and pass it a plain-text password to encrypt:

```
tep_encrypt_password($plain)
```

Then, we are defining a variable called "$password" a random 10-character string:
```
    for ($i=0; $i<10; $i++) {
      $password .= tep_rand();
    }
```

Let's just stop right there for a minute. We have two variables already: "$plain" and "$password".
The one called "plain" is actually the plain-text password, and the one called "password" is a random
string. Excellent variable naming, osCommerce.

Moving on, we then use the random string, also known as "$password", to get the "salt" for the password:

```
$salt = substr(md5($password), 0, 2);
```

Now let's stop right there. A two-character salt? Essentially, this is just md5'ing the already-random
"$password" variable, and snagging the first two characters of it.

Next, we do some flippity-floppying with variables:

```
    $password = md5($salt . $plain) . ':' . $salt;
```

The above is going to append the plain-text password to the two-character "salt" and MD5 it, the append a
colon (:) character, then append the plain-text "salt" to the end of the string. The colon will likely
be used for a preg_split or similar in a password checking function. What bugs me about the above code
though, is that now we are reassigning the variable "$password" to the actual encrypted / salted version
of the plain text password, rather than it just containing arbitrary characters as it did before.

Then we return the newly-encrypted password:

```
return $password;
```

That bugs me too, because we are not returning a password, we are returning an encrypted hash with a salt
tailing it.

This is all a bunch of nit-picking, and the code actually does what it is supposed to do, but it is a big
pet-peeve of mine because it makes the code a lot harder to follow, even due to something so small as a
variable name.

Another thought, this actually does prove helpful to security of encrypted password storage. Of course
anyone on the outside could still hit your login form 6 million times with their dictionary of commonly-used
passwords, and if one matched they would be in. However, it does help in preventing someone who has obtained
the hash from getting the actual password value from it. You wouldn't be able to run osCommerce's password
hashes through an MD5 lookup and get passwords out of it.

So in conclusion, I might be too critical on the syntax, but this password encryption function actually does
a decent job. I'd recommend doing something similar the next time you write a PHP application before just
doing `INSERT INTO users ( $user_name, MD5($password));`.
