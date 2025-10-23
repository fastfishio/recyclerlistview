"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var react_native_1 = require("react-native");
var BaseScrollComponent_1 = require("../../../core/scrollcomponent/BaseScrollComponent");
var TSCast_1 = require("../../../utils/TSCast");
/***
 * The responsibility of a scroll component is to report its size, scroll events and provide a way to scroll to a given offset.
 * RecyclerListView works on top of this interface and doesn't care about the implementation. To support web we only had to provide
 * another component written on top of web elements
 */
var ScrollComponent = /** @class */ (function (_super) {
    __extends(ScrollComponent, _super);
    function ScrollComponent(args) {
        var _this = _super.call(this, args) || this;
        _this._scrollViewRef = null;
        _this._contentSize = { width: 0, height: 0 };
        _this._getScrollViewRef = function (scrollView) { _this._scrollViewRef = scrollView; };
        _this._onContentSizeChange = function (contentWidth, contentHeight) {
            _this._contentSize = { width: contentWidth, height: contentHeight };
        };
        _this._onScroll = function (event) {
            if (event) {
                var contentOffset = event.nativeEvent.contentOffset;
                var offsetX = contentOffset.x;
                var offsetY = contentOffset.y;
                // Handle RTL for horizontal scrolling
                if (_this.props.isHorizontal && _this._isRTL()) {
                    // In RTL, we need to invert the scroll offset
                    var contentSize = event.nativeEvent.contentSize;
                    var layoutMeasurement = event.nativeEvent.layoutMeasurement;
                    var maxScrollX = contentSize.width - layoutMeasurement.width;
                    offsetX = maxScrollX - contentOffset.x;
                }
                _this._offset = _this.props.isHorizontal ? offsetX : offsetY;
                _this.props.onScroll(offsetX, offsetY, event);
            }
        };
        _this._onLayout = function (event) {
            if (_this._height !== event.nativeEvent.layout.height || _this._width !== event.nativeEvent.layout.width) {
                _this._height = event.nativeEvent.layout.height;
                _this._width = event.nativeEvent.layout.width;
                if (_this.props.onSizeChanged) {
                    _this._isSizeChangedCalledOnce = true;
                    _this.props.onSizeChanged(event.nativeEvent.layout);
                }
            }
            if (_this.props.onLayout) {
                _this.props.onLayout(event);
            }
        };
        _this._height = (args.layoutSize && args.layoutSize.height) || 0;
        _this._width = (args.layoutSize && args.layoutSize.width) || 0;
        _this._offset = 0;
        _this._isSizeChangedCalledOnce = false;
        return _this;
    }
    ScrollComponent.prototype.scrollTo = function (x, y, isAnimated) {
        if (this._scrollViewRef) {
            var scrollX_1 = x;
            var scrollY_1 = y;
            // Handle RTL for horizontal scrolling
            if (this.props.isHorizontal && this._isRTL()) {
                // In RTL, we need to invert the scroll position
                var maxScrollX = this._contentSize.width - this._width;
                scrollX_1 = maxScrollX - x;
            }
            this._scrollViewRef.scrollTo({ x: scrollX_1, y: scrollY_1, animated: isAnimated });
        }
    };
    ScrollComponent.prototype.getScrollableNode = function () {
        if (this._scrollViewRef && this._scrollViewRef.getScrollableNode) {
            return this._scrollViewRef.getScrollableNode();
        }
        return null;
    };
    ScrollComponent.prototype.getNativeScrollRef = function () {
        return this._scrollViewRef;
    };
    ScrollComponent.prototype.render = function () {
        var Scroller = TSCast_1.default.cast(this.props.externalScrollView); //TSI
        var renderContentContainer = this.props.renderContentContainer ? this.props.renderContentContainer : this._defaultContainer;
        var contentContainerProps = {
            style: {
                height: this.props.contentHeight,
                width: this.props.contentWidth,
            },
            horizontal: this.props.isHorizontal,
            scrollOffset: this._offset,
            renderAheadOffset: this.props.renderAheadOffset,
            windowSize: (this.props.isHorizontal ? this._width : this._height) + this.props.renderAheadOffset,
        };
        //TODO:Talha
        // const {
        //     useWindowScroll,
        //     contentHeight,
        //     contentWidth,
        //     externalScrollView,
        //     canChangeSize,
        //     renderFooter,
        //     isHorizontal,
        //     scrollThrottle,
        //     ...props,
        // } = this.props;
        // Determine flex direction based on RTL and horizontal settings
        var flexDirection = this.props.isHorizontal
            ? (this._isRTL() ? "row-reverse" : "row")
            : "column";
        return (React.createElement(Scroller, __assign({ ref: this._getScrollViewRef, removeClippedSubviews: false, scrollEventThrottle: this.props.scrollThrottle }, this.props, { horizontal: this.props.isHorizontal, onScroll: this._onScroll, onContentSizeChange: this._onContentSizeChange, onLayout: (!this._isSizeChangedCalledOnce || this.props.canChangeSize) ? this._onLayout : this.props.onLayout }),
            React.createElement(react_native_1.View, { style: { flexDirection: flexDirection } },
                renderContentContainer(contentContainerProps, this.props.children),
                this.props.renderFooter ? this.props.renderFooter() : null)));
    };
    ScrollComponent.prototype._defaultContainer = function (props, children) {
        return (React.createElement(react_native_1.View, __assign({}, props), children));
    };
    ScrollComponent.prototype._isRTL = function () {
        return react_native_1.I18nManager.isRTL;
    };
    ScrollComponent.defaultProps = {
        contentHeight: 0,
        contentWidth: 0,
        externalScrollView: TSCast_1.default.cast(react_native_1.ScrollView),
        isHorizontal: false,
        scrollThrottle: 16,
    };
    return ScrollComponent;
}(BaseScrollComponent_1.default));
exports.default = ScrollComponent;
//# sourceMappingURL=ScrollComponent.js.map