exports.STRING = "string", exports.PROMPT = "Prompt", exports.CONFIRM = "Confirm", exports.ALERT = "Alert", exports.LOGIN = "Login", exports.OK = "OK", exports.CANCEL = "Cancel";
(function (InputType) {
    InputType[InputType["PlainText"] = 0] = "PlainText";
    InputType[InputType["Password"] = 1] = "Password";
})(exports.InputType || (exports.InputType = {}));
var InputType = exports.InputType;
