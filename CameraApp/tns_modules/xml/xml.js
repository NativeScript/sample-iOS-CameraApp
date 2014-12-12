var easysax = require("js-libs/easysax");
var ParserEventType = (function () {
    function ParserEventType() {
    }
    ParserEventType.StartElement = "StartElement";
    ParserEventType.EndElement = "EndElement";
    ParserEventType.Text = "Text";
    ParserEventType.CDATA = "CDATA";
    ParserEventType.Comment = "Comment";
    return ParserEventType;
})();
exports.ParserEventType = ParserEventType;
var ParserEvent = (function () {
    function ParserEvent(eventType, elementName, attributes, data) {
        this._eventType = eventType;
        this._elementName = elementName;
        this._attributes = attributes;
        this._data = data;
    }
    ParserEvent.prototype.toString = function () {
        return JSON.stringify({
            eventType: this.eventType,
            elementName: this.elementName,
            attributes: this.attributes,
            data: this.data
        });
    };
    Object.defineProperty(ParserEvent.prototype, "eventType", {
        get: function () {
            return this._eventType;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ParserEvent.prototype, "elementName", {
        get: function () {
            return this._elementName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ParserEvent.prototype, "attributes", {
        get: function () {
            return this._attributes;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ParserEvent.prototype, "data", {
        get: function () {
            return this._data;
        },
        enumerable: true,
        configurable: true
    });
    return ParserEvent;
})();
exports.ParserEvent = ParserEvent;
var XmlParser = (function () {
    function XmlParser(onEvent, onError) {
        this._parser = new easysax.EasySAXParser();
        this._parser.on('startNode', function (elem, attr, uq, str, tagend) {
            var attributes = attr();
            if (attributes === true) {
                attributes = undefined;
            }
            onEvent(new ParserEvent(ParserEventType.StartElement, elem, attributes));
        });
        this._parser.on('textNode', function (text, uq) {
            var data = uq(text);
            onEvent(new ParserEvent(ParserEventType.Text, undefined, undefined, data));
        });
        this._parser.on('endNode', function (elem, uq, tagstart, str) {
            onEvent(new ParserEvent(ParserEventType.EndElement, elem));
        });
        this._parser.on('cdata', function (data) {
            onEvent(new ParserEvent(ParserEventType.CDATA, undefined, undefined, data));
        });
        this._parser.on('comment', function (text) {
            onEvent(new ParserEvent(ParserEventType.Comment, undefined, undefined, text));
        });
        if (onError) {
            this._parser.on('error', function (msg) {
                onError(new Error(msg));
            });
        }
    }
    XmlParser.prototype.parse = function (xmlString) {
        this._parser.parse(xmlString);
    };
    return XmlParser;
})();
exports.XmlParser = XmlParser;
