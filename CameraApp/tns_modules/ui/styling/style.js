var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var observable = require("ui/core/dependency-observable");
var types = require("utils/types");
var trace = require("trace");
var dependencyObservable = require("ui/core/dependency-observable");
var stylers = require("ui/styling/stylers");
var styleProperty = require("ui/styling/style-property");
var converters = require("ui/styling/converters");
var Style = (function (_super) {
    __extends(Style, _super);
    function Style(parentView) {
        _super.call(this);
        this._view = parentView;
        this._styler = stylers.getStyler(this._view);
    }
    Object.defineProperty(Style.prototype, "color", {
        get: function () {
            return this._getValue(exports.colorProperty);
        },
        set: function (value) {
            this._setValue(exports.colorProperty, value, observable.ValueSource.Local);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Style.prototype, "backgroundColor", {
        get: function () {
            return this._getValue(exports.backgroundColorProperty);
        },
        set: function (value) {
            this._setValue(exports.backgroundColorProperty, value, observable.ValueSource.Local);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Style.prototype, "fontSize", {
        get: function () {
            return this._getValue(exports.fontSizeProperty);
        },
        set: function (value) {
            this._setValue(exports.fontSizeProperty, value, observable.ValueSource.Local);
        },
        enumerable: true,
        configurable: true
    });
    Style.prototype._resetCssValues = function () {
        var that = this;
        this._eachSetProperty(function (property) {
            that._resetValue(property, observable.ValueSource.Css);
            return true;
        });
    };
    Style.prototype._onPropertyChanged = function (property, oldValue, newValue) {
        trace.write("Style._onPropertyChanged view:" + this._view + ", property: " + property.name + ", oldValue: " + oldValue + ", newValue: " + newValue, trace.categories.Style);
        _super.prototype._onPropertyChanged.call(this, property, oldValue, newValue);
        this._applyProperty(property, newValue);
    };
    Style.prototype._syncNativeProperties = function () {
        var that = this;
        styleProperty.eachProperty(function (p) {
            var value = that._getValue(p);
            if (types.isDefined(value)) {
                that._applyProperty(p, value);
            }
        });
    };
    Style.prototype._applyProperty = function (property, newValue) {
        this._styler._onPropertyChanged(property, this._view, newValue);
        if (this._view._childrenCount === 0 || !property.metadata.inheritable) {
            return;
        }
        var eachChild = function (child) {
            child.style._inheritStyleProperty(property);
            return true;
        };
        this._view._eachChildView(eachChild);
    };
    Style.prototype._inheritStyleProperty = function (property) {
        if (!property.metadata.inheritable) {
            throw new Error("An attempt was made to inherit a style property which is not marked as 'inheritable'.");
        }
        if (!this._styler.hasHandler(property)) {
            return;
        }
        var currentParent = this._view.parent;
        var valueSource;
        while (currentParent) {
            valueSource = currentParent.style._getValueSource(property);
            if (valueSource > dependencyObservable.ValueSource.Default) {
                this._setValue(property, currentParent.style._getValue(property), dependencyObservable.ValueSource.Inherited);
                break;
            }
            currentParent = currentParent.parent;
        }
    };
    Style.prototype._inheritStyleProperties = function () {
        var _this = this;
        styleProperty.eachInheritableProperty(function (p) {
            _this._inheritStyleProperty(p);
        });
    };
    return Style;
})(observable.DependencyObservable);
exports.Style = Style;
exports.colorProperty = new styleProperty.Property("color", "color", new observable.PropertyMetadata(undefined, observable.PropertyMetadataOptions.Inheritable), converters.colorConverter);
exports.backgroundColorProperty = new styleProperty.Property("backgroundColor", "background-color", new observable.PropertyMetadata(undefined), converters.colorConverter);
exports.fontSizeProperty = new styleProperty.Property("fontSize", "font-size", new observable.PropertyMetadata(undefined, observable.PropertyMetadataOptions.AffectsMeasure | observable.PropertyMetadataOptions.Inheritable), converters.fontSizeConverter);
stylers._registerDefaultStylers();
