var imageSource = require("image-source");
var types = require("utils/types");
var USER_AGENT_HEADER = "User-Agent";
var USER_AGENT = "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36";
function request(options) {
    return new Promise(function (resolve, reject) {
        try {
            var request = new com.koushikdutta.async.http.AsyncHttpRequest(java.net.URI.create(options.url), options.method);
            request.addHeader(USER_AGENT_HEADER, USER_AGENT);
            if (options.headers) {
                for (var key in options.headers) {
                    request.addHeader(key, options.headers[key]);
                }
            }
            if (types.isNumber(options.timeout)) {
                request.setTimeout(options.timeout);
            }
            if (types.isString(options.content)) {
                var stringBody = com.koushikdutta.async.http.body.StringBody.extend({
                    getContentType: function () {
                        return null;
                    }
                });
                request.setBody(new stringBody(options.content));
            }
            else if (types.isDefined(options.content)) {
                request.setBody(new com.koushikdutta.async.http.body.StreamBody(new java.io.ByteArrayInputStream(options.content), options.content.length));
            }
            var callback = new com.koushikdutta.async.http.callback.HttpConnectCallback({
                onConnectCompleted: function (error, response) {
                    if (error) {
                        reject(new Error(error.toString()));
                    }
                    else {
                        var headers = {};
                        var rawHeaders = response.getHeaders().headers;
                        for (var i = 0, l = rawHeaders.length(); i < l; i++) {
                            var key = rawHeaders.getFieldName(i);
                            headers[key] = rawHeaders.getValue(i);
                        }
                        var outputStream = new java.io.ByteArrayOutputStream();
                        var dataCallback = new com.koushikdutta.async.callback.DataCallback({
                            onDataAvailable: function (emitter, byteBufferList) {
                                var bb = byteBufferList.getAll();
                                outputStream.write(bb.array(), bb.arrayOffset() + bb.position(), bb.remaining());
                            }
                        });
                        response.setDataCallback(dataCallback);
                        var endCallback = new com.koushikdutta.async.callback.CompletedCallback({
                            onCompleted: function (error) {
                                resolve({
                                    content: {
                                        raw: outputStream,
                                        toString: function () {
                                            return outputStream.toString();
                                        },
                                        toJSON: function () {
                                            return JSON.parse(outputStream.toString());
                                        },
                                        toImage: function () {
                                            return new Promise(function (resolveImage, rejectImage) {
                                                try {
                                                    var stream = new java.io.ByteArrayInputStream(outputStream.toByteArray());
                                                    resolveImage(imageSource.fromNativeSource(android.graphics.BitmapFactory.decodeStream(stream)));
                                                }
                                                catch (e) {
                                                    rejectImage(e);
                                                }
                                            });
                                        }
                                    },
                                    statusCode: rawHeaders.getResponseCode(),
                                    headers: headers
                                });
                            }
                        });
                        response.setEndCallback(endCallback);
                    }
                }
            });
            com.koushikdutta.async.http.AsyncHttpClient.getDefaultInstance().execute(request, callback);
        }
        catch (ex) {
            reject(ex);
        }
    });
}
exports.request = request;
