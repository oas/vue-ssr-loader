## Why is this necessary?
TODO

## Example
```html
<client>
  <template>
    <p>Hi {{name}}!</p>
  </template>

  <style>
    /* this will be minified and injected into the template */
    p {
      color: red;
    }
  </style>

  <script>
    console.info("this will be minified and injected into the template 🎉");
  </script>
</client>

<server>
  <script>
    // this will be added to a vue instance and executed server side
    module.exports = {
      data: function () {
        return {
          name: "oas"
        }
      }
    };
  </script>
</server>
```