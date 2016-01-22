'use strict';

import React from 'react';
import Swipeable from 'react-swipeable';

const ImageGallery = React.createClass({

  displayName: 'ImageGallery',

  propTypes: {
    items: React.PropTypes.array.isRequired,
    showThumbnails: React.PropTypes.bool,
    showBullets: React.PropTypes.bool,
    showNav: React.PropTypes.bool,
    showIndex: React.PropTypes.bool,
    indexSeparator: React.PropTypes.string,
    autoPlay: React.PropTypes.bool,
    lazyLoad: React.PropTypes.bool,
    slideInterval: React.PropTypes.number,
    onSlide: React.PropTypes.func,
    onClick: React.PropTypes.func,
    startIndex: React.PropTypes.number,
    imageContainerWidth: React.PropTypes.number.isRequired,
    imageContainerHeight: React.PropTypes.number.isRequired,
    thumbnailContainerWidth: React.PropTypes.number,
    thumbnailContainerHeight: React.PropTypes.number,
    staticComponent: React.PropTypes.node,
  },

  getDefaultProps() {
    return {
      lazyLoad: true,
      showThumbnails: true,
      showBullets: false,
      showNav: true,
      showIndex: false,
      indexSeparator: ' / ',
      autoPlay: false,
      slideInterval: 4000,
      startIndex: 0,
      thumbnailContainerWidth: 200,
      thumbnailContainerHeight: 150,
      staticComponent: false,
    };
  },

  getInitialState() {
    return {
      currentSlideIndex: this.props.startIndex,
      currentThumbnailIndex: this.props.startIndex,
      thumbnailsTranslateX: 0,
      containerWidth: 0
    };
  },

  componentDidUpdate(prevProps, prevState) {
    if (prevState.containerWidth !== this.state.containerWidth ||
        prevProps.showThumbnails !== this.props.showThumbnails) {

      // adjust thumbnail container when window width is adjusted
      // when the container resizes, thumbnailsTranslateX
      // should always be negative (moving right),
      // if container fits all thumbnails its set to 0

      this._setThumbnailsTranslateX(
        -this._getScrollX(this.state.currentThumbnailIndex > 0 ? 1 : 0) *
        this.state.currentThumbnailIndex);

    }

    if (prevState.currentSlideIndex !== this.state.currentSlideIndex) {

      // call back function if provided
      if (this.props.onSlide) {
        this.props.onSlide(this.state.currentSlideIndex);
      }

    }

    if (prevState.currentThumbnailIndex !== this.state.currentThumbnailIndex) {

      // calculates thumbnail container position
      if (this.state.currentThumbnailIndex === 0) {
        this._setThumbnailsTranslateX(0);
      } else {
        let indexDifference = Math.abs(
          prevState.currentThumbnailIndex - this.state.currentThumbnailIndex);
        let scrollX = this._getScrollX(indexDifference);
        if (scrollX > 0) {
          if (prevState.currentThumbnailIndex < this.state.currentThumbnailIndex) {
            this._setThumbnailsTranslateX(
              this.state.thumbnailsTranslateX - scrollX);
          } else if (prevState.currentThumbnailIndex > this.state.currentThumbnailIndex) {
            this._setThumbnailsTranslateX(
              this.state.thumbnailsTranslateX + scrollX);
          }
        }
      }
    }

  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.items.length) {
      const startIndex = nextProps.startIndex || 0;
      this.setState({
        currentSlideIndex: startIndex,
        currentThumbnailIndex: startIndex,
      });
    }
  },

  componentDidMount() {
    this._handleResize();
    if (this.props.autoPlay) {
      this.play();
    }
    window.addEventListener('resize', this._handleResize);
  },

  componentWillUnmount() {
    window.removeEventListener('resize', this._handleResize);
    if (this._intervalId) {
      window.clearInterval(this._intervalId);
      this._intervalId = null;
    }
  },

  slideToIndex(index, event) {
    let slideCount = this.props.items.length - 1;

    if (index < 0) {
      this.setState({
        currentSlideIndex: slideCount,
        currentThumbnailIndex: slideCount,
      });
    } else if (index > slideCount) {
      this.setState({
        currentSlideIndex: 0,
        currentThumbnailIndex: 0,
      });
    } else {
      this.setState({
        currentSlideIndex: index,
        currentThumbnailIndex: index,
      });
    }
    if (event) {
      if (this._intervalId) {
        // user event, reset interval
        this.pause();
        this.play();
      }
      event.preventDefault();
    }
  },

  play() {
    if (this._intervalId) {
      return;
    }
    this._intervalId = window.setInterval(() => {
      if (!this.state.hovering) {
        this.slideToIndex(this.state.currentSlideIndex + 1);
      }
    }.bind(this), this.props.slideInterval);
  },

  pause() {
    if (this._intervalId) {
      window.clearInterval(this._intervalId);
      this._intervalId = null;
    }
  },

  _setThumbnailsTranslateX(x) {
    this.setState({thumbnailsTranslateX: x});
  },

  _handleResize() {
    this.setState({containerWidth: this._imageGallery.offsetWidth});
  },

  _getScrollX(indexDifference) {
    if (this._thumbnails) {
      if (this._thumbnails.scrollWidth <= this.state.containerWidth) {
        return 0;
      }

      let totalThumbnails = this._thumbnails.children.length;

      // total scroll-x required to see the last thumbnail
      let totalScrollX = this._thumbnails.scrollWidth - this.state.containerWidth;

      // scroll-x required per index change
      let perIndexScrollX = totalScrollX / (totalThumbnails - 1);

      return indexDifference * perIndexScrollX;
    }
  },

  _handleMouseOver() {
    this.setState({hovering: true});
  },

  _handleMouseLeave() {
    this.setState({hovering: false});
  },

  _getAlignmentClassName(index) {
    let currentSlideIndex = this.state.currentSlideIndex;
    let alignment = '';
    switch (index) {
      case (currentSlideIndex - 1):
        alignment = ' left';
        break;
      case (currentSlideIndex):
        alignment = ' center';
        break;
      case (currentSlideIndex + 1):
        alignment = ' right';
        break;
    }

    if (this.props.items.length >= 3) {
      if (index === 0 && currentSlideIndex === this.props.items.length - 1) {
        // set first slide as right slide if were sliding right from last slide
        alignment = ' right';
      } else if (index === this.props.items.length - 1 && currentSlideIndex === 0) {
        // set last slide as left slide if were sliding left from first slide
        alignment = ' left';
      }
    }

    return alignment;
  },

  render() {
    let currentSlideIndex = this.state.currentSlideIndex;
    let thumbnailStyle = {
      MozTransform: 'translate3d(' + this.state.thumbnailsTranslateX + 'px, 0, 0)',
      WebkitTransform: 'translate3d(' + this.state.thumbnailsTranslateX + 'px, 0, 0)',
      OTransform: 'translate3d(' + this.state.thumbnailsTranslateX + 'px, 0, 0)',
      msTransform: 'translate3d(' + this.state.thumbnailsTranslateX + 'px, 0, 0)',
      transform: 'translate3d(' + this.state.thumbnailsTranslateX + 'px, 0, 0)'
    };

    let slides = [];
    let thumbnails = [];
    let bullets = [];

    this.props.items.map((item, index) => {
      let alignment = this._getAlignmentClassName(index);
      let originalClass = item.originalClass ? ' ' + item.originalClass : '';
      let thumbnailClass = item.thumbnailClass ? ' ' + item.thumbnailClass : '';
      let imageContainerClass = item.imageContainerClass ? ' ' + item.imageContainerClass : '';

      let slide = (
        <div
          key={index}
          className={'image-gallery-slide' + alignment + originalClass}
          onClick={this.props.onClick}
          onTouchStart={this.props.onClick}>
            <div
              className={'image-gallery-image-container' + imageContainerClass}
              style={{
                'backgroundImage': 'url(' + item.original + ')',
                'width': this.props.imageContainerWidth,
                'height': this.props.imageContainerHeight,
              }} />
            {item.description}
        </div>
      );

      if (this.props.lazyLoad) {
        if (alignment) {
          slides.push(slide);
        }
      } else {
        slides.push(slide);
      }

      if (this.props.showThumbnails) {
        thumbnails.push(
          <div
            key={index}
            className={
              'image-gallery-thumbnail' +
              (currentSlideIndex === index ? ' active' : '') +
              thumbnailClass
            }
            style={{
              'backgroundImage': 'url(' + item.thumbnail + ')',
              'width': this.props.thumbnailContainerWidth,
              'height': this.props.thumbnailContainerHeight,
            }}

            onTouchStart={this.slideToIndex.bind(this, index)}
            onClick={this.slideToIndex.bind(this, index)} />
        );
      }

      if (this.props.showBullets) {
        bullets.push(
          <li
            key={index}
            className={
              'image-gallery-bullet ' + (
                currentSlideIndex === index ? 'active' : '')}

            onTouchStart={this.slideToIndex.bind(this, index)}
            onClick={this.slideToIndex.bind(this, index)}>
          </li>
        );
      }
    });

    let swipePrev = this.slideToIndex.bind(this, currentSlideIndex - 1);
    let swipeNext = this.slideToIndex.bind(this, currentSlideIndex + 1);
    let itemsTotal = this.props.items.length;

    return (
      <section ref={(i) => this._imageGallery = i} className='image-gallery'>
        <div
          onMouseOver={this._handleMouseOver}
          onMouseLeave={this._handleMouseLeave}
          className='image-gallery-content'>
          {
            itemsTotal >= 2 ?
              [
                this.props.showNav &&
                  [
                    <a
                      key='leftNav'
                      className='image-gallery-left-nav'
                      onTouchStart={swipePrev}
                      onClick={swipePrev}/>,
                    <a
                      key='rightNav'
                      className='image-gallery-right-nav'
                      onTouchStart={swipeNext}
                      onClick={swipeNext}/>
                  ],
                <Swipeable
                  key='swipeable'
                  onSwipedLeft={swipeNext}
                  onSwipedRight={swipePrev}>
                  <div className='image-gallery-slides'>
                    {slides}
                  </div>
                </Swipeable>
              ]
            :
              <div className='image-gallery-slides'>
                {slides}
              </div>
          }
          {this.props.staticComponent}
          {
            this.props.showBullets &&
              <div className='image-gallery-bullets'>
                <ul className='image-gallery-bullets-container'>
                  {bullets}
                </ul>
              </div>
          }
          {
            this.props.showIndex &&
              <div className='image-gallery-index'>
                <span className='image-gallery-index-current'>
                  {this.state.currentSlideIndex + 1}
                </span>
                <span className='image-gallery-index-separator'>
                  {this.props.indexSeparator}
                </span>
                <span className='image-gallery-index-total'>
                  {itemsTotal}
                </span>
              </div>
          }
        </div>

        {
          this.props.showThumbnails &&
            <div className='image-gallery-thumbnails'>
              <div
                ref={(t) => this._thumbnails = t}
                className='image-gallery-thumbnails-container'
                style={thumbnailStyle}>
                {thumbnails}
              </div>
            </div>
        }
      </section>
    );

  }

});

export default ImageGallery;
