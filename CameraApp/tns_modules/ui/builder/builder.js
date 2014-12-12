var view = require("ui/core/view");
var gridPanelDef = require("ui/panels/grid-panel");
var fs = require("file-system");
var xml = require("xml");
var types = require("utils/types");
var file_access_module = require("file-system/file-system-access");
var KNOWNCOLLECTIONS = "knownCollections";
var KNOWNEVENTS = "knownEvents";
var UI_PATH = "ui/";
var MODULES = {
    "ActivityIndicator": "activity-indicator",
    "ListView": "list-view",
    "GridPanel": "panels/grid-panel",
    "ColumnDefinition": "panels/grid-panel",
    "RowDefinition": "panels/grid-panel",
    "StackPanel": "panels/stack-panel",
    "ScrollView": "scroll-view",
    "SearchBar": "search-bar",
    "SlideOut": "slide-out",
    "TabView": "tab-view",
    "TabEntry": "tab-view",
    "TextField": "text-field",
};
var ROW = "row";
var COL = "col";
var COL_SPAN = "colSpan";
var ROW_SPAN = "rowSpan";
function load(fileName, exports) {
    var rootComponent;
    if (fileName && fs.File.exists(fileName)) {
        var fileAccess = new file_access_module.FileSystemAccess();
        fileAccess.readText(fileName, function (result) {
            var parents = [];
            var complexProperties = [];
            var xmlParser = new xml.XmlParser(function (args) {
                var parent = parents[parents.length - 1];
                var complexProperty = complexProperties[complexProperties.length - 1];
                if (args.eventType === xml.ParserEventType.StartElement) {
                    if (isComplexProperty(args.elementName)) {
                        complexProperties.push({ name: args.elementName.split(".")[1], items: [] });
                    }
                    else {
                        var componentModule = getComponentModule(args, exports);
                        if (parent) {
                            if (componentModule.component instanceof view.View) {
                                if (complexProperty) {
                                    addToComplexProperty(parent, complexProperty, componentModule);
                                }
                                else if (parent._addChildFromBuilder) {
                                    parent._addChildFromBuilder(args.elementName, componentModule.component);
                                }
                            }
                            else if (complexProperty) {
                                addToComplexProperty(parent, complexProperty, componentModule);
                            }
                        }
                        else {
                            rootComponent = componentModule.component;
                        }
                        parents.push(componentModule.component);
                    }
                }
                else if (args.eventType === xml.ParserEventType.EndElement) {
                    if (isComplexProperty(args.elementName)) {
                        if (complexProperty) {
                            if (parent._addArrayFromBuilder) {
                                parent._addArrayFromBuilder(complexProperty.name, complexProperty.items);
                                complexProperty.items = [];
                            }
                        }
                        complexProperties.pop();
                    }
                    else {
                        parents.pop();
                    }
                }
            }, function (e) {
            });
            xmlParser.parse(result);
        }, function (e) {
        });
    }
    return rootComponent;
}
exports.load = load;
function getComponentModule(args, exports) {
    var name = args.elementName;
    var moduleId = MODULES[name] || name.toLowerCase();
    var instanceModule = require(UI_PATH + moduleId);
    var instanceType = instanceModule[args.elementName] || Object;
    var instance = new instanceType();
    for (var attr in args.attributes) {
        if (attr in instance) {
            instance[attr] = args.attributes[attr];
        }
        else if (isKnownEvent(attr, instanceModule)) {
            var handlerName = args.attributes[attr];
            var handler = exports[handlerName];
            if (types.isFunction(handler)) {
                instance.on(attr, handler);
            }
        }
        else if (attr === ROW) {
            gridPanelDef.GridPanel.setRow(instance, args.attributes[attr]);
        }
        else if (attr === COL) {
            gridPanelDef.GridPanel.setColumn(instance, args.attributes[attr]);
        }
        else if (attr === COL_SPAN) {
            gridPanelDef.GridPanel.setColumnSpan(instance, args.attributes[attr]);
        }
        else if (attr === ROW_SPAN) {
            gridPanelDef.GridPanel.setRowSpan(instance, args.attributes[attr]);
        }
        else {
            instance[attr] = args.attributes[attr];
        }
    }
    return { component: instance, exports: instanceModule };
}
function isComplexProperty(name) {
    return name && name.indexOf(".") !== -1;
}
function isKnownCollection(name, exports) {
    return KNOWNCOLLECTIONS in exports && exports[KNOWNCOLLECTIONS] && name in exports[KNOWNCOLLECTIONS];
}
function isKnownEvent(name, exports) {
    return (KNOWNEVENTS in exports && name in exports[KNOWNEVENTS]) || (KNOWNEVENTS in view && name in view[KNOWNEVENTS]);
}
function addToComplexProperty(parent, complexProperty, elementModule) {
    if (isKnownCollection(complexProperty.name, elementModule.exports)) {
        complexProperty.items.push(elementModule.component);
    }
    else if (parent._addChildFromBuilder) {
        parent._addChildFromBuilder("", elementModule.component);
    }
    else {
        parent[complexProperty.name] = elementModule.component;
    }
}
