var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var style = require("ui/styling/style");
var stylersCommon = require("ui/styling/stylers-common");
require("utils/module-merge").merge(stylersCommon, exports);
var DefaultStyler = (function (_super) {
    __extends(DefaultStyler, _super);
    function DefaultStyler() {
        _super.call(this);
        this.setHandler(style.backgroundColorProperty, new stylersCommon.StylePropertyChangedHandler(DefaultStyler.setBackgroundProperty, DefaultStyler.resetBackgroundProperty, DefaultStyler.getNativeBackgroundValue));
    }
    DefaultStyler.setBackgroundProperty = function (view, newValue) {
        var nativeView = view._nativeView;
        if (nativeView) {
            nativeView.backgroundColor = newValue;
        }
    };
    DefaultStyler.resetBackgroundProperty = function (view, nativeValue) {
        var nativeView = view._nativeView;
        if (nativeView) {
            nativeView.backgroundColor = nativeValue;
        }
    };
    DefaultStyler.getNativeBackgroundValue = function (view) {
        var nativeView = view._nativeView;
        if (nativeView) {
            return nativeView.backgroundColor;
        }
        return undefined;
    };
    return DefaultStyler;
})(stylersCommon.Styler);
exports.DefaultStyler = DefaultStyler;
var LabelStyler = (function (_super) {
    __extends(LabelStyler, _super);
    function LabelStyler() {
        _super.call(this);
        this.setHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(LabelStyler.setColorProperty, LabelStyler.resetColorProperty, LabelStyler.getNativeColorValue));
        this.setHandler(style.fontSizeProperty, new stylersCommon.StylePropertyChangedHandler(LabelStyler.setFontSizeProperty, LabelStyler.resetFontSizeProperty, LabelStyler.getNativeFontSizeValue));
    }
    LabelStyler.setColorProperty = function (view, newValue) {
        var label = view._nativeView;
        if (label) {
            label.textColor = newValue;
        }
    };
    LabelStyler.resetColorProperty = function (view, nativeValue) {
        var label = view._nativeView;
        if (label) {
            label.textColor = nativeValue;
        }
    };
    LabelStyler.getNativeColorValue = function (view) {
        var label = view._nativeView;
        if (label) {
            return label.textColor;
        }
    };
    LabelStyler.setFontSizeProperty = function (view, newValue) {
        var label = view._nativeView;
        if (label) {
            label.font = label.font.fontWithSize(newValue);
        }
    };
    LabelStyler.resetFontSizeProperty = function (view, nativeValue) {
        var label = view._nativeView;
        if (label) {
            label.font = label.font.fontWithSize(nativeValue);
        }
    };
    LabelStyler.getNativeFontSizeValue = function (view) {
        var label = view._nativeView;
        if (label) {
            return label.font.pointSize;
        }
    };
    return LabelStyler;
})(DefaultStyler);
exports.LabelStyler = LabelStyler;
var ButtonStyler = (function (_super) {
    __extends(ButtonStyler, _super);
    function ButtonStyler() {
        _super.call(this);
        this.setHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(ButtonStyler.setColorProperty, ButtonStyler.resetColorProperty, ButtonStyler.getNativeColorValue));
        this.setHandler(style.fontSizeProperty, new stylersCommon.StylePropertyChangedHandler(ButtonStyler.setFontSizeProperty, ButtonStyler.resetFontSizeProperty, ButtonStyler.getNativeFontSizeValue));
    }
    ButtonStyler.setColorProperty = function (view, newValue) {
        var btn = view._nativeView;
        if (btn) {
            btn.setTitleColorForState(newValue, UIControlState.UIControlStateNormal);
        }
    };
    ButtonStyler.resetColorProperty = function (view, nativeValue) {
        var btn = view._nativeView;
        if (btn) {
            btn.setTitleColorForState(nativeValue, UIControlState.UIControlStateNormal);
        }
    };
    ButtonStyler.getNativeColorValue = function (view) {
        var btn = view._nativeView;
        if (btn) {
            return btn.titleColorForState(UIControlState.UIControlStateNormal);
        }
    };
    ButtonStyler.setFontSizeProperty = function (view, newValue) {
        var btn = view._nativeView;
        if (btn) {
            btn.titleLabel.font = btn.titleLabel.font.fontWithSize(newValue);
        }
    };
    ButtonStyler.resetFontSizeProperty = function (view, nativeValue) {
        var btn = view._nativeView;
        if (btn) {
            btn.font = btn.titleLabel.font.fontWithSize(nativeValue);
        }
    };
    ButtonStyler.getNativeFontSizeValue = function (view) {
        var btn = view._nativeView;
        if (btn) {
            return btn.titleLabel.font.pointSize;
        }
    };
    return ButtonStyler;
})(DefaultStyler);
exports.ButtonStyler = ButtonStyler;
var TextFieldStyler = (function (_super) {
    __extends(TextFieldStyler, _super);
    function TextFieldStyler() {
        _super.call(this);
        this.setHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(TextFieldStyler.setColorProperty, TextFieldStyler.resetColorProperty, TextFieldStyler.getNativeColorValue));
        this.setHandler(style.fontSizeProperty, new stylersCommon.StylePropertyChangedHandler(TextFieldStyler.setFontSizeProperty, TextFieldStyler.resetFontSizeProperty, TextFieldStyler.getNativeFontSizeValue));
    }
    TextFieldStyler.setColorProperty = function (view, newValue) {
        var textField = view._nativeView;
        if (textField) {
            textField.textColor = newValue;
        }
    };
    TextFieldStyler.resetColorProperty = function (view, nativeValue) {
        var textField = view._nativeView;
        if (textField) {
            textField.textColor = nativeValue;
        }
    };
    TextFieldStyler.getNativeColorValue = function (view) {
        var textField = view._nativeView;
        if (textField) {
            return textField.textColor;
        }
    };
    TextFieldStyler.setFontSizeProperty = function (view, newValue) {
        var textField = view._nativeView;
        if (textField) {
            textField.font = textField.font.fontWithSize(newValue);
        }
    };
    TextFieldStyler.resetFontSizeProperty = function (view, nativeValue) {
        var textField = view._nativeView;
        if (textField) {
            textField.font = textField.font.fontWithSize(nativeValue);
        }
    };
    TextFieldStyler.getNativeFontSizeValue = function (view) {
        var textField = view._nativeView;
        if (textField) {
            return textField.font.pointSize;
        }
    };
    return TextFieldStyler;
})(DefaultStyler);
exports.TextFieldStyler = TextFieldStyler;
var TextViewStyler = (function (_super) {
    __extends(TextViewStyler, _super);
    function TextViewStyler() {
        _super.call(this);
        this.setHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(TextViewStyler.setColorProperty, TextViewStyler.resetColorProperty, TextViewStyler.getNativeColorValue));
        this.setHandler(style.fontSizeProperty, new stylersCommon.StylePropertyChangedHandler(TextViewStyler.setFontSizeProperty, TextViewStyler.resetFontSizeProperty, TextViewStyler.getNativeFontSizeValue));
    }
    TextViewStyler.setColorProperty = function (view, newValue) {
        var textView = view._nativeView;
        if (textView) {
            textView.textColor = newValue;
        }
    };
    TextViewStyler.resetColorProperty = function (view, nativeValue) {
        var textView = view._nativeView;
        if (textView) {
            textView.textColor = nativeValue;
        }
    };
    TextViewStyler.getNativeColorValue = function (view) {
        var textView = view._nativeView;
        if (textView) {
            return textView.textColor;
        }
    };
    TextViewStyler.setFontSizeProperty = function (view, newValue) {
        var textView = view._nativeView;
        if (textView) {
            textView.font = textView.font.fontWithSize(newValue);
        }
    };
    TextViewStyler.resetFontSizeProperty = function (view, nativeValue) {
        var textView = view._nativeView;
        if (textView) {
            textView.font = textView.font.fontWithSize(nativeValue);
        }
    };
    TextViewStyler.getNativeFontSizeValue = function (view) {
        var textView = view._nativeView;
        if (textView) {
            return textView.font.pointSize;
        }
    };
    return TextViewStyler;
})(DefaultStyler);
exports.TextViewStyler = TextViewStyler;
function _registerDefaultStylers() {
    stylersCommon.registerStyler("Button", new ButtonStyler());
    stylersCommon.registerStyler("Label", new LabelStyler());
    stylersCommon.registerStyler("TextField", new TextFieldStyler());
    stylersCommon.registerStyler("TextView", new TextViewStyler());
}
exports._registerDefaultStylers = _registerDefaultStylers;
