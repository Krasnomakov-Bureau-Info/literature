---
layout: home
title: Home
---
<h1>My Writings</h1>

<ul>
  {% assign posts_by_id = site.posts | group_by: "post_id" %}
  {% for post_group in posts_by_id %}
    {% assign first_post = post_group.items | first %}
    <li>
      <a href="{{ first_post.url | relative_url }}">
        {{ first_post.title }}
      </a>
      ({% for post in post_group.items %}
        <a href="{{ post.url | relative_url }}">{{ post.lang | upcase }}</a>{% unless forloop.last %}, {% endunless %}
      {% endfor %})
    </li>
  {% endfor %}
</ul> 