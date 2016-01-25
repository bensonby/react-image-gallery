# react-image-gallery

Responsive image gallery, slideshow, carousel

## Install

```sh
npm install react-image-gallery
```

## Demo & Examples

Live demo: [`linxtion.com/demo/react-image-gallery`](http://linxtion.com/demo/react-image-gallery)

To build the example locally, run:

```
npm install
```
```
gulp dev
```

You might need to run the following command if you do not have gulp installed globally.

```
npm install --global gulp
```

Then open [`localhost:8001`](http://localhost:8001) in a browser.


## Use

### SASS

```
@import "../node_modules/react-image-gallery/src/ImageGallery";
```

### CSS

```
<link rel="stylesheet" href="/image-gallery.css"/>
```

### JS

```js
var ImageGallery = require('react-image-gallery');

var images = [
  {
    original: 'http://lorempixel.com/1000/600/nature/1/',
    thumbnail: 'http://lorempixel.com/250/150/nature/1/',
    originalClass: 'featured-slide',
    thumbnailClass: 'featured-thumb',
    imageContainerClass: 'image-container',
    description: 'Optional description...'
  },
  {
    original: 'http://lorempixel.com/1000/600/nature/2/',
    thumbnail: 'http://lorempixel.com/250/150/nature/2/'
  },
  {
    original: 'http://lorempixel.com/1000/600/nature/3/',
    thumbnail: 'http://lorempixel.com/250/150/nature/3/'
  }
];

handleSlide: function(index) {
  console.log('Slid to ' + index);
},

render: function() {
  return (
    <ImageGallery
      items={images}
      autoPlay={true}
      slideInterval={4000}
      onSlide={this.handleSlide}/>
  );
}

```

# Props

* `items`: (required) Array of images,
* `lazyLoad`: Boolean, default `true`
* `showThumbnails`: Boolean, default `true`
* `showNav`: Boolean, default `true`
* `showBullets`: Boolean, default `false`
* `showIndex`: Boolean, default `false`
* `indexSeparator`: String, default `' / '`, ignored if `showIndex` is false
* `autoPlay`: Boolean, default `false`
* `slideInterval`: Integer, default `4000`
* `startIndex`: Integer, default `0`
* `onSlide`: Function, `callback(index)`
* `onClick`: Function, `callback(event)`
* `onMouseOver`: Function, `callback(event)`
* `onMouseOut`: Function, `callback(event)`
* `staticComponent`: node, rendered on the gallery but not on slide
* `showThumbnailsNav`: Boolean, default `true`
* `marginForThumbnailsNav`: Number in pixel, default 40, space for rendering thumbnails nav
* `marginBetweenThumbnails`: Number in pixel, default 10, meaning 5px on each side


# functions

* `play()`: continuous plays if image is not hovered.
* `pause()`: pauses the slides.
* `slideToIndex(index)`: slide to a specific index.

# Notes

* Feel free to contribute and or provide feedback!
* If you encounter problem with node-sass, run the followings:

```
npm uninstall --save-dev gulp-sass
npm install --save-dev gulp-sass@2
```

# License

MIT
