# sample-iOS-CameraApp
In this sample we are demonstrating how you can write platform specific code with NativeScript. We are building iOS only app which uses the latest iOS8 camera APIs.

Running the app requires creation of a new project using the NativeScript CLI:
``` bash
$ tns create CameraApp
$ tns platform add ios
```
And then copy the source code from the app.js into your app.

Please note that the camera APIs were introduced in iOS 8 and the example uses them,
so you can test it only on a real device with camera and iOS version 8 or later.
