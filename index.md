---
layout: home
title: Home
---
<h1>My Writings</h1>

<h2>Miniatures</h2>
<ul>
  {% assign posts_by_id = site.posts | group_by: "post_id" %}
  {% for post_group in posts_by_id %}
    {% assign en_post = post_group.items | where: "lang", "en" | first %}
    {% assign first_post = en_post %}
    {% if first_post == nil %}
      {% assign first_post = post_group.items | first %}
    {% endif %}
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

<h2>Books</h2>
<ul>
  <li>
    <a href="{{ "/books/" | relative_url }}">The Devilism Essence</a>
  </li>
  <li>
    <a href="{{ "/books/ringen_van_patronage/" | relative_url }}">Ringen van Patronage</a>
  </li>
</ul>