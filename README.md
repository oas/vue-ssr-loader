## Why is this necessary?
TODO

## Example

### Modification
In order to be able to represent both the client and the server in a single file, we divide them into tags.
The `<client>` tag includes everything that will be minified and injected into the template.
The `<server>` tag will be executed on the server, the result will be passed to a vue instance.
```html
<client>
  <template>
    <p>Hi {{name}}!</p>
  </template>

  <style>
    /* This will change the appearance of our <p> tag. */
    p {
      color: red;
    }
  </style>

  <script>
    console.info("This will show up in our DevTools. 🎉");
  </script>
</client>

<server>
  <script>
    // This will be passed to a vue instance.
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