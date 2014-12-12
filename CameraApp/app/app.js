var RELATIVE_DOT_SIZE = 0.2;
var RELATIVE_TOUCH_SIZE = 0.25;
var RELATIVE_ICONS_DISTANCE = 0.7;
var GAP_EPSILON = 0.01;
var SELECTION_RELATIVE_INNER_RADIUS = 0.95;
var SELECTION_RELATIVE_OUTER_RADIUS = 1;
var BUTTON_RELATIVE_INNER_RADIUS = 0.3;
var BUTTON_RELATIVE_OUTER_RADIUS = 0.92;
var CLOSED_SCALE_FACTOR = 0.2;
var CLOSED_ALPHA = 0;
var OPENED_SCALE_FACTOR = 1;
var OPENED_ALPHA = 1;
var CAPTURE_BUTTON_STROKE_WIDTH = 3;

var ShotButton = UIControl.extend({
    initWithFrame: function(frame) {
        var self = this.super.initWithFrame(frame);
        if (self) {
            self.backgroundColor = UIColor.clearColor();
        }
        return self;
    },
    drawRect: function (rect) {
        var halfW = rect.size.width * 0.5 - CAPTURE_BUTTON_STROKE_WIDTH * 0.5;
        var halfH = rect.size.height * 0.5 - CAPTURE_BUTTON_STROKE_WIDTH * 0.5;
        var r = Math.min(halfW, halfH);
        var x = halfW;
        var y = halfH;

        var ctx = UIGraphicsGetCurrentContext();
        UIColor.redColor().setFill();
        UIColor.whiteColor().setStroke();
        CGContextAddArc(ctx, rect.size.width / 2, rect.size.height / 2, r, 0, Math.PI * 2, 0);
        CGContextFillPath(ctx);
        CGContextSetLineWidth(ctx, CAPTURE_BUTTON_STROKE_WIDTH);
        CGContextAddArc(ctx, rect.size.width / 2, rect.size.height / 2, r, 0, Math.PI * 2, 0);
        CGContextStrokePath(ctx);
    }
}, {
});

var ArcView = UIView.extend({
    initWithOptions: function(options) {
        var self = this.super.initWithFrame(options.frame);
        if (self) {
            self.options = options;
            self.backgroundColor = UIColor.clearColor();
            self.userInteractionEnabled = false;
        }

        return self;
    },
    drawRect: function (rect) {
        var halfW = rect.size.width * 0.5;
        var halfH = rect.size.height * 0.5;
        var r = Math.min(halfW, halfH);
        var x = halfW;
        var y = halfH;
        var rInner = r * this.options.rInner;
        var rOuter = r * this.options.rOuter;
        var from = this.options.segment * -0.5;
        var to = this.options.segment * +0.5;

        var ctx = UIGraphicsGetCurrentContext();
        this.options.color.setFill();
        CGContextAddArc(ctx, x, y, rOuter, from, to, 0);
        CGContextAddArc(ctx, x, y, rInner, to, from, 1);
        CGContextFillPath(ctx);
    }
}, {
});

var DialSelector = UIControl.extend({
    initWithOptions: function (options) {
        var self = this.super.initWithFrame(options.frame);
        if (self) {
            self.options = options;
            self.backgroundColor = UIColor.clearColor();
            self.childFrame = CGRectMake(0, 0, options.frame.size.width, options.frame.size.height);
            self.dotBackgroundColor = UIColor.alloc().initWithRedGreenBlueAlpha(0, 0, 0, 0.7);

            self.optionsCount = 5;
            self.segmentsCount = 8;
            self.createButtons();

            self.selectedIndex = Math.floor(self.optionsCount / 2);
            self.value = self.options.values[self.selectedIndex];
            self.selectedAngle = (-self.selectedIndex / self.segmentsCount - 0.25) * Math.PI * 2;
            self.createSelection();

            self.createLabel();

            self.addSelectionViews();
        }
        return self;
    },
    createLabel: function () {
        this.label = new UILabel(this.childFrame);
        this.label.textAlignment = NSTextAlignment.NSTextAlignmentCenter;
        this.label.textColor = UIColor.whiteColor();
        this.label.text = this.options.text;
        this.addSubview(this.label);
    },
    createButtons: function() {
        this.buttons = new Array(this.segmentsCount);
        var segment = Math.PI * 2 / this.segmentsCount - GAP_EPSILON;
        var buttonOptions = {
            frame: this.childFrame,
            color: UIColor.alloc().initWithRedGreenBlueAlpha(0, 0, 0, 0.7),
            rInner: BUTTON_RELATIVE_INNER_RADIUS,
            rOuter: BUTTON_RELATIVE_OUTER_RADIUS,
            segment: segment
        };
        for (var i = 0; i < this.segmentsCount; i++) {
            var button = ArcView.alloc().initWithOptions(buttonOptions);
            this.buttons[i] = button;
            button.transform = CGAffineTransformRotate(CGAffineTransformMakeScale(CLOSED_SCALE_FACTOR, CLOSED_SCALE_FACTOR), Math.PI * 2 * i / this.segmentsCount);
            button.alpha = CLOSED_ALPHA;
            this.addSubview(button);
        }
    },
    createSelection: function () {
        var segment = Math.PI * 2 / this.segmentsCount - GAP_EPSILON;
        this.selectorArc = ArcView.alloc().initWithOptions({
            frame: this.childFrame,
            color: UIColor.redColor(),
            rInner: SELECTION_RELATIVE_INNER_RADIUS,
            rOuter: SELECTION_RELATIVE_OUTER_RADIUS,
            segment: segment
        });
        this.selectorArc.transform = CGAffineTransformScale(CGAffineTransformMakeRotation(this.selectedAngle), 0.2, 0.2);
        this.selectorArc.alpha = 0;
        this.addSubview(this.selectorArc);
    },
    addSelectionViews: function () {
        for (var i = 0; i < this.options.views.length; i++) {
            var item = this.options.views[i];
            item.center = { x: this.xCenter, y: this.yCenter };
            this.addSubview(item);
            item.alpha = CLOSED_ALPHA;
        }
    },
    get xCenter() {
        return this.frame.size.width * 0.5;
    },
    get yCenter() {
        return this.frame.size.height * 0.5;
    },
    get maxRadius() {
        return Math.min(this.frame.size.width * 0.5, this.frame.size.height * 0.5);
    },
    beginTrackingWithTouchWithEvent: function (touch, event) {
        this.sendActionsForControlEvents(UIControlEvents.UIControlEventEditingDidBegin);
        this.bloom(OPENED_SCALE_FACTOR, OPENED_ALPHA);
        return true;
    },
    continueTrackingWithTouchWithEvent: function (touch, event) {
        var location = touch.locationInView(this);

        var wHalf = this.frame.size.width * 0.5;
        var hHalf = this.frame.size.height * 0.5;
        var r = Math.min(wHalf, hHalf);

        var xCenter = wHalf;
        var yCenter = hHalf;

        var dx = location.x - xCenter;
        var dy = location.y - yCenter;

        var distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

        if (distance <= r * RELATIVE_TOUCH_SIZE) {
            // We are too close to the center so we won't change the selection.
        } else {
            var angle = Math.atan2(dy, dx);
            var twoPi = Math.PI * 2;
            var steps = this.segmentsCount;

            var newSelectedIndex = (Math.round(-angle / twoPi * steps) + Math.round(this.segmentsCount * 0.75)) % this.segmentsCount;
            var newSelectedAngle = -newSelectedIndex / steps * twoPi - Math.PI * 0.5;

            if (newSelectedIndex >= 0 && newSelectedIndex < this.optionsCount && this.selectedIndex != newSelectedIndex) {
                // Set newly selected values.
                this.selectedIndex = newSelectedIndex;
                this.selectedAngle = newSelectedAngle;
                this.value = this.options.values[newSelectedIndex];

                // Rotate the selector arc with animation.
                UIView.beginAnimationsContext(null, null);
                UIView.setAnimationDelegate(this);
                UIView.setAnimationDuration(0.2);
                UIView.setAnimationCurve(UIViewAnimationCurve.UIViewAnimationCurveEaseOut);

                this.selectorArc.transform = CGAffineTransformMakeRotation(this.selectedAngle);

                UIView.commitAnimations();

                // Notify observers.
                this.sendActionsForControlEvents(UIControlEvents.UIControlEventValueChanged);
            }
        }
        return true;
    },
    endTrackingWithTouchWithEvent: function (touch, event) {
        this.sendActionsForControlEvents(UIControlEvents.UIControlEventEditingDidEnd);
        this.bloom(CLOSED_SCALE_FACTOR, CLOSED_ALPHA);
    },
    distance: function (point) {
        return Math.sqrt(Math.pow(point.x - this.xCenter, 2) + Math.pow(point.y - this.yCenter, 2));
    },
    pointInsideWithEvent: function (point, event) {
        return this.distance(point) < this.maxRadius * RELATIVE_TOUCH_SIZE;
    },
    drawRect: function (rect) {
        var ctx = UIGraphicsGetCurrentContext();
        console.log(ctx);
        this.dotBackgroundColor.setFill();
        CGContextAddArc(ctx, this.xCenter, this.yCenter, this.maxRadius * RELATIVE_DOT_SIZE, 0, Math.PI * 2, 0);
        CGContextFillPath(ctx);
    },
    bloom: function (scale, alpha) {
        UIView.beginAnimationsContext(null, null);
        UIView.setAnimationDelegate(this);
        UIView.setAnimationCurve(UIViewAnimationCurve.UIViewAnimationCurveEaseOut);

        UIView.setAnimationDuration(0.2);
        this.selectorArc.transform = CGAffineTransformScale(CGAffineTransformMakeRotation(this.selectedAngle), scale, scale);
        this.selectorArc.alpha = alpha;

        for (var i = 0; i < this.segmentsCount; i++) {
            var button = this.buttons[i];
            UIView.setAnimationDuration(i * 0.05 + 0.03);
            button.transform = CGAffineTransformRotate(CGAffineTransformMakeScale(scale, scale), Math.PI * 2 * i / this.segmentsCount);
            button.alpha = alpha;
        }

        for (var i = 0; i < this.optionsCount; i++) {
            var item = this.options.views[i];
            var angle = i / (this.optionsCount - 1) * -Math.PI - Math.PI * 0.5;
            UIView.setAnimationDuration((this.optionsCount - 1 - i) * 0.05 + 0.1);
            item.transform = CGAffineTransformMakeTranslation(Math.cos(angle) * this.maxRadius * RELATIVE_ICONS_DISTANCE * scale, Math.sin(angle) * this.maxRadius * RELATIVE_ICONS_DISTANCE * scale);
            item.alpha = alpha;
        }

        UIView.commitAnimations();
    }
}, {
});

var CameraViewController = UIViewController.extend({
    viewDidLoad: function () {
        UIViewController.prototype.viewDidLoad.apply(this, arguments);
        this.createCamera();
        this.createControls();
        this.updateCamera();
        this.createShotButton();
    },
    createCamera: function() {
        // Init capture session
        this.session = new AVCaptureSession();
        this.session.sessionPreset = AVCaptureSessionPreset1280x720;

        // Adding capture device
        this.device = AVCaptureDevice.defaultDeviceWithMediaType(AVMediaTypeVideo);
        this.input = AVCaptureDeviceInput.deviceInputWithDeviceError(this.device, null);
        if (!this.input) {
            throw new Error("Error trying to open camera.");
        }
        this.session.addInput(this.input);

        this.output = new AVCaptureStillImageOutput();
        this.session.addOutput(this.output);

        this.session.startRunning();

        // Add a preview layer in the UI
        this.videoLayer = AVCaptureVideoPreviewLayer.layerWithSession(this.session);
        this.videoLayer.frame = this.view.bounds;
        this.view.layer.addSublayer(this.videoLayer);
    },
    createControls: function() {
        // Add white balance dial
        this.whiteBalance = DialSelector.alloc().initWithOptions({
            frame: CGRectMake(110, 70, 320, 320),
            text: "WB",
            views: this.createImages([
                "cloudy@2x.png",
                "sunny@2x.png",
                "auto@2x.png",
                "tungsten@2x.png",
                "fluorescent@2x.png"
            ]),
            values: [
                { auto: false, redGain: 2.4, greenGain: 1, blueGain: 2.2 },
                { auto: false, redGain: 2.2, greenGain: 1, blueGain: 2.1 },
                { auto: true, redGain: 2, greenGain: 1, blueGain: 2 },
                { auto: false, redGain: 1.8, greenGain: 1, blueGain: 1.9 },
                { auto: false, redGain: 2.1, greenGain: 1, blueGain: 2 }
            ]
        });
        this.subscribeDialEditBeginEnd(this.whiteBalance);
        this.whiteBalance.addTargetActionForControlEvents(this, "updateCamera", UIControlEvents.UIControlEventValueChanged);
        this.view.addSubview(this.whiteBalance);

        // Add iso dial
        this.iso = DialSelector.alloc().initWithOptions({
            frame: CGRectMake(110, 150, 320, 320),
            text: "ISO",
            views: this.createLabels(["32", "64", "128", "256", "512"]),
            values: [34, 65, 128, 256, 512]
        });
        this.subscribeDialEditBeginEnd(this.iso);
        this.iso.addTargetActionForControlEvents(this, "updateCamera", UIControlEvents.UIControlEventValueChanged);
        this.view.addSubview(this.iso);

        // Add exposure dial
        this.exposure = DialSelector.alloc().initWithOptions({
            frame: CGRectMake(110, 230, 320, 320),
            text: "EX",
            views: this.createLabels(["5", "10", "20", "50", "100"]),
            values: [5, 10, 20, 50, 100]
        });
        this.subscribeDialEditBeginEnd(this.exposure);
        this.exposure.addTargetActionForControlEvents(this, "updateCamera", UIControlEvents.UIControlEventValueChanged);
        this.view.addSubview(this.exposure);
    },
    createLabels: function (texts) {
        var rect = CGRectMake(0, 0, 40, 40);
        return texts.map(function (t) {
            var l = new UILabel(rect);
            l.text = t;
            l.textAlignment = NSTextAlignment.NSTextAlignmentCenter;
            l.textColor = UIColor.whiteColor();
            return l;
        });
    },
    createImages: function (paths) {
        var rect = CGRectMake(0, 0, 40, 40);
        return paths.map(function (p) {
            var uiImage = UIImage.imageWithContentsOfFile(__dirname + "/assets/" + p);
            var uiImageView = new UIImageView(rect);
            uiImageView.image = uiImage
            return uiImageView;
        });
    },
    createShotButton: function() {
        this.shotButton = ShotButton.alloc().initWithFrame(CGRectMake(130, 500, 60, 60));
        this.shotButton.addTargetActionForControlEvents(this, "takePhoto", UIControlEvents.UIControlEventTouchUpInside);
        this.view.addSubview(this.shotButton);
    },
    takePhoto: function () {
        var videoConnection = this.output.connections[0];
        this.output.captureStillImageAsynchronouslyFromConnectionCompletionHandler(videoConnection, function (buffer, error) {
            var imageData = AVCaptureStillImageOutput.jpegStillImageNSDataRepresentation(buffer);
            var image = new UIImage(imageData);
            UIImageWriteToSavedPhotosAlbum(image, null, null, null);
            AudioServicesPlaySystemSound(144);
        });
    },
    subscribeDialEditBeginEnd: function (control) {
        control.addTargetActionForControlEvents(this, "dialBeginEdit", UIControlEvents.UIControlEventEditingDidBegin);
        control.addTargetActionForControlEvents(this, "dialEndEdit", UIControlEvents.UIControlEventEditingDidEnd);
    },
    dialBeginEdit: function (control) {
        UIView.beginAnimationsContext(null, null);
        UIView.setAnimationDelegate(this);
        UIView.setAnimationCurve(UIViewAnimationCurve.UIViewAnimationCurveEaseOut);
        UIView.setAnimationDuration(0.2);

        this.whiteBalance.alpha = control == this.whiteBalance ? 1 : 0;
        this.iso.alpha = control == this.iso ? 1 : 0;
        this.exposure.alpha = control == this.exposure ? 1 : 0;

        UIView.commitAnimations();
    },
    dialEndEdit: function (control) {
        UIView.beginAnimationsContext(null, null);
        UIView.setAnimationDelegate(this);
        UIView.setAnimationCurve(UIViewAnimationCurve.UIViewAnimationCurveEaseOut);
        UIView.setAnimationDuration(0.2);

        this.whiteBalance.alpha = 1;
        this.iso.alpha = 1;
        this.exposure.alpha = 1;

        UIView.commitAnimations();
    },
    updateCamera: function () {
        this.device.lockForConfiguration(null);
        this.device.whiteBalanceMode = this.whiteBalance.value.auto ? AVCaptureWhiteBalanceMode.ContinuousAutoWhiteBalance : AVCaptureWhiteBalanceMode.Locked;
        if (!this.whiteBalance.value.auto) {
            this.device.setWhiteBalanceModeLockedWithDeviceWhiteBalanceGainsCompletionHandler(this.whiteBalance.value, null);
        }
        this.device.setExposureModeCustomWithDurationISOCompletionHandler({ value: this.exposure.value, timescale: 1000, epoch: 0, flags: 1 }, this.iso.value, null);
        this.device.unlockForConfiguration();
    },
    shouldAutorotate: function () {
        return false;
    }
}, {
    exposedMethods: {
        'dialBeginEdit': 'v@',
        'dialEndEdit': 'v@',
        'updateCamera': 'v',
        'takePhoto': 'v'
    }
});

var AppDelegate = UIResponder.extend({
    applicationDidFinishLaunchingWithOptions: function () {
        this._window = new UIWindow(UIScreen.mainScreen().bounds);
        this._window.backgroundColor = UIColor.blackColor();
        this._window.rootViewController = new CameraViewController();
        this._window.makeKeyAndVisible();
        return true;
    }
}, {
    name: "AppDelegate",
    protocols: [UIApplicationDelegate]
});

UIApplicationMain(0, null, null, "AppDelegate");