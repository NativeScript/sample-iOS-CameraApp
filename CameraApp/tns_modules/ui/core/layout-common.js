var HorizontalAlignment;
(function (HorizontalAlignment) {
    HorizontalAlignment.left = "left";
    HorizontalAlignment.center = "center";
    HorizontalAlignment.right = "right";
    HorizontalAlignment.stretch = "stretch";
})(HorizontalAlignment = exports.HorizontalAlignment || (exports.HorizontalAlignment = {}));
var VerticalAlignment;
(function (VerticalAlignment) {
    VerticalAlignment.top = "top";
    VerticalAlignment.center = "center";
    VerticalAlignment.bottom = "bottom";
    VerticalAlignment.stretch = "stretch";
})(VerticalAlignment = exports.VerticalAlignment || (exports.VerticalAlignment = {}));
var MinMax = (function () {
    function MinMax(layoutInfo) {
        this.minHeight = layoutInfo.minHeight;
        this.maxHeight = layoutInfo.maxHeight;
        var length = layoutInfo.height;
        var current = isNaN(length) ? Number.POSITIVE_INFINITY : length;
        this.maxHeight = Math.max(Math.min(current, this.maxHeight), this.minHeight);
        current = isNaN(length) ? 0.0 : length;
        this.minHeight = Math.max(Math.min(this.maxHeight, current), this.minHeight);
        this.maxWidth = layoutInfo.maxWidth;
        this.minWidth = layoutInfo.minWidth;
        length = layoutInfo.width;
        current = isNaN(length) ? Number.POSITIVE_INFINITY : length;
        this.maxWidth = Math.max(Math.min(current, this.maxWidth), this.minWidth);
        current = isNaN(length) ? 0.0 : length;
        this.minWidth = Math.max(Math.min(this.maxWidth, current), this.minWidth);
    }
    MinMax.prototype.toString = function () {
        return "minWidth: " + this.minWidth + ", maxWidth: " + this.maxWidth + ", minHeight: " + this.minHeight + ", maxHeight: " + this.maxHeight;
    };
    return MinMax;
})();
exports.MinMax = MinMax;
