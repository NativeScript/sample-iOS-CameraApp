var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var observable = require("data/observable");
var view = require("ui/core/view");
var proxy = require("ui/core/proxy");
var dependencyObservable = require("ui/core/dependency-observable");
var ITEMS = "items";
var ISSCROLLING = "isScrolling";
var LISTVIEW = "ListView";
var ITEMSCHANGED = "_itemsChanged";
var CHANGE = "change";
var knownEvents;
(function (knownEvents) {
    knownEvents.itemLoading = "itemLoading";
    knownEvents.itemTap = "itemTap";
    knownEvents.loadMoreItems = "loadMoreItems";
})(knownEvents = exports.knownEvents || (exports.knownEvents = {}));
function onItemsPropertyChanged(data) {
    var listView = data.object;
    var itemsChanged = listView[ITEMSCHANGED];
    if (data.oldValue instanceof observable.Observable) {
        data.oldValue.off(CHANGE, itemsChanged);
    }
    if (data.newValue instanceof observable.Observable) {
        data.newValue.on(CHANGE, itemsChanged);
    }
    listView.refresh();
}
exports.itemsProperty = new dependencyObservable.Property(ITEMS, LISTVIEW, new proxy.PropertyMetadata(undefined, dependencyObservable.PropertyMetadataOptions.AffectsMeasure, onItemsPropertyChanged));
exports.isScrollingProperty = new dependencyObservable.Property(ISSCROLLING, LISTVIEW, new proxy.PropertyMetadata(false, dependencyObservable.PropertyMetadataOptions.None));
var ListView = (function (_super) {
    __extends(ListView, _super);
    function ListView() {
        var _this = this;
        _super.call(this);
        this._itemsChanged = function (args) {
            _this.refresh();
        };
    }
    Object.defineProperty(ListView.prototype, "items", {
        get: function () {
            return this._getValue(exports.itemsProperty);
        },
        set: function (value) {
            this._setValue(exports.itemsProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ListView.prototype, "isScrolling", {
        get: function () {
            return this._getValue(exports.isScrollingProperty);
        },
        set: function (value) {
            this._setValue(exports.isScrollingProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    ListView.prototype.refresh = function () {
    };
    return ListView;
})(view.View);
exports.ListView = ListView;
