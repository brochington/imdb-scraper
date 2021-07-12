### Get all Episode URLS

```javascript
// on an episodes page, i.e. https://pro.imdb.com/title/tt10436228/episodes
new Set([...document.querySelectorAll('.episode_row a')].map(el => el.href));
```