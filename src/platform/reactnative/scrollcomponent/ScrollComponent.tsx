import * as React from "react";
import {
    I18nManager,
    LayoutChangeEvent,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    View,
} from "react-native";
import BaseScrollComponent, { ScrollComponentProps } from "../../../core/scrollcomponent/BaseScrollComponent";
import TSCast from "../../../utils/TSCast";
/***
 * The responsibility of a scroll component is to report its size, scroll events and provide a way to scroll to a given offset.
 * RecyclerListView works on top of this interface and doesn't care about the implementation. To support web we only had to provide
 * another component written on top of web elements
 */

export default class ScrollComponent extends BaseScrollComponent {
    public static defaultProps = {
        contentHeight: 0,
        contentWidth: 0,
        externalScrollView: TSCast.cast(ScrollView), //TSI
        isHorizontal: false,
        scrollThrottle: 16,
    };

    private _height: number;
    private _width: number;
    private _offset: number;
    private _isSizeChangedCalledOnce: boolean;
    private _scrollViewRef: ScrollView | null = null;
    private _contentSize: { width: number; height: number } = { width: 0, height: 0 };

    constructor(args: ScrollComponentProps) {
        super(args);
        this._height = (args.layoutSize && args.layoutSize.height) || 0;
        this._width = (args.layoutSize && args.layoutSize.width) || 0;
        this._offset = 0;
        this._isSizeChangedCalledOnce = false;
    }

    public scrollTo(x: number, y: number, isAnimated: boolean): void {
        if (this._scrollViewRef) {
            let scrollX = x;
            const scrollY = y;

            // Handle RTL for horizontal scrolling
            if (this.props.isHorizontal && this._isRTL()) {
                // In RTL, we need to invert the scroll position
                const maxScrollX = this._contentSize.width - this._width;
                scrollX = maxScrollX - x;
            }

            this._scrollViewRef.scrollTo({ x: scrollX, y: scrollY, animated: isAnimated });
        }
    }

    public getScrollableNode(): number | null {
        if (this._scrollViewRef && this._scrollViewRef.getScrollableNode) {
          return this._scrollViewRef.getScrollableNode();
        }
        return null;
    }

    public getNativeScrollRef(): ScrollView | null {
        return this._scrollViewRef;
    }

    public render(): JSX.Element {
        const Scroller = TSCast.cast<ScrollView>(this.props.externalScrollView); //TSI
        const renderContentContainer = this.props.renderContentContainer ? this.props.renderContentContainer : this._defaultContainer;
        const contentContainerProps = {
            style: {
                height: this.props.contentHeight,
                width: this.props.contentWidth,
            },
            horizontal : this.props.isHorizontal,
            scrollOffset : this._offset,
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
        const flexDirection = this.props.isHorizontal
            ? (this._isRTL() ? "row-reverse" : "row")
            : "column";

        return (
            <Scroller ref={this._getScrollViewRef}
                removeClippedSubviews={false}
                scrollEventThrottle={this.props.scrollThrottle}
                {...this.props}
                horizontal={this.props.isHorizontal}
                onScroll={this._onScroll}
                onContentSizeChange={this._onContentSizeChange}
                onLayout={(!this._isSizeChangedCalledOnce || this.props.canChangeSize) ? this._onLayout : this.props.onLayout}>
                <View style={{ flexDirection }}>
                    {renderContentContainer(contentContainerProps, this.props.children)}
                    {this.props.renderFooter ? this.props.renderFooter() : null}
                </View>
            </Scroller>
        );
    }

    private _defaultContainer(props: object, children: React.ReactNode): React.ReactNode | null {
        return (
            <View {...props}>
                {children}
            </View>
        );
    }

    private _getScrollViewRef = (scrollView: any) => { this._scrollViewRef = scrollView as (ScrollView | null); };

    private _isRTL(): boolean {
        return I18nManager.isRTL;
    }

    private _onContentSizeChange = (contentWidth: number, contentHeight: number): void => {
        this._contentSize = { width: contentWidth, height: contentHeight };
    }

    private _onScroll = (event?: NativeSyntheticEvent<NativeScrollEvent>): void => {
        if (event) {
            const contentOffset = event.nativeEvent.contentOffset;
            let offsetX = contentOffset.x;
            const offsetY = contentOffset.y;

            // Handle RTL for horizontal scrolling
            if (this.props.isHorizontal && this._isRTL()) {
                // In RTL, we need to invert the scroll offset
                const contentSize = event.nativeEvent.contentSize;
                const layoutMeasurement = event.nativeEvent.layoutMeasurement;
                const maxScrollX = contentSize.width - layoutMeasurement.width;
                offsetX = maxScrollX - contentOffset.x;
            }

            this._offset = this.props.isHorizontal ? offsetX : offsetY;
            this.props.onScroll(offsetX, offsetY, event);
        }
    }

    private _onLayout = (event: LayoutChangeEvent): void => {
        if (this._height !== event.nativeEvent.layout.height || this._width !== event.nativeEvent.layout.width) {
            this._height = event.nativeEvent.layout.height;
            this._width = event.nativeEvent.layout.width;
            if (this.props.onSizeChanged) {
                this._isSizeChangedCalledOnce = true;
                this.props.onSizeChanged(event.nativeEvent.layout);
            }
        }
        if (this.props.onLayout) {
            this.props.onLayout(event);
        }
    }
}
