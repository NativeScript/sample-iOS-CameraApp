var pages = require("ui/page");
var stackPanel = require("ui/panels/stack-panel");
var button = require("ui/button");
var label = require("ui/label");
var layout = require("ui/core/layout");
var geometry = require("utils/geometry");
var model = require("/modules/model");

// Setup the title label.
var titleLabel = new label.Label();
titleLabel.horizontalAlignment = layout.HorizontalAlignment.center;
titleLabel.margin = new geometry.Thickness(20, 20, 20, 20);
titleLabel.text = "Tap the button";
titleLabel.cssClass = "title";

// Setup the button.
var btn = new button.Button();
btn.text = "TAP";
btn.horizontalAlignment = layout.HorizontalAlignment.center;
btn.on("click", function () {
    console.log("button click called");
    model.tapAction();
});

//Setup the message label.
var messageLabel = new label.Label();
messageLabel.horizontalAlignment = layout.HorizontalAlignment.center;
messageLabel.margin = new geometry.Thickness(20, 20, 20, 20);
messageLabel.cssClass = "message";
messageLabel.textWrap = true;

// Bind the text of the message label to the text property of the model.
messageLabel.bind({
    sourceProperty: "message",
    targetProperty: "text"
}, model);

// Put all the elements in a StackPanel.
var panel = new stackPanel.StackPanel();
panel.addChild(titleLabel);
panel.addChild(btn);
panel.addChild(messageLabel);

// Create and return the page.
var page = new pages.Page();
page.content = panel;
page.css = " button { font-size: 42 } .title { font-size: 30 } .message { font-size: 20; color: #284848; }";
exports.Page = page;
