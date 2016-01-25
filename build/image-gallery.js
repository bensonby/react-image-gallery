'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactSwipeable = require('react-swipeable');

var _reactSwipeable2 = _interopRequireDefault(_reactSwipeable);

var ImageGallery = _react2['default'].createClass({

  displayName: 'ImageGallery',

  propTypes: {
    items: _react2['default'].PropTypes.array.isRequired,
    showThumbnails: _react2['default'].PropTypes.bool,
    showBullets: _react2['default'].PropTypes.bool,
    showNav: _react2['default'].PropTypes.bool,
    showIndex: _react2['default'].PropTypes.bool,
    indexSeparator: _react2['default'].PropTypes.string,
    autoPlay: _react2['default'].PropTypes.bool,
    lazyLoad: _react2['default'].PropTypes.bool,
    slideInterval: _react2['default'].PropTypes.number,
    onSlide: _react2['default'].PropTypes.func,
    onClick: _react2['default'].PropTypes.func,
    onMouseOver: _react2['default'].PropTypes.func,
    onMouseOut: _react2['default'].PropTypes.func,
    startIndex: _react2['default'].PropTypes.number,
    imageContainerWidth: _react2['default'].PropTypes.number.isRequired,
    imageContainerHeight: _react2['default'].PropTypes.number.isRequired,
    thumbnailContainerWidth: _react2['default'].PropTypes.number,
    thumbnailContainerHeight: _react2['default'].PropTypes.number,
    staticComponent: _react2['default'].PropTypes.node,
    showThumbnailsNav: _react2['default'].PropTypes.bool,
    marginForThumbnailsNav: _react2['default'].PropTypes.number,
    marginBetweenThumbnails: _react2['default'].PropTypes.number
  },

  getDefaultProps: function getDefaultProps() {
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
      showThumbnailsNav: true,
      marginForThumbnailsNav: 40,
      marginBetweenThumbnails: 10
    };
  },

  getInitialState: function getInitialState() {
    return {
      currentSlideIndex: this.props.startIndex,
      currentThumbnailIndex: this.props.startIndex,
      thumbnailsTranslateX: 0,
      containerWidth: 0
    };
  },

  needThumbnailNav: function needThumbnailNav() {
    var totalThumbnailWidth = this.props.items.length * this.props.thumbnailContainerWidth;
    var totalMarginWidth = (this.props.items.length - 1) * this.props.marginBetweenThumbnails;
    if (totalThumbnailWidth + totalMarginWidth <= this.props.imageContainerWidth) {
      return false;
    }
    return this.props.showThumbnailsNav;
  },

  componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
    if (prevState.containerWidth !== this.state.containerWidth || prevProps.showThumbnails !== this.props.showThumbnails) {

      // adjust thumbnail container when window width is adjusted
      // when the container resizes, thumbnailsTranslateX
      // should always be negative (moving right),
      // if container fits all thumbnails its set to 0

      this._setThumbnailsTranslateX(-this._getScrollX(this.state.currentThumbnailIndex > 0 ? 1 : 0) * this.state.currentThumbnailIndex);
    }

    if (prevState.currentSlideIndex !== this.state.currentSlideIndex) {

      // call back function if provided
      if (this.props.onSlide) {
        this.props.onSlide(this.state.currentSlideIndex);
      }
    }

    if (prevState.currentThumbnailIndex !== this.state.currentThumbnailIndex) {

      // calculates thumbnail container position
      if (this.state.currentThumbnailIndex === 0 || !this.needThumbnailNav()) {
        this._setThumbnailsTranslateX(0);
      } else {
        var indexDifference = Math.abs(prevState.currentThumbnailIndex - this.state.currentThumbnailIndex);
        var _scrollX = this._getScrollX(indexDifference);
        if (_scrollX > 0) {
          if (prevState.currentThumbnailIndex < this.state.currentThumbnailIndex) {
            this._setThumbnailsTranslateX(this.state.thumbnailsTranslateX - _scrollX);
          } else if (prevState.currentThumbnailIndex > this.state.currentThumbnailIndex) {
            this._setThumbnailsTranslateX(this.state.thumbnailsTranslateX + _scrollX);
          }
        }
      }
    }
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    if (nextProps.items.length) {
      var startIndex = nextProps.startIndex || 0;
      this.setState({
        currentSlideIndex: startIndex,
        currentThumbnailIndex: startIndex
      });
    }
  },

  componentDidMount: function componentDidMount() {
    this._handleResize();
    if (this.props.autoPlay) {
      this.play();
    }
    window.addEventListener('resize', this._handleResize);
  },

  componentWillUnmount: function componentWillUnmount() {
    window.removeEventListener('resize', this._handleResize);
    if (this._intervalId) {
      window.clearInterval(this._intervalId);
      this._intervalId = null;
    }
  },

  slideToIndex: function slideToIndex(index, event) {
    var slideCount = this.props.items.length - 1;

    if (index < 0) {
      this.setState({
        currentSlideIndex: slideCount,
        currentThumbnailIndex: slideCount
      });
    } else if (index > slideCount) {
      this.setState({
        currentSlideIndex: 0,
        currentThumbnailIndex: 0
      });
    } else {
      this.setState({
        currentSlideIndex: index,
        currentThumbnailIndex: index
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

  slideThumbnailsToIndex: function slideThumbnailsToIndex(index, event) {
    var slideCount = this.props.items.length - 1;

    if (index < 0) {
      this.setState({ currentThumbnailIndex: 0 });
    } else if (index > slideCount) {
      this.setState({ currentThumbnailIndex: slideCount });
    } else {
      this.setState({ currentThumbnailIndex: index });
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

  play: function play() {
    var _this = this;

    if (this._intervalId) {
      return;
    }
    this._intervalId = window.setInterval((function () {
      if (!_this.state.hovering) {
        _this.slideToIndex(_this.state.currentSlideIndex + 1);
      }
    }).bind(this), this.props.slideInterval);
  },

  pause: function pause() {
    if (this._intervalId) {
      window.clearInterval(this._intervalId);
      this._intervalId = null;
    }
  },

  _setThumbnailsTranslateX: function _setThumbnailsTranslateX(x) {
    this.setState({ thumbnailsTranslateX: x });
  },

  _handleResize: function _handleResize() {
    this.setState({ containerWidth: this._imageGallery.offsetWidth });
  },

  _getScrollX: function _getScrollX(indexDifference) {
    var containerWidthWithoutNav = this.state.containerWidth;
    if (this.needThumbnailNav()) {
      containerWidthWithoutNav -= this.props.marginForThumbnailsNav * 2;
    }
    if (this._thumbnails) {
      if (this._thumbnails.scrollWidth <= containerWidthWithoutNav) {
        return 0;
      }

      var totalThumbnails = this._thumbnails.children.length;

      // total scroll-x required to see the last thumbnail
      var totalScrollX = this._thumbnails.scrollWidth - containerWidthWithoutNav;

      // scroll-x required per index change
      var perIndexScrollX = totalScrollX / (totalThumbnails - 1);

      return indexDifference * perIndexScrollX;
    }
  },

  _handleMouseOver: function _handleMouseOver() {
    this.setState({ hovering: true });
  },

  _handleMouseLeave: function _handleMouseLeave() {
    this.setState({ hovering: false });
  },

  _getAlignmentClassName: function _getAlignmentClassName(index) {
    var currentSlideIndex = this.state.currentSlideIndex;
    var alignment = '';
    switch (index) {
      case currentSlideIndex - 1:
        alignment = ' left';
        break;
      case currentSlideIndex:
        alignment = ' center';
        break;
      case currentSlideIndex + 1:
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

  render: function render() {
    var _this2 = this;

    var currentSlideIndex = this.state.currentSlideIndex;
    var currentThumbnailIndex = this.state.currentThumbnailIndex;
    var thumbnailStyle = {
      MozTransform: 'translate3d(' + this.state.thumbnailsTranslateX + 'px, 0, 0)',
      WebkitTransform: 'translate3d(' + this.state.thumbnailsTranslateX + 'px, 0, 0)',
      OTransform: 'translate3d(' + this.state.thumbnailsTranslateX + 'px, 0, 0)',
      msTransform: 'translate3d(' + this.state.thumbnailsTranslateX + 'px, 0, 0)',
      transform: 'translate3d(' + this.state.thumbnailsTranslateX + 'px, 0, 0)'
    };

    var slides = [];
    var thumbnails = [];
    var bullets = [];

    this.props.items.map(function (item, index) {
      var alignment = _this2._getAlignmentClassName(index);
      var originalClass = item.originalClass ? ' ' + item.originalClass : '';
      var thumbnailClass = item.thumbnailClass ? ' ' + item.thumbnailClass : '';
      var imageContainerClass = item.imageContainerClass ? ' ' + item.imageContainerClass : '';

      var slide = _react2['default'].createElement(
        'div',
        {
          key: index,
          className: 'image-gallery-slide' + alignment + originalClass,
          onClick: _this2.props.onClick,
          onMouseOver: _this2.props.onMouseOver,
          onMouseOut: _this2.props.onMouseOut },
        _react2['default'].createElement('div', {
          className: 'image-gallery-image-container' + imageContainerClass,
          style: {
            'backgroundImage': 'url(' + item.original + ')',
            'width': _this2.props.imageContainerWidth,
            'height': _this2.props.imageContainerHeight
          } }),
        item.description
      );

      if (_this2.props.lazyLoad) {
        if (alignment) {
          slides.push(slide);
        }
      } else {
        slides.push(slide);
      }

      if (_this2.props.showThumbnails) {
        thumbnails.push(_react2['default'].createElement('div', {
          key: index,
          className: 'image-gallery-thumbnail' + (currentSlideIndex === index ? ' active' : '') + thumbnailClass,
          style: {
            'backgroundImage': 'url(' + item.thumbnail + ')',
            'width': _this2.props.thumbnailContainerWidth,
            'height': _this2.props.thumbnailContainerHeight,
            'marginLeft': _this2.props.marginBetweenThumbnails / 2,
            'marginRight': _this2.props.marginBetweenThumbnails / 2
          },

          onTouchStart: _this2.slideToIndex.bind(_this2, index),
          onClick: _this2.slideToIndex.bind(_this2, index) }));
      }

      if (_this2.props.showBullets) {
        bullets.push(_react2['default'].createElement('li', {
          key: index,
          className: 'image-gallery-bullet ' + (currentSlideIndex === index ? 'active' : ''),

          onTouchStart: _this2.slideToIndex.bind(_this2, index),
          onClick: _this2.slideToIndex.bind(_this2, index) }));
      }
    });

    var swipePrev = this.slideToIndex.bind(this, currentSlideIndex - 1);
    var swipeNext = this.slideToIndex.bind(this, currentSlideIndex + 1);

    var perIndexScrollX = this._getScrollX(1);

    var containerWidthWithoutNav = this.state.containerWidth;
    if (this.needThumbnailNav()) {
      containerWidthWithoutNav -= this.props.marginForThumbnailsNav * 2;
    }
    var numThumbnailsToScroll = Math.floor(containerWidthWithoutNav / perIndexScrollX) - 1;
    var swipeThumbnailsPrev = this.slideThumbnailsToIndex.bind(this, currentThumbnailIndex - numThumbnailsToScroll);
    var swipeThumbnailsNext = this.slideThumbnailsToIndex.bind(this, currentThumbnailIndex + numThumbnailsToScroll);
    var itemsTotal = this.props.items.length;

    return _react2['default'].createElement(
      'section',
      { ref: function (i) {
          return _this2._imageGallery = i;
        }, className: 'image-gallery' },
      _react2['default'].createElement(
        'div',
        {
          onMouseOver: this._handleMouseOver,
          onMouseLeave: this._handleMouseLeave,
          className: 'image-gallery-content' },
        itemsTotal >= 2 ? [this.props.showNav && [_react2['default'].createElement(
          'div',
          {
            className: 'image-gallery-left-nav-container',
            key: 'leftNavContainer',
            onClick: swipePrev },
          _react2['default'].createElement(
            'div',
            { className: 'image-gallery-nav-wrapper' },
            _react2['default'].createElement('a', {
              key: 'leftNav',
              className: 'image-gallery-left-nav',
              onTouchStart: swipePrev })
          )
        ), _react2['default'].createElement(
          'div',
          {
            key: 'rightNavContainer',
            className: 'image-gallery-right-nav-container',
            onClick: swipeNext },
          _react2['default'].createElement(
            'div',
            { className: 'image-gallery-nav-wrapper' },
            _react2['default'].createElement('a', {
              key: 'rightNav',
              className: 'image-gallery-right-nav',
              onTouchStart: swipeNext })
          )
        )], _react2['default'].createElement(
          _reactSwipeable2['default'],
          {
            key: 'swipeable',
            onSwipedLeft: swipeNext,
            onSwipedRight: swipePrev },
          _react2['default'].createElement(
            'div',
            { className: 'image-gallery-slides' },
            slides
          )
        )] : _react2['default'].createElement(
          'div',
          { className: 'image-gallery-slides' },
          slides
        ),
        this.props.staticComponent,
        this.props.showBullets && _react2['default'].createElement(
          'div',
          { className: 'image-gallery-bullets' },
          _react2['default'].createElement(
            'ul',
            { className: 'image-gallery-bullets-container' },
            bullets
          )
        ),
        this.props.showIndex && _react2['default'].createElement(
          'div',
          { className: 'image-gallery-index' },
          _react2['default'].createElement(
            'span',
            { className: 'image-gallery-index-current' },
            this.state.currentSlideIndex + 1
          ),
          _react2['default'].createElement(
            'span',
            { className: 'image-gallery-index-separator' },
            this.props.indexSeparator
          ),
          _react2['default'].createElement(
            'span',
            { className: 'image-gallery-index-total' },
            itemsTotal
          )
        )
      ),
      this.props.showThumbnails && _react2['default'].createElement(
        'div',
        { className: 'image-gallery-thumbnails' },
        this.needThumbnailNav() && [_react2['default'].createElement(
          'div',
          {
            className: 'image-gallery-left-nav-container',
            onClick: swipeThumbnailsPrev },
          _react2['default'].createElement(
            'div',
            { className: 'image-gallery-nav-wrapper' },
            _react2['default'].createElement('a', {
              key: 'leftNav',
              className: 'image-gallery-left-nav',
              style: {
                'visibility': this.state.currentThumbnailIndex === 0 ? 'hidden' : 'visible'
              },
              onTouchStart: swipeThumbnailsPrev })
          )
        ), _react2['default'].createElement(
          'div',
          {
            className: 'image-gallery-right-nav-container',
            onClick: swipeThumbnailsNext },
          _react2['default'].createElement(
            'div',
            { className: 'image-gallery-nav-wrapper' },
            _react2['default'].createElement('a', {
              key: 'rightNav',
              className: 'image-gallery-right-nav',
              style: {
                'visibility': this.state.currentThumbnailIndex === this.props.items.length - 1 ? 'hidden' : 'visible'
              },
              onTouchStart: swipeThumbnailsNext })
          )
        )],
        _react2['default'].createElement(
          'div',
          {
            style: this.needThumbnailNav() ? {
              marginLeft: this.props.marginForThumbnailsNav + 'px',
              marginRight: this.props.marginForThumbnailsNav + 'px'
            } : {} },
          _react2['default'].createElement(
            'div',
            { className: 'image-gallery-thumbnails-container-outer' },
            _react2['default'].createElement(
              'div',
              {
                ref: function (t) {
                  return _this2._thumbnails = t;
                },
                className: 'image-gallery-thumbnails-container-inner',
                style: thumbnailStyle },
              thumbnails
            )
          )
        )
      )
    );
  }

});

exports['default'] = ImageGallery;
module.exports = exports['default'];