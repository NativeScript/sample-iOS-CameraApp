var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var view = require("ui/core/view");
var dependencyObservable = require("ui/core/dependency-observable");
var proxy = require("ui/core/proxy");
exports.textProperty = new dependencyObservable.Property("text", "TextBase", new proxy.PropertyMetadata("", dependencyObservable.PropertyMetadataOptions.None));
exports.textProperty.metadata.onSetNativeValue = function onTextPropertyChanged(data) {
    var textBase = data.object;
    textBase._onTextPropertyChanged(data);
};
var TextBase = (function (_super) {
    __extends(TextBase, _super);
    function TextBase() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(TextBase.prototype, "text", {
        get: function () {
            return this._getValue(exports.textProperty);
        },
        set: function (value) {
            this._setValue(exports.textProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    TextBase.prototype._onTextPropertyChanged = function (data) {
    };
    return TextBase;
})(view.View);
exports.TextBase = TextBase;
