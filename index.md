---
layout: default
title: "Ryan Uber&rsquo;s Blog"
---

{% for post in site.posts limit: 3 %}
<div class="post">
  <div class="post_title">{{ post.title }}</div>
  <div class="post_date">{{ post.date | date: "%A, %B %d, %Y" }}</div>
  <div class="post_body">
{{ post.content }}
  </div>
  <div class="separator">&nbsp;</div>
</div>
{% endfor %}
