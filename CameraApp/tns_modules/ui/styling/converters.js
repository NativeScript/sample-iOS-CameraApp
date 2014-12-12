var color = require("color");
function colorConverter(cssValue) {
    return new color.Color(cssValue);
}
exports.colorConverter = colorConverter;
function fontSizeConverter(cssValue) {
    var result = parseFloat(cssValue);
    return result;
}
exports.fontSizeConverter = fontSizeConverter;
