var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var viewCommon = require("ui/core/view-common");
var geometry = require("utils/geometry");
var trace = require("trace");
var types = require("utils/types");
var utils = require("utils/utils");
require("utils/module-merge").merge(viewCommon, exports);
var ANDROID = "_android";
var NATIVE_VIEW = "_nativeView";
var VIEW_GROUP = "_viewGroup";
function onIsVisiblePropertyChanged(data) {
    var view = data.object;
    if (!view[NATIVE_VIEW]) {
        return;
    }
    view[NATIVE_VIEW].setVisibility(data.newValue ? android.view.View.VISIBLE : android.view.View.GONE);
}
viewCommon.isVisibleProperty.metadata.onSetNativeValue = onIsVisiblePropertyChanged;
var View = (function (_super) {
    __extends(View, _super);
    function View() {
        _super.apply(this, arguments);
    }
    View.prototype._addViewCore = function (view) {
        if (this._context) {
            view._onAttached(this._context);
        }
        _super.prototype._addViewCore.call(this, view);
    };
    View.prototype._removeViewCore = function (view) {
        _super.prototype._removeViewCore.call(this, view);
        view._onDetached();
    };
    View.prototype._onAttached = function (context) {
        if (!context) {
            throw new Error("Expected valid android.content.Context instance.");
        }
        trace.write("calling _onAttached on view " + this._domId, trace.categories.VisualTreeEvents);
        if (this._context === context) {
            return;
        }
        if (this._context) {
            if (this._nativeView && this._attachStateChangeListener) {
                this._nativeView.removeOnAttachStateChangeListener(this._attachStateChangeListener);
            }
            this._onDetached();
        }
        this._context = context;
        this._onContextChanged();
        trace.notifyEvent(this, "_onAttached");
        if (this._childrenCount > 0) {
            var that = this;
            var eachChild = function (child) {
                child._onAttached(context);
                if (!child._isAddedToNativeVisualTree) {
                    child._isAddedToNativeVisualTree = that._addViewToNativeVisualTree(child);
                }
                return true;
            };
            this._eachChildView(eachChild);
        }
    };
    View.prototype._onDetached = function (force) {
        if (this._childrenCount > 0) {
            var that = this;
            var eachChild = function (child) {
                if (child._isAddedToNativeVisualTree) {
                    that._removeViewFromNativeVisualTree(child);
                }
                child._onDetached(force);
                return true;
            };
            this._eachChildView(eachChild);
        }
        trace.write("calling _onDetached on view " + this._domId, trace.categories.VisualTreeEvents);
        this._clearAndroidReference();
        this._context = undefined;
        trace.notifyEvent(this, "_onDetached");
    };
    View.prototype._clearAndroidReference = function () {
        if (this[NATIVE_VIEW] === this[ANDROID]) {
            this[NATIVE_VIEW] = undefined;
        }
        if (this[VIEW_GROUP] === this[ANDROID]) {
            this[VIEW_GROUP] = undefined;
        }
        this[ANDROID] = undefined;
    };
    View.prototype._onContextChanged = function () {
        trace.write("calling _onContextChanged on view " + this._domId, trace.categories.VisualTreeEvents);
        this._createUI();
        utils.copyFrom(this._options, this);
        delete this._options;
        this._syncNativeProperties();
        var that = new WeakRef(this);
        this._attachStateChangeListener = new android.view.View.OnAttachStateChangeListener({
            get owner() {
                return that.get();
            },
            onViewAttachedToWindow: function (view) {
                trace.write(this.owner + "(" + this.owner._domId + ").AttachedToWindow(" + view + ");", trace.categories.NativeLifecycle);
                var owner = this.owner;
                if (!owner) {
                    return;
                }
                owner.onLoaded();
            },
            onViewDetachedFromWindow: function (view) {
                trace.write(this.owner + "(" + this.owner._domId + ").DetachedFromWindow(" + view + ");", trace.categories.NativeLifecycle);
                var owner = this.owner;
                if (!owner) {
                    return;
                }
                if (!owner._context && owner._attachStateChangeListener) {
                    view.removeOnAttachStateChangeListener(owner._attachStateChangeListener);
                }
                owner.onUnloaded();
            }
        });
        this._nativeView.addOnAttachStateChangeListener(this._attachStateChangeListener);
        trace.notifyEvent(this, "_onContextChanged");
    };
    View.prototype._setBounds = function (rect) {
        _super.prototype._setBounds.call(this, rect);
        var view = this._nativeView;
        if (view) {
            trace.write("Setting bounds for view with id " + this._domId + "of type " + this.typeName + ": " + rect, trace.categories.Layout);
            var density = utils.ad.layout.getDisplayDensity();
            view.layout(rect.x * density, rect.y * density, (rect.x + rect.width) * density, (rect.y + rect.height) * density);
        }
    };
    View.prototype._getMeasureSpec = function (length, spec) {
        if (types.isDefined(spec)) {
            return utils.ad.layout.makeMeasureSpec(length, spec);
        }
        if (isFinite(length)) {
            return utils.ad.layout.makeMeasureSpec(length, utils.ad.layout.AT_MOST);
        }
        return utils.ad.layout.makeMeasureSpec(0, utils.ad.layout.UNSPECIFIED);
    };
    View.prototype._measureNativeView = function (availableSize, options) {
        var nativeView = this._nativeView;
        if (nativeView) {
            var density = utils.ad.layout.getDisplayDensity();
            var measureWidth = availableSize.width * density;
            var measureHeight = availableSize.height * density;
            var widthSpec = this._getMeasureSpec(measureWidth, options);
            var heightSpec = this._getMeasureSpec(measureHeight, options);
            nativeView.measure(widthSpec, heightSpec);
            var desiredWidth = Math.round(nativeView.getMeasuredWidth() / density);
            var desiredHeight = Math.round(nativeView.getMeasuredHeight() / density);
            return new geometry.Size(desiredWidth, desiredHeight);
        }
        else {
            return this._measureOverride(availableSize, options);
        }
    };
    Object.defineProperty(View.prototype, "_nativeView", {
        get: function () {
            return this.android;
        },
        enumerable: true,
        configurable: true
    });
    return View;
})(viewCommon.View);
exports.View = View;
