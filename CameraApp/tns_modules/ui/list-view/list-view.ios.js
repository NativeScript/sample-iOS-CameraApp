var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var common = require("ui/list-view/list-view-common");
var geometry = require("utils/geometry");
var OWNER = "_owner";
var CELLIDENTIFIER = "cell";
var ITEMLOADING = common.knownEvents.itemLoading;
var LOADMOREITEMS = common.knownEvents.loadMoreItems;
var ITEMTAP = common.knownEvents.itemTap;
var DEFAULT_HEIGHT = 80;
require("utils/module-merge").merge(common, exports);
var ver = NSString.stringWithString(UIDevice.currentDevice().systemVersion).intValue;
var ListViewCell = UITableViewCell.extend({}, {});
function notifyForItemAtIndex(listView, cell, eventName, tableView, indexPath) {
    var args = { eventName: eventName, object: listView, index: indexPath.row, view: cell.view };
    listView.notify(args);
    return args;
}
var DataSourceClass = NSObject.extend({
    get owner() {
        var owner = null;
        var weakRef = this[OWNER];
        if (weakRef) {
            owner = weakRef.get();
        }
        return owner;
    },
    tableViewNumberOfRowsInSection: function (tableView, section) {
        return this.owner.items ? this.owner.items.length : 0;
    },
    tableViewCellForRowAtIndexPath: function (tableView, indexPath) {
        var cell = tableView.dequeueReusableCellWithIdentifier(CELLIDENTIFIER);
        if (!cell) {
            cell = ListViewCell.new();
        }
        var args = notifyForItemAtIndex(this.owner, cell, ITEMLOADING, tableView, indexPath);
        if (!cell.view) {
            cell.view = args.view;
            if (args.view && args.view.ios) {
                cell.contentView.addSubview(args.view.ios);
                this.owner._addView(args.view);
            }
        }
        var availableSize = new geometry.Size(this.owner._availableWidth, Number.POSITIVE_INFINITY);
        args.view._invalidateMeasure();
        args.view.measure(availableSize);
        var height = args.view._layoutInfo.desiredSize.height;
        var rect = new geometry.Rect(0, 0, this.owner._availableWidth, height);
        args.view.arrange(rect);
        this.owner.setHeight(indexPath.row, height);
        return cell;
    }
}, {
    protocols: [UITableViewDataSource]
});
var UITableViewDelegateClass = NSObject.extend({
    get owner() {
        var owner = null;
        var weakRef = this[OWNER];
        if (weakRef) {
            owner = weakRef.get();
        }
        return owner;
    },
    tableViewWillDisplayCellForRowAtIndexPath: function (tableView, cell, indexPath) {
        if (this.owner) {
            if (indexPath.row === this.owner.items.length - 1) {
                this.owner.notify({ eventName: LOADMOREITEMS, object: this.owner });
            }
        }
    },
    tableViewWillSelectRowAtIndexPath: function (tableView, indexPath) {
        if (this.owner) {
            var cell = tableView.cellForRowAtIndexPath(indexPath);
            notifyForItemAtIndex(this.owner, cell, ITEMTAP, tableView, indexPath);
            cell.highlighted = false;
        }
    },
    tableViewHeightForRowAtIndexPath: function (tableView, indexPath) {
        if (this.owner) {
            if (ver < 8) {
                var cell = this.owner.measureCell;
                if (!cell) {
                    cell = tableView.dequeueReusableCellWithIdentifier(CELLIDENTIFIER);
                    if (!cell) {
                        cell = new ListViewCell();
                    }
                    this.owner.measureCell = cell;
                }
                var args = notifyForItemAtIndex(this.owner, cell, ITEMLOADING, tableView, indexPath);
                if (!cell.view) {
                    cell.view = args.view;
                    if (args.view && args.view.ios) {
                        this.owner._addView(args.view);
                    }
                }
                var availableSize = new geometry.Size(this.owner._availableWidth, Number.POSITIVE_INFINITY);
                args.view._invalidateMeasure();
                args.view.measure(availableSize);
                var height = args.view._layoutInfo.desiredSize.height;
                return height;
            }
            return this.owner.getHeight(indexPath.row);
        }
        return DEFAULT_HEIGHT;
    },
    tableViewEstimatedHeightForRowAtIndexPath: function (tableView, indexPath) {
        return DEFAULT_HEIGHT;
    }
}, {
    protocols: [UITableViewDelegate]
});
var ListView = (function (_super) {
    __extends(ListView, _super);
    function ListView() {
        _super.call(this);
        this._ios = new UITableView();
        this._ios.registerClassForCellReuseIdentifier(ListViewCell.class(), CELLIDENTIFIER);
        this._ios.autoresizesSubviews = false;
        this._ios.autoresizingMask = UIViewAutoresizing.UIViewAutoresizingNone;
        var dataSource = DataSourceClass.alloc();
        dataSource[OWNER] = new WeakRef(this);
        this._dataSource = dataSource;
        this._ios.dataSource = this._dataSource;
        this._uiTableViewDelegate = UITableViewDelegateClass.alloc();
        this._uiTableViewDelegate[OWNER] = new WeakRef(this);
        this._ios.delegate = this._uiTableViewDelegate;
        this._heights = new Array();
    }
    Object.defineProperty(ListView.prototype, "ios", {
        get: function () {
            return this._ios;
        },
        enumerable: true,
        configurable: true
    });
    ListView.prototype.refresh = function () {
        this._ios.reloadData();
    };
    ListView.prototype._measureOverride = function (availableSize) {
        this._availableWidth = availableSize.width;
        return _super.prototype._measureOverride.call(this, availableSize);
    };
    ListView.prototype.getHeight = function (index) {
        return this._heights[index];
    };
    ListView.prototype.setHeight = function (index, value) {
        this._heights[index] = value;
    };
    return ListView;
})(common.ListView);
exports.ListView = ListView;
