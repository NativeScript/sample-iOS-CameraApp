var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var geometry = require("utils/geometry");
var common = require("ui/core/layout-common");
var timer = require("timer");
var trace = require("trace");
require("utils/module-merge").merge(common, exports);
var LayoutInfo = (function () {
    function LayoutInfo(view) {
        this._minSize = geometry.Size.zero;
        this._size = new geometry.Size(Number.NaN, Number.NaN);
        this._maxSize = new geometry.Size(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
        this.desiredSize = geometry.Size.zero;
        this.renderSize = geometry.Size.zero;
        this._margin = new geometry.Thickness(0, 0, 0, 0);
        this._horizontalAlignment = common.HorizontalAlignment.stretch;
        this._verticalAlignment = common.VerticalAlignment.stretch;
        this.needsClipBounds = false;
        this.visualOffset = geometry.Point.zero;
        this.isLayoutSuspended = true;
        this.neverMeasured = true;
        this.measureDirty = true;
        this.neverArranged = true;
        this.arrangeDirty = true;
        this.measureInProgress = false;
        this.arrangeInProgress = false;
        this.previousAvailableSize = geometry.Size.empty;
        this.treeLevel = 0;
        this._view = view;
    }
    LayoutInfo.isMaxWidthHeightValid = function (value) {
        return !isNaN(value) && value >= 0.0;
    };
    LayoutInfo.isMinWidthHeightValid = function (value) {
        return !isNaN(value) && value >= 0.0 && isFinite(value);
    };
    LayoutInfo.isWidthHeightValid = function (value) {
        return isNaN(value) || (value >= 0.0 && isFinite(value));
    };
    Object.defineProperty(LayoutInfo.prototype, "view", {
        get: function () {
            return this._view;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LayoutInfo.prototype, "parent", {
        get: function () {
            return this.view.parent;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LayoutInfo.prototype, "width", {
        get: function () {
            return this._size.width;
        },
        set: function (value) {
            var valid = LayoutInfo.isWidthHeightValid(value);
            if (!valid) {
                throw new Error("Width must be NaN or positive number.");
            }
            var size = this._size;
            if (value !== size.width) {
                this.invalidateMeasure();
            }
            this.setSize(value, size.height);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LayoutInfo.prototype, "height", {
        get: function () {
            return this._size.height;
        },
        set: function (value) {
            var valid = LayoutInfo.isWidthHeightValid(value);
            if (!valid) {
                throw new Error("Height must be NaN or >= 0.");
            }
            var size = this._size;
            if (value !== size.height) {
                this.invalidateMeasure();
            }
            this.setSize(size.width, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LayoutInfo.prototype, "maxWidth", {
        get: function () {
            return this._maxSize.width;
        },
        set: function (value) {
            var valid = LayoutInfo.isMaxWidthHeightValid(value);
            if (!valid) {
                throw new Error("MaxWidth must be >= 0.");
            }
            var maxSize = this._maxSize;
            if (value !== maxSize.width) {
                this.invalidateMeasure();
            }
            this.setMaxSize(value, maxSize.height);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LayoutInfo.prototype, "maxHeight", {
        get: function () {
            return this._maxSize.height;
        },
        set: function (value) {
            var valid = LayoutInfo.isMaxWidthHeightValid(value);
            if (!valid) {
                throw new Error("MaxHeight must be >= 0.");
            }
            var maxSize = this._maxSize;
            if (value !== maxSize.height) {
                this.invalidateMeasure();
            }
            this.setMaxSize(maxSize.width, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LayoutInfo.prototype, "minHeight", {
        get: function () {
            return this._minSize.height;
        },
        set: function (value) {
            var valid = LayoutInfo.isMinWidthHeightValid(value);
            if (!valid) {
                throw new Error("MinHeight must be >= 0 and not INFINITY.");
            }
            var minSize = this._minSize;
            if (value !== minSize.height) {
                this.invalidateMeasure();
            }
            this.setMinSize(minSize.width, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LayoutInfo.prototype, "minWidth", {
        get: function () {
            return this._minSize.width;
        },
        set: function (value) {
            var valid = LayoutInfo.isMinWidthHeightValid(value);
            if (!valid) {
                throw new Error("MinWidth must be >= 0 and not INFINITY.");
            }
            var minSize = this._minSize;
            if (value !== minSize.width) {
                this.invalidateMeasure();
            }
            this.setMinSize(value, minSize.height);
        },
        enumerable: true,
        configurable: true
    });
    LayoutInfo.prototype.setMinSize = function (minWidth, minHeight) {
        this._minSize = new geometry.Size(minWidth, minHeight);
    };
    LayoutInfo.prototype.setMaxSize = function (maxWidth, maxHeight) {
        this._maxSize = new geometry.Size(maxWidth, maxHeight);
    };
    LayoutInfo.prototype.setSize = function (width, height) {
        this._size = new geometry.Size(width, height);
    };
    Object.defineProperty(LayoutInfo.prototype, "isMeasureValid", {
        get: function () {
            return !this.measureDirty;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LayoutInfo.prototype, "isArrangeValid", {
        get: function () {
            return !this.arrangeDirty;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LayoutInfo.prototype, "horizontalAlignment", {
        get: function () {
            return this._horizontalAlignment;
        },
        set: function (value) {
            if (this._horizontalAlignment !== value) {
                this._horizontalAlignment = value;
                this.invalidateArrange();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LayoutInfo.prototype, "verticalAlignment", {
        get: function () {
            return this._verticalAlignment;
        },
        set: function (value) {
            if (this._verticalAlignment !== value) {
                this._verticalAlignment = value;
                this.invalidateArrange();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LayoutInfo.prototype, "margin", {
        get: function () {
            return this._margin;
        },
        set: function (margin) {
            if (!geometry.Thickness.equals(this._margin, margin)) {
                this._margin = margin;
                this.invalidateMeasure();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LayoutInfo.prototype, "isVisible", {
        get: function () {
            if (this.nativeView) {
                return !this.nativeView.hidden;
            }
            return true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LayoutInfo.prototype, "nativeView", {
        get: function () {
            return this._view._nativeView;
        },
        enumerable: true,
        configurable: true
    });
    LayoutInfo.prototype.invalidateMeasure = function () {
        if (!this.measureDirty && !this.measureInProgress) {
            if (!this.neverMeasured) {
                var manager = LayoutManager.current;
                manager.measureQueue.add(this);
            }
            this.invalidateMeasureInternal();
        }
    };
    LayoutInfo.prototype.invalidateMeasureInternal = function () {
        this.measureDirty = true;
        var nativeView = this.nativeView;
        if (nativeView) {
            nativeView.setNeedsLayout();
        }
        var parent = this.parent;
        while (parent) {
            parent._invalidateMeasure();
            var isPanel = !!parent.children;
            if (isPanel) {
                break;
            }
            parent = parent.parent;
        }
    };
    LayoutInfo.prototype.invalidateArrange = function () {
        if (!this.arrangeDirty && !this.arrangeInProgress) {
            if (!this.neverArranged) {
                var manager = LayoutManager.current;
                manager.arrangeQueue.add(this);
            }
            this.invalidateArrangeInternal();
        }
    };
    LayoutInfo.prototype.invalidateArrangeInternal = function () {
        this.arrangeDirty = true;
        this.invalidateMeasureInternal();
    };
    LayoutInfo.prototype.measure = function (availableSize) {
        trace.write("Measure: " + this.view + " with: " + availableSize, trace.categories.Layout);
        var width = availableSize.width;
        var height = availableSize.height;
        if (isNaN(width) || isNaN(height)) {
            throw new Error("Layout NaN measure.");
        }
        var manager = LayoutManager.current;
        var measureWithSameSize = geometry.Size.equals(availableSize, this.previousAvailableSize);
        if (!this.isVisible || this.isLayoutSuspended) {
            if (this.measureRequest) {
                manager.measureQueue.remove(this);
            }
            if (!measureWithSameSize) {
                this.invalidateMeasureInternal();
                this.previousAvailableSize = new geometry.Size(availableSize.width, availableSize.height);
            }
            return;
        }
        var previousDesiredSize = this.desiredSize;
        var size = geometry.Size.zero;
        if (!this.isMeasureValid || this.neverMeasured || !measureWithSameSize) {
            this.neverMeasured = false;
            this.invalidateArrange();
            this.measureInProgress = true;
            var gotException = true;
            try {
                manager.enterMeasure();
                size = this.measureCore(availableSize);
                gotException = false;
            }
            finally {
                this.measureInProgress = false;
                this.previousAvailableSize = new geometry.Size(availableSize.width, availableSize.height);
                manager.exitMeasure();
                if (gotException && !manager.lastExceptionElement) {
                    manager.lastExceptionElement = this;
                }
            }
            width = size.width;
            height = size.height;
            if (!isFinite(width) || !isFinite(height) || isNaN(width) || isNaN(height)) {
                throw new Error("Layout Infinity/NaN returned.");
            }
            this.measureDirty = false;
            if (this.measureRequest) {
                manager.measureQueue.remove(this);
            }
            trace.write(this.view + " - DesiredSize = " + size, trace.categories.Layout);
            this.desiredSize = size;
            if (!geometry.Size.equals(previousDesiredSize, size)) {
                this.notifyDesiredSizeChanged();
            }
        }
    };
    LayoutInfo.prototype.measureCore = function (availableSize) {
        var margin = this._margin;
        var horizontalMargin = (margin) ? margin.left + margin.right : 0.0;
        var verticalMargin = (margin) ? margin.top + margin.bottom : 0.0;
        var mm = new common.MinMax(this);
        var frameworkAvailableSize = new geometry.Size(Math.max(availableSize.width - horizontalMargin, 0), Math.max(availableSize.height - verticalMargin, 0));
        frameworkAvailableSize.width = Math.max(mm.minWidth, Math.min(frameworkAvailableSize.width, mm.maxWidth));
        frameworkAvailableSize.height = Math.max(mm.minHeight, Math.min(frameworkAvailableSize.height, mm.maxHeight));
        var desiredSize = this.view._measureOverride(frameworkAvailableSize);
        desiredSize.width = Math.max(desiredSize.width, mm.minWidth);
        desiredSize.height = Math.max(desiredSize.height, mm.minHeight);
        var clipped = false;
        if (desiredSize.width > mm.maxWidth) {
            desiredSize.width = mm.maxWidth;
            clipped = true;
        }
        if (desiredSize.height > mm.maxHeight) {
            desiredSize.height = mm.maxHeight;
            clipped = true;
        }
        var desiredWidth = desiredSize.width + horizontalMargin;
        var desiredHeight = desiredSize.height + verticalMargin;
        if (desiredWidth > availableSize.width) {
            desiredWidth = availableSize.width;
            clipped = true;
        }
        if (desiredHeight > availableSize.height) {
            desiredHeight = availableSize.height;
            clipped = true;
        }
        if (clipped || desiredWidth < 0 || desiredHeight < 0) {
            this.unclippedDesiredSize = new geometry.Size(desiredSize.width, desiredSize.height);
        }
        else {
            this.unclippedDesiredSize = undefined;
        }
        desiredSize.width = Math.max(0.0, desiredWidth);
        desiredSize.height = Math.max(0.0, desiredHeight);
        return desiredSize;
    };
    LayoutInfo.prototype.notifyDesiredSizeChanged = function () {
        var parent = this.parent;
        if (parent) {
            parent._invalidateMeasure();
        }
    };
    LayoutInfo.prototype.isRenderable = function () {
        if (this.neverMeasured || this.neverArranged || !this.isVisible) {
            return false;
        }
        return this.isMeasureValid && this.isArrangeValid;
    };
    LayoutInfo.prototype.arrange = function (finalRect) {
        trace.write("Arrange: " + this.view + " with: " + finalRect, trace.categories.Layout);
        var finalSize = finalRect.size;
        if (!isFinite(finalSize.width) || !isFinite(finalSize.height) || isNaN(finalSize.width) || isNaN(finalSize.height)) {
            throw new Error("Layout Infinity/NaN in Arrange is not allowed.");
        }
        var manager = LayoutManager.current;
        if (!this.isVisible || this.isLayoutSuspended) {
            if (this.arrangeRequest) {
                manager.arrangeQueue.remove(this);
            }
            this.finalRect = new geometry.Rect(finalRect.x, finalRect.y, finalRect.width, finalRect.height);
            return;
        }
        if (this.measureDirty) {
            this.measure(this.previousAvailableSize);
        }
        else if (this.neverMeasured) {
            this.measure(finalSize);
        }
        if (this.arrangeDirty || this.neverArranged || !geometry.Rect.equals(this.finalRect, finalRect)) {
            this.neverArranged = false;
            this.arrangeInProgress = true;
            var gotException = true;
            try {
                manager.enterArrange();
                this.arrangeCore(finalRect);
                gotException = false;
            }
            finally {
                this.arrangeInProgress = false;
                manager.exitArrange();
                if (gotException && !manager.lastExceptionElement) {
                    manager.lastExceptionElement = this;
                }
            }
            this.finalRect = new geometry.Rect(finalRect.x, finalRect.y, finalRect.width, finalRect.height);
            this.arrangeDirty = false;
            if (this.arrangeRequest) {
                manager.arrangeQueue.remove(this);
            }
            if (this.isRenderable()) {
                this._view._setBounds(new geometry.Rect(this.visualOffset.x, this.visualOffset.y, this.renderSize.width, this.renderSize.height));
            }
        }
    };
    LayoutInfo.prototype.arrangeCore = function (finalRect) {
        var needsClipBounds = false;
        var arrangeSize = finalRect.size;
        var margin = this._margin;
        var marginWidth = (margin) ? margin.left + margin.right : 0;
        var marginHeight = (margin) ? margin.top + margin.bottom : 0;
        arrangeSize.width = Math.max(0.0, arrangeSize.width - marginWidth);
        arrangeSize.height = Math.max(0.0, arrangeSize.height - marginHeight);
        var unclippedDS = (this.unclippedDesiredSize) ? this.unclippedDesiredSize : new geometry.Size(Math.max(0.0, this.desiredSize.width - marginWidth), Math.max(0.0, this.desiredSize.height - marginHeight));
        if (arrangeSize.width < unclippedDS.width) {
            needsClipBounds = true;
            arrangeSize.width = unclippedDS.width;
        }
        if (arrangeSize.height < unclippedDS.height) {
            needsClipBounds = true;
            arrangeSize.height = unclippedDS.height;
        }
        if (this._horizontalAlignment !== common.HorizontalAlignment.stretch) {
            arrangeSize.width = unclippedDS.width;
        }
        if (this._verticalAlignment !== common.VerticalAlignment.stretch) {
            arrangeSize.height = unclippedDS.height;
        }
        var max = new common.MinMax(this);
        var effectiveMaxWidth = Math.max(unclippedDS.width, max.maxWidth);
        if (effectiveMaxWidth < arrangeSize.width) {
            needsClipBounds = true;
            arrangeSize.width = effectiveMaxWidth;
        }
        var effectiveMaxHeight = Math.max(unclippedDS.height, max.maxHeight);
        if (effectiveMaxHeight < arrangeSize.height) {
            needsClipBounds = true;
            arrangeSize.height = effectiveMaxHeight;
        }
        this._view._arrangeOverride(new geometry.Size(arrangeSize.width, arrangeSize.height));
        this.renderSize = arrangeSize;
        var width = Math.min(arrangeSize.width, max.maxWidth);
        var height = Math.min(arrangeSize.height, max.maxHeight);
        needsClipBounds = needsClipBounds || width < arrangeSize.width || height < arrangeSize.height;
        var finalSize = finalRect.size;
        var constrained = new geometry.Size(Math.max(0.0, finalSize.width - marginWidth), Math.max(0.0, finalSize.height - marginHeight));
        needsClipBounds = needsClipBounds || constrained.width < width || constrained.height < height;
        this.needsClipBounds = needsClipBounds;
        var offset = this.computeAlignmentOffset(constrained, new geometry.Size(width, height));
        offset.x += finalRect.x + margin.left;
        offset.y += finalRect.y + margin.top;
        this.visualOffset = offset;
    };
    LayoutInfo.prototype.computeAlignmentOffset = function (clientSize, renderSize) {
        var point = geometry.Point.zero;
        var horizontalAlignment = this._horizontalAlignment;
        if (horizontalAlignment === common.HorizontalAlignment.stretch && renderSize.width > clientSize.width) {
            horizontalAlignment = common.HorizontalAlignment.left;
        }
        var verticalAlignment = this._verticalAlignment;
        if (verticalAlignment === common.VerticalAlignment.stretch && renderSize.height > clientSize.height) {
            verticalAlignment = common.VerticalAlignment.top;
        }
        switch (horizontalAlignment) {
            case common.HorizontalAlignment.center:
            case common.HorizontalAlignment.stretch:
                point.x = (clientSize.width - renderSize.width) / 2;
                break;
            case common.HorizontalAlignment.right:
                point.x = clientSize.width - renderSize.width;
                break;
            default:
                break;
        }
        switch (verticalAlignment) {
            case common.VerticalAlignment.center:
            case common.VerticalAlignment.stretch:
                point.y = (clientSize.height - renderSize.height) / 2;
                break;
            case common.VerticalAlignment.bottom:
                point.y = clientSize.height - renderSize.height;
                break;
            default:
                break;
        }
        return point;
    };
    LayoutInfo.prototype.updateLayout = function () {
        var view = this._view;
        var frame = view._getBounds();
        if (frame) {
            view._setBounds(frame);
        }
        LayoutManager.current.updateLayout();
    };
    LayoutInfo.propagateResumeLayout = function (parent, layout) {
        var parentIsSuspended = parent == null ? false : parent.isLayoutSuspended;
        if (parentIsSuspended) {
            return;
        }
        var parentTreeLevel = parent == null ? 0 : parent.treeLevel;
        layout.treeLevel = parentTreeLevel + 1;
        layout.isLayoutSuspended = false;
        var requireMeasureUpdate = layout.measureDirty && !layout.neverMeasured && !layout.measureRequest;
        var requireArrangeUpdate = layout.arrangeDirty && !layout.neverArranged && !layout.arrangeRequest;
        var manager = LayoutManager.current;
        if (requireMeasureUpdate) {
            manager.measureQueue.add(layout);
        }
        if (requireArrangeUpdate) {
            manager.arrangeQueue.add(layout);
        }
        var parentLayout = layout;
        var forEachChild = function (subView) {
            var childLayout = subView._layoutInfo;
            LayoutInfo.propagateResumeLayout(parentLayout, childLayout);
            return true;
        };
        layout.view._eachChildView(forEachChild);
    };
    LayoutInfo.propagateSuspendLayout = function (layout) {
        if (layout.isLayoutSuspended) {
            return;
        }
        layout.isLayoutSuspended = true;
        layout.treeLevel = 0;
        var forEachChild = function (subView) {
            var childLayout = subView._layoutInfo;
            LayoutInfo.propagateSuspendLayout(childLayout);
            return true;
        };
        layout.view._eachChildView(forEachChild);
    };
    return LayoutInfo;
})();
exports.LayoutInfo = LayoutInfo;
var Request = (function () {
    function Request() {
    }
    return Request;
})();
exports.Request = Request;
var LayoutQueue = (function () {
    function LayoutQueue() {
        this.head = undefined;
        this.pocket = undefined;
        for (var i = 0; i < LayoutQueue.PocketCapacity; i++) {
            var request = new Request();
            request.next = this.pocket;
            this.pocket = request;
        }
        this.pocketSize = LayoutQueue.PocketCapacity;
    }
    LayoutQueue.prototype.addRequest = function (element) {
        var r = this.getNewRequest(element);
        if (r) {
            r.next = this.head;
            if (this.head) {
                this.head.prev = r;
            }
            this.head = r;
            this.setRequest(element, r);
        }
    };
    LayoutQueue.prototype.getNewRequest = function (element) {
        var request;
        if (this.pocket) {
            request = this.pocket;
            this.pocket = request.next;
            this.pocketSize--;
            request.prev = null;
            request.next = null;
        }
        else {
            var manager = LayoutManager.current;
            try {
                request = new Request();
            }
            catch (e) {
                if (!request && manager) {
                    manager.setForceLayout(element);
                }
                throw new Error("out of memory");
            }
        }
        request.target = element;
        return request;
    };
    LayoutQueue.prototype.removeRequest = function (entry) {
        if (!entry.prev) {
            this.head = entry.next;
        }
        else {
            entry.prev.next = entry.next;
        }
        if (entry.next) {
            entry.next.prev = entry.prev;
        }
        this.reuseRequest(entry);
    };
    LayoutQueue.prototype.add = function (element) {
        if (this.getRequest(element)) {
            return;
        }
        if (element.isLayoutSuspended) {
            return;
        }
        this.removeOrphans(element);
        var parent = LayoutQueue.getParentLayoutInfo(element);
        if (parent && this.canRelyOnParentRecalc(parent)) {
            return;
        }
        if (this.pocketSize > LayoutQueue.PocketReserve) {
            this.addRequest(element);
        }
        else {
            while (element) {
                var p = LayoutQueue.getParentLayoutInfo(element);
                this.invalidate(element);
                if (p && p.isVisible) {
                    this.remove(element);
                }
                else if (!this.getRequest(element)) {
                    this.removeOrphans(element);
                    this.addRequest(element);
                }
                element = p;
            }
        }
    };
    LayoutQueue.prototype.canRelyOnParentRecalc = function (parent) {
        throw new Error("Must be overloaded!");
        return false;
    };
    LayoutQueue.prototype.getRequest = function (element) {
        throw new Error("Must be overloaded!");
        return null;
    };
    LayoutQueue.prototype.setRequest = function (element, request) {
        throw new Error("Must be overloaded!");
    };
    LayoutQueue.prototype.invalidate = function (element) {
        throw new Error("Must be overloaded!");
    };
    LayoutQueue.prototype.getTopMost = function () {
        var target = null;
        var maxValue = Number.MAX_VALUE;
        for (var request = this.head; request; request = request.next) {
            var treeLevel = request.target.treeLevel;
            if (treeLevel < maxValue) {
                maxValue = treeLevel;
                target = request.target;
            }
        }
        return target;
    };
    LayoutQueue.getParentLayoutInfo = function (element) {
        var parent = element.parent;
        if (parent) {
            return parent._layoutInfo;
        }
        return null;
    };
    LayoutQueue.prototype.remove = function (element) {
        var request = this.getRequest(element);
        if (request) {
            this.removeRequest(request);
            this.setRequest(element, null);
        }
    };
    LayoutQueue.prototype.removeOrphans = function (parent) {
        var request = this.head;
        var next;
        while (request) {
            var child = request.target;
            next = request.next;
            var parentTreeLevel = parent.treeLevel;
            if (child.treeLevel === (parentTreeLevel + 1) && LayoutQueue.getParentLayoutInfo(child) === parent) {
                this.remove(child);
            }
            request = next;
        }
    };
    LayoutQueue.prototype.reuseRequest = function (request) {
        request.target = null;
        if (this.pocketSize < LayoutQueue.PocketCapacity) {
            request.next = this.pocket;
            this.pocket = request;
            this.pocketSize++;
        }
    };
    LayoutQueue.prototype.isEmpty = function () {
        return !this.head;
    };
    LayoutQueue.PocketCapacity = 99;
    LayoutQueue.PocketReserve = 8;
    return LayoutQueue;
})();
var MeasureQueue = (function (_super) {
    __extends(MeasureQueue, _super);
    function MeasureQueue() {
        _super.apply(this, arguments);
    }
    MeasureQueue.prototype.canRelyOnParentRecalc = function (parent) {
        return parent.measureDirty && !parent.measureInProgress;
    };
    MeasureQueue.prototype.getRequest = function (layout) {
        return layout.measureRequest;
    };
    MeasureQueue.prototype.invalidate = function (layout) {
        layout.invalidateMeasureInternal();
    };
    MeasureQueue.prototype.setRequest = function (layout, request) {
        layout.measureRequest = request;
    };
    return MeasureQueue;
})(LayoutQueue);
var ArrangeQueue = (function (_super) {
    __extends(ArrangeQueue, _super);
    function ArrangeQueue() {
        _super.apply(this, arguments);
    }
    ArrangeQueue.prototype.canRelyOnParentRecalc = function (parent) {
        return parent.arrangeDirty && !parent.arrangeInProgress;
    };
    ArrangeQueue.prototype.getRequest = function (layout) {
        return layout.arrangeRequest;
    };
    ArrangeQueue.prototype.invalidate = function (layout) {
        layout.invalidateArrangeInternal();
    };
    ArrangeQueue.prototype.setRequest = function (layout, request) {
        layout.arrangeRequest = request;
    };
    return ArrangeQueue;
})(LayoutQueue);
var LayoutManager = (function () {
    function LayoutManager() {
        this.arrangeOnStack = 0;
        this.measureOnStack = 0;
        this.layoutRequestPosted = false;
        this.isUpdating = false;
        this.isInUpdateLayout = false;
        this.firePostLayoutEvents = false;
        this.gotException = false;
        this.measureQueue = new MeasureQueue();
        this.arrangeQueue = new ArrangeQueue();
    }
    LayoutManager.prototype.enterArrange = function () {
        this.lastExceptionElement = null;
        this.arrangeOnStack++;
        if (this.arrangeOnStack > LayoutManager.LayoutRecursionLimit) {
            throw new Error("LayoutManager_DeepRecursion");
        }
        this.firePostLayoutEvents = true;
    };
    LayoutManager.prototype.enterMeasure = function () {
        this.lastExceptionElement = null;
        this.measureOnStack++;
        if (this.measureOnStack > LayoutManager.LayoutRecursionLimit) {
            throw new Error("LayoutManager_DeepRecursion");
        }
        this.firePostLayoutEvents = true;
    };
    LayoutManager.prototype.exitArrange = function () {
        this.arrangeOnStack--;
    };
    LayoutManager.prototype.exitMeasure = function () {
        this.measureOnStack--;
    };
    LayoutManager.prototype.getArrangeRect = function (element) {
        var arrangeRect = element.finalRect;
        if (!element.parent) {
            if (element.previousAvailableSize.width === Number.POSITIVE_INFINITY) {
                arrangeRect.width = element.desiredSize.width;
            }
            if (element.previousAvailableSize.height === Number.POSITIVE_INFINITY) {
                arrangeRect.height = element.desiredSize.height;
            }
        }
        return arrangeRect;
    };
    LayoutManager.prototype.invalidateTreeIfRecovering = function () {
        if (this.forceLayoutElement || this.gotException) {
            if (this.forceLayoutElement) {
                this.markTreeDirty(this.forceLayoutElement);
            }
            this.forceLayoutElement = null;
            this.gotException = false;
        }
    };
    LayoutManager.prototype.markTreeDirty = function (element) {
        while (true) {
            var parentLayoutInfo = LayoutQueue.getParentLayoutInfo(element);
            if (!parentLayoutInfo) {
                break;
            }
            element = parentLayoutInfo;
        }
        this.markTreeDirtyHelper(element);
        this.measureQueue.add(element);
        this.arrangeQueue.add(element);
    };
    LayoutManager.prototype.markTreeDirtyHelper = function (element) {
        if (element) {
            element.invalidateMeasureInternal();
            element.invalidateArrangeInternal();
        }
        var that = this;
        var forEachChild = function (subView) {
            var childLayout = subView._layoutInfo;
            that.markTreeDirtyHelper(childLayout);
            return true;
        };
        element.view._eachChildView(forEachChild);
    };
    LayoutManager.prototype.needsRecalc = function () {
        var _this = this;
        if (!this.layoutRequestPosted && !this.isUpdating) {
            timer.setTimeout(function () {
                _this.updateLayout();
            }, 20);
            this.layoutRequestPosted = true;
        }
    };
    LayoutManager.prototype.setForceLayout = function (element) {
        this.forceLayoutElement = element;
    };
    LayoutManager.prototype.updateLayout = function () {
        var _this = this;
        if (this.isInUpdateLayout || this.measureOnStack > 0 || this.arrangeOnStack > 0) {
            return;
        }
        var counter = 0;
        var gotException = true;
        var currentElement = null;
        try {
            this.invalidateTreeIfRecovering();
            while (this.hasDirtyness() || this.firePostLayoutEvents) {
                if (++counter > 153) {
                    timer.setTimeout(function () {
                        _this.needsRecalc();
                    }, 20);
                    currentElement = null;
                    gotException = false;
                    return;
                }
                this.isUpdating = true;
                this.isInUpdateLayout = true;
                var loopCounter = 0;
                var loopStartTime;
                var diff;
                while (true) {
                    if (++loopCounter > 153) {
                        loopCounter = 0;
                        if (!loopStartTime) {
                            loopStartTime = new NSDate();
                        }
                        else {
                            diff = loopStartTime.timeIntervalSinceNow * -1000;
                            if (diff > 2 * 153) {
                                timer.setTimeout(function () {
                                    _this.needsRecalc();
                                }, 20);
                                currentElement = null;
                                gotException = false;
                                return;
                            }
                        }
                    }
                    currentElement = this.measureQueue.getTopMost();
                    if (!currentElement) {
                        break;
                    }
                    currentElement.measure(currentElement.previousAvailableSize);
                }
                loopCounter = 0;
                loopStartTime = undefined;
                while (this.measureQueue.isEmpty()) {
                    if (++loopCounter > 153) {
                        loopCounter = 0;
                        if (!loopStartTime) {
                            loopStartTime = new NSDate();
                        }
                        else {
                            diff = loopStartTime.timeIntervalSinceNow * -1000;
                            if (diff > 2 * 153) {
                                timer.setTimeout(function () {
                                    _this.needsRecalc();
                                }, 20);
                                currentElement = null;
                                gotException = false;
                                return;
                            }
                        }
                    }
                    currentElement = this.arrangeQueue.getTopMost();
                    if (!currentElement) {
                        break;
                    }
                    var finalRect = this.getArrangeRect(currentElement);
                    currentElement.arrange(finalRect);
                }
                if (!this.measureQueue.isEmpty()) {
                    continue;
                }
                this.isInUpdateLayout = false;
                if (!this.hasDirtyness()) {
                    this.firePostLayoutEvents = false;
                }
            }
            currentElement = null;
            gotException = false;
        }
        finally {
            this.isUpdating = false;
            this.layoutRequestPosted = false;
            this.isInUpdateLayout = false;
            if (gotException) {
                this.gotException = true;
                this.forceLayoutElement = currentElement;
                timer.setTimeout(function () {
                    _this.needsRecalc();
                }, 20);
            }
        }
    };
    LayoutManager.prototype.hasDirtyness = function () {
        if (this.measureQueue.isEmpty()) {
            return !this.arrangeQueue.isEmpty();
        }
        return true;
    };
    LayoutManager.LayoutRecursionLimit = 0x100;
    LayoutManager.current = new LayoutManager();
    return LayoutManager;
})();
