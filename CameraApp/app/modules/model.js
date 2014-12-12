var observable = require("data/observable");

var model = new observable.Observable();
model.counter = 42;
model.set("message", model.counter + " taps left");
model.tapAction = function(){
    model.counter --;
    if (model.counter <= 0)
    {
        model.set("message", "Hoorraaay! You unlocked the NativeScript clicker achievement!");
    }
    else
    {
        model.set("message", model.counter + " taps left")
    }
}

module.exports = model;
