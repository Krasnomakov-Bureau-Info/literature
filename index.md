---
layout: default
title: Home
---
<header>
  <h1><a href="{{ "/" | relative_url }}">{{ site.title }}</a></h1>
  <div class="header-container">
    <img src="{{ "/assets/klaproos.jpg" | relative_url }}" alt="Klaproos" class="header-image">
    <div class="description">
      {{ site.description | newline_to_br }}
    </div>
  </div>
</header>
<main>
  <h1>My Writings</h1>

  <ul>
    {% assign posts_by_id = site.posts | group_by: "post_id" %}
    {% for post_group in posts_by_id %}
      {% assign first_post = post_group.items | first %}
      <li>
        <a href="{{ first_post.url | relative_url }}" target="_blank" rel="noopener noreferrer">
          {{ first_post.title }}
        </a>
        ({% for post in post_group.items %}
          <a href="{{ post.url | relative_url }}" target="_blank" rel="noopener noreferrer">{{ post.lang | upcase }}</a>{% unless forloop.last %}, {% endunless %}
        {% endfor %})
      </li>
    {% endfor %}
  </ul>
</main> 