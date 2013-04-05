---
layout: post
title: "Primitive contact import script for AtMail"
categories:
  - bash
  - mail
  - web
  - sql
---

```bash
#!/bin/bash
# AtMail Contact Import Script (Primitive)
# This will only import e-mail address, first name, and last name for each contact.
# It's an email contact directory, not an iPhone.
# FILE should be set to the path to a CSV with the following format:
# AtMailUserEmail,ContactFirstName,ContactLastName,ContactEmail

# Set configuration
FILE='./contacts.csv'
SQL_USER='user_name_here'
SQL_PASS='password_here'
SQL_DB='database_name_here'

# Run the loop
cat ${FILE} | awk -F, '{print $1 " " $2 " " $3 " " $4}' | while read USER FIRST LAST EMAIL; do
    CHAR="$(echo ${EMAIL:0:1} | tr '[[:upper:]]' '[[:lower:]]'
    mysql -u${SQL_USER} -p${SQL_PASS} ${SQL_DB} -Ne \
        "INSERT INTO Abook_${CHAR}
            (
                `Account`,
                `UserEmail`,
                `UserFirstName`,
                `UserLastName`
            )
        VALUES
            (
                '${USER}',
                '${EMAIL}',
                '${FIRST}',
                '${LAST}'
            )
        ;"
    echo "Imported for ${USER}: \"${FIRST} ${LAST}\" <${EMAIL}>"
done

# EOF
```
