---
layout: post
title: "Designing an Upgrade-friendly database schema"
categories:
  - database
  - php
---

An interesting aside from my daily grind came up recently while designing a REST API:
Designing the underlying database schema and defining how we would go about adding to
or removing "default" data from it at a later point. This posed an intriguing
problem: How do you do that without destroying custom data entered by the end user?

The technique that I decided on was a dual-table model. The schema was laid out like so
(for the purpose of this post, I've removed irrelevant tables of course):

```
properties
   |
   +-- key (varchar)
   |
   +-- value (varchar)

properties_c
   |
   +-- key (varchar)
   |
   +-- value (varchar)
```

You can see that they are both essentially the same exact table, just with a different
name. The reason for this is because I am going to be using both tables as a single
"view" of sorts.

The "properties" table will be the "default" values. This is the table we will modify
during upgrades. Its contents are essentially unimportant, and can be emptied,
re-populated, or otherwise modified with no concern of obstructing valuable user-entered
data. My database initialization script simply drops this table if it exists, and
re-creates it during every upgrade with fresh, new data.

The properties_c table is where all of the custom data goes. It is empty by default.

I have multiple tables applying this concept, so I keep their naming consistent with
the suffix "_c" for custom data tables.

This is simply the layout. Things got interesting while writing the SELECT statements.
I think that the concept of selecting one table "over" another table could be applied
for other purposes as well, so I will share what I came up with for queries.

Let's say that I have this example data:

## properties

```
key                    value
--------------         ---------------------------
welcomemsg             Welcome to our website!
dateformat             mm dd, yyyy
enablelogin            false
```

## properties_c

```
key                    value
--------------         ---------------------------
welcomemsg             Go Away
myproperty             test
```

I need to select all of this data, but always give priority to the "properties_c" table.
If a key exists in properties_c, it should override the value set in "properties". It
should not matter if the key is not present in both tables, we want to get all of the
properties every time. The result I am looking to get from my select would be:

```
key                    value
--------------         ---------------------------
welcomemsg             Go Away
dateformat             mm dd, yyyy
enablelogin            false
myproperty             test
```

The following query will give me those exact results:

```
SELECT key, value FROM properties_c UNION SELECT key, value FROM properties p WHERE NOT EXISTS (SELECT * FROM properties_c WHERE key = p.key ) ORDER BY key;
```

There are some interesting things going on in this query. 

The part that took me a while to figure out was how to compare the "key" column inside of
the sub-query. You will notice that I am defining an alias for the "properties" table,
even though it is the only table I am selecting from. I am doing this because the sub-query
will have access to to the key column by its alias, allowing me to compare the values
between the two tables. The bigger take-away from this lesson is that sub-queries can
access parent data via aliases, provided you do not re-define the same alias inside of the
sub-query.

The second thing that is noteworthy in this query is the use of the "NOT EXISTS" statement.
I am using this to check if properties_c contains a row with a key of the same name as the
properties table. If it does exist, the row from properties is ignored, otherwise, it is
selected. This is my "default value" logic, and so far it seems to be working quite well.

## The Caveat

One thing I can think of that might be undesirable in implementations other than the one I
have would be deleting records. By deleting a record from properties_c, you aren't really
deleting, you are "resetting to default" because the default value still exists in the
"properties" table. The only way I can think of solving this would be by adding a third
column to the "properties" table with a boolean value that would indicate whether or not
the value should be displayed. A more hack-ish way, but also quicker, would be to define
some constant that would indicate the value should not be selected from either table.
The down side of doing that would be that you are now limiting the possible values the
user can enter.

I'll be adding more to this post when the project is completed.
