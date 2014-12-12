var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var view = require("ui/core/view");
var dependencyObservable = require("ui/core/dependency-observable");
var proxy = require("ui/core/proxy");
exports.textProperty = new dependencyObservable.Property("text", "Label", new proxy.PropertyMetadata("", dependencyObservable.PropertyMetadataOptions.AffectsMeasure));
exports.textWrapProperty = new dependencyObservable.Property("textWrap", "Label", new proxy.PropertyMetadata(false, dependencyObservable.PropertyMetadataOptions.AffectsMeasure));
var Label = (function (_super) {
    __extends(Label, _super);
    function Label(options) {
        _super.call(this, options);
    }
    Object.defineProperty(Label.prototype, "text", {
        get: function () {
            return this._getValue(exports.textProperty);
        },
        set: function (value) {
            this._setValue(exports.textProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Label.prototype, "textWrap", {
        get: function () {
            return this._getValue(exports.textWrapProperty);
        },
        set: function (value) {
            this._setValue(exports.textWrapProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    return Label;
})(view.View);
exports.Label = Label;
