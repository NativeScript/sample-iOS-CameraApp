var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var observable = require("data/observable");
var dependencyObservable = require("ui/core/dependency-observable");
exports.bindingContextProperty = new dependencyObservable.Property("bindingContext", "Bindable", new dependencyObservable.PropertyMetadata(undefined, dependencyObservable.PropertyMetadataOptions.Inheritable));
var Bindable = (function (_super) {
    __extends(Bindable, _super);
    function Bindable() {
        _super.apply(this, arguments);
        this._bindings = {};
    }
    Object.defineProperty(Bindable.prototype, "bindingContext", {
        get: function () {
            return this._getValue(exports.bindingContextProperty);
        },
        set: function (value) {
            this._setValue(exports.bindingContextProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Bindable.prototype.bind = function (options, source) {
        var binding = this._bindings[options.targetProperty];
        if (binding) {
            binding.unbind();
        }
        binding = new Binding(this, options);
        this._bindings[options.targetProperty] = binding;
        var bindingSource = source;
        if (!bindingSource) {
            bindingSource = this.bindingContext;
        }
        if (bindingSource) {
            binding.bind(bindingSource);
        }
    };
    Bindable.prototype.unbind = function (property) {
        var binding = this._bindings[property];
        if (binding) {
            binding.unbind();
            delete this._bindings[property];
        }
    };
    Bindable.prototype._updateTwoWayBinding = function (propertyName, value) {
        var binding = this._bindings[propertyName];
        if (binding) {
            binding.updateTwoWay(value);
        }
    };
    Bindable.prototype._setCore = function (data) {
        _super.prototype._setCore.call(this, data);
        this._updateTwoWayBinding(data.propertyName, data.value);
    };
    Bindable.prototype._onPropertyChanged = function (property, oldValue, newValue) {
        _super.prototype._onPropertyChanged.call(this, property, oldValue, newValue);
        if (property === exports.bindingContextProperty) {
            this._onBindingContextChanged(oldValue, newValue);
        }
        var binding = this._bindings[property.name];
        if (binding) {
            var shouldRemoveBinding = !binding.updating && !binding.options.twoWay;
            if (shouldRemoveBinding) {
                this.unbind(property.name);
            }
            else {
                this._updateTwoWayBinding(property.name, newValue);
            }
        }
    };
    Bindable.prototype._onBindingContextChanged = function (oldValue, newValue) {
        var binding;
        for (var p in this._bindings) {
            binding = this._bindings[p];
            if (binding.source && binding.source !== oldValue) {
                continue;
            }
            binding.unbind();
            if (newValue) {
                binding.bind(newValue);
            }
        }
    };
    return Bindable;
})(dependencyObservable.DependencyObservable);
exports.Bindable = Bindable;
var Binding = (function () {
    function Binding(target, options) {
        this.updating = false;
        this.target = target;
        this.options = options;
    }
    Binding.prototype.bind = function (obj) {
        if (!obj) {
            throw new Error("Expected valid object reference as a source in the Binding.bind method.");
        }
        this.source = obj;
        this.updateTarget(this.getSourceProperty());
        if (!this.sourceOptions) {
            this.sourceOptions = this.resolveOptions(this.source, this.options.sourceProperty);
        }
        if (this.sourceOptions.instance instanceof observable.Observable) {
            this.sourceOptions.instance.addEventListener(observable.knownEvents.propertyChange, this.onSourcePropertyChanged, this);
        }
    };
    Binding.prototype.unbind = function () {
        if (!this.source || !this.sourceOptions) {
            return;
        }
        if (this.sourceOptions.instance instanceof observable.Observable) {
            this.sourceOptions.instance.removeEventListener(observable.knownEvents.propertyChange, this.onSourcePropertyChanged);
        }
        this.source = undefined;
        this.sourceOptions = undefined;
        this.targetOptions = undefined;
    };
    Binding.prototype.updateTwoWay = function (value) {
        if (this.options.twoWay) {
            this.updateSource(value);
        }
    };
    Binding.prototype.onSourcePropertyChanged = function (data) {
        if (data.propertyName !== this.options.sourceProperty) {
            return;
        }
        this.updateTarget(data.value);
    };
    Binding.prototype.getSourceProperty = function () {
        if (!this.sourceOptions) {
            this.sourceOptions = this.resolveOptions(this.source, this.options.sourceProperty);
        }
        if (this.sourceOptions.instance instanceof observable.Observable) {
            return this.sourceOptions.instance.get(this.sourceOptions.property);
        }
        return this.sourceOptions.instance[this.sourceOptions.property];
    };
    Binding.prototype.updateTarget = function (value) {
        if (this.updating || !this.target) {
            return;
        }
        if (!this.targetOptions) {
            this.targetOptions = this.resolveOptions(this.target, this.options.targetProperty);
        }
        this.updateOptions(this.targetOptions, value);
    };
    Binding.prototype.updateSource = function (value) {
        if (this.updating || !this.source) {
            return;
        }
        if (!this.sourceOptions) {
            this.sourceOptions = this.resolveOptions(this.source, this.options.sourceProperty);
        }
        this.updateOptions(this.sourceOptions, value);
    };
    Binding.prototype.resolveOptions = function (obj, property) {
        var properties = property.split(".");
        var i, currentObject = obj;
        for (i = 0; i < properties.length - 1; i++) {
            currentObject = currentObject[properties[i]];
        }
        return {
            instance: currentObject,
            property: properties[properties.length - 1]
        };
    };
    Binding.prototype.updateOptions = function (options, value) {
        this.updating = true;
        if (options.instance instanceof observable.Observable) {
            options.instance.set(options.property, value);
        }
        else {
            options.instance[options.property] = value;
        }
        this.updating = false;
    };
    return Binding;
})();
