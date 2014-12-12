var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var geometry = require("utils/geometry");
var panelCommon = require("ui/panels/panel-common");
var trace = require("trace");
var utils = require("utils/utils");
var OWNER = "_owner";
function getLength(measureLength, desiredLength, measureSpecMode) {
    switch (measureSpecMode) {
        case utils.ad.layout.EXACTLY:
            return measureLength;
        case utils.ad.layout.AT_MOST:
            return Math.min(measureLength, desiredLength);
        case utils.ad.layout.UNSPECIFIED:
        default:
            return desiredLength;
    }
}
exports.NativePanel = android.view.ViewGroup.extend({
    get owner() {
        return this._owner;
    },
    onMeasure: function (widthMeasureSpec, heightMeasureSpec) {
        var widthSpecMode = utils.ad.layout.getMeasureSpecMode(widthMeasureSpec);
        var widthSpecSize = utils.ad.layout.getMeasureSpecSize(widthMeasureSpec);
        var heightSpecMode = utils.ad.layout.getMeasureSpecMode(heightMeasureSpec);
        var heightSpecSize = utils.ad.layout.getMeasureSpecSize(heightMeasureSpec);
        if (widthSpecSize === 0 && widthSpecMode === utils.ad.layout.UNSPECIFIED) {
            widthSpecSize = Number.POSITIVE_INFINITY;
        }
        if (heightSpecSize === 0 && heightSpecMode === utils.ad.layout.UNSPECIFIED) {
            heightSpecSize = Number.POSITIVE_INFINITY;
        }
        var density = utils.ad.layout.getDisplayDensity();
        var measureWidth = widthSpecSize / density;
        var measureHeight = heightSpecSize / density;
        var desiredSize = this.owner.measure(new geometry.Size(measureWidth, measureHeight), true);
        var desiredWidth = getLength(widthSpecSize, Math.round(desiredSize.width * density), widthSpecMode);
        var desiredHeight = getLength(heightSpecSize, Math.round(desiredSize.height * density), heightSpecMode);
        this.setMeasuredDimension(desiredWidth, desiredHeight);
    },
    onLayout: function (changed, left, top, right, bottom) {
        var density = utils.ad.layout.getDisplayDensity();
        var arrangeRect = new geometry.Rect(left / density, top / density, (right - left) / density, (bottom - top) / density);
        this.owner.arrange(arrangeRect, true);
    }
});
var Panel = (function (_super) {
    __extends(Panel, _super);
    function Panel() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(Panel.prototype, "android", {
        get: function () {
            return this._viewGroup;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Panel.prototype, "_nativeView", {
        get: function () {
            return this._viewGroup;
        },
        enumerable: true,
        configurable: true
    });
    Panel.prototype._createUI = function () {
        this._viewGroup = new exports.NativePanel(this._context);
        this._viewGroup[OWNER] = this;
    };
    Panel.prototype._addViewToNativeVisualTree = function (child) {
        _super.prototype._addViewToNativeVisualTree.call(this, child);
        if (this._viewGroup && child._nativeView) {
            this._viewGroup.addView(child._nativeView);
            return true;
        }
        return false;
    };
    Panel.prototype._removeViewFromNativeVisualTree = function (child) {
        _super.prototype._removeViewFromNativeVisualTree.call(this, child);
        if (this._viewGroup && child._nativeView) {
            this._viewGroup.removeView(child._nativeView);
            trace.notifyEvent(child, "childInPanelRemovedFromNativeVisualTree");
        }
    };
    return Panel;
})(panelCommon.Panel);
exports.Panel = Panel;
