const Koa = require('koa');
const app = new Koa();

const wall = require('../build/src/wall');

const template = (content) => `<!doctype html>
<html lang="en">
  <head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.3/css/bootstrap.min.css" integrity="sha384-Zug+QiDoJOrZ5t4lssLdxGhVrurbmBWopoEl+M6BdEfwnCJZtKxi1KgxUyJq13dy" crossorigin="anonymous">

    <title>Hello, world!</title>
  </head>
  <body class="text-center">

    <h2>Pay the order</h2>
    ${content}

    <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.3/js/bootstrap.min.js" integrity="sha384-a5N7Y/aK3qNeh15eJKGWxsqtnX/wWdSZSKp+81YjTmS15nvnvxKHuzaWwXHDli+4" crossorigin="anonymous"></script>
  </body>
</html>`;

app.use((ctx) => {
  return wall.open()
  .then((result) => {
    let form = `<ul class="list-inline">`;
    result.forEach((method) => {
      let params = '';
      console.log(method.name);
      if (method.params) {
        Object.keys(method.params).forEach((e) =>
          params += `<input type="hidden" name="${e}" value="${method.params[e]}">`);
      }
      let button = `<button class="btn btn-link" type="submit"><img width="128px" src="${method.icon}" alt="${method.name}"></button>`;
      form += `<li class="list-inline-item"><form class="form-inline text-center" method="post" action="${method.url}">${params}${button}</form></li>`;
    });
    form += `</ul>`;
    ctx.body = template(form);
  })
});

app.listen(3000);
