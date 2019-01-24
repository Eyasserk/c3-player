(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/common'), require('rxjs/operators'), require('kurento-utils-browser'), require('@angular/core'), require('rxjs'), require('@angular/platform-browser/animations'), require('@angular/material/slider'), require('ngx-spinner'), require('ngx-modal-dialog')) :
    typeof define === 'function' && define.amd ? define('c3-player', ['exports', '@angular/common', 'rxjs/operators', 'kurento-utils-browser', '@angular/core', 'rxjs', '@angular/platform-browser/animations', '@angular/material/slider', 'ngx-spinner', 'ngx-modal-dialog'], factory) :
    (factory((global['c3-player'] = {}),global.ng.common,global.rxjs.operators,global.kurentoUtilsBrowser,global.ng.core,global.rxjs,global.ng.platformBrowser.animations,global.ng.material.slider,global.ngxSpinner,global.ngxModalDialog));
}(this, (function (exports,common,operators,kurentoUtilsBrowser,i0,rxjs,animations,slider,ngxSpinner,ngxModalDialog) { 'use strict';

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */
    var MathService = /** @class */ (function () {
        function MathService() {
        }
        /**
         * @param {?} i
         * @return {?}
         */
        MathService.prototype.pad = /**
         * @param {?} i
         * @return {?}
         */
            function (i) {
                return (i < 10) ? "0" + i : "" + i;
            };
        /**
         * @param {?} i
         * @return {?}
         */
        MathService.prototype.padm = /**
         * @param {?} i
         * @return {?}
         */
            function (i) {
                return (i < 10) ? "0" + i.toFixed(1) : "" + i.toFixed(1);
            };
        MathService.decorators = [
            { type: i0.Injectable, args: [{
                        providedIn: 'root'
                    },] }
        ];
        /** @nocollapse */
        MathService.ctorParameters = function () { return []; };
        /** @nocollapse */ MathService.ngInjectableDef = i0.defineInjectable({ factory: function MathService_Factory() { return new MathService(); }, token: MathService, providedIn: "root" });
        return MathService;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */
    /** @enum {number} */
    var EventType = {
        RemotePlayStarted: 0,
        RemotePlayStopped: 1,
        RemotePlayPaused: 2,
        RemotePlayResumed: 3,
        RemotePlayEnded: 4,
        RemotePlaySeeked: 5,
        RemotePlayFailed: 6,
        RemoteConnectionReset: 7,
        RemoteSeekFailed: 8,
        LocalConnectionError: 9,
        LocalAudioLevel: 10,
        LocalAudioLevelError: 11,
        WebSocketFailed: 12,
    };
    EventType[EventType.RemotePlayStarted] = 'RemotePlayStarted';
    EventType[EventType.RemotePlayStopped] = 'RemotePlayStopped';
    EventType[EventType.RemotePlayPaused] = 'RemotePlayPaused';
    EventType[EventType.RemotePlayResumed] = 'RemotePlayResumed';
    EventType[EventType.RemotePlayEnded] = 'RemotePlayEnded';
    EventType[EventType.RemotePlaySeeked] = 'RemotePlaySeeked';
    EventType[EventType.RemotePlayFailed] = 'RemotePlayFailed';
    EventType[EventType.RemoteConnectionReset] = 'RemoteConnectionReset';
    EventType[EventType.RemoteSeekFailed] = 'RemoteSeekFailed';
    EventType[EventType.LocalConnectionError] = 'LocalConnectionError';
    EventType[EventType.LocalAudioLevel] = 'LocalAudioLevel';
    EventType[EventType.LocalAudioLevelError] = 'LocalAudioLevelError';
    EventType[EventType.WebSocketFailed] = 'WebSocketFailed';

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */
    var KurentoService = /** @class */ (function () {
        /**
         * Creates a new Kurento Service
         * @param ws WEb Socket Connection
         * @param audioSource Audio URL
         */
        function KurentoService(ws, audioSource, video, eventService) {
            this.ws = ws;
            this.audioSource = audioSource;
            this.video = video;
            this.eventService = eventService;
        }
        /**
         * Starts playing the streamed audio
         */
        /**
         * Starts playing the streamed audio
         * @param {?} millis
         * @return {?}
         */
        KurentoService.prototype.start = /**
         * Starts playing the streamed audio
         * @param {?} millis
         * @return {?}
         */
            function (millis) {
                var _this = this;
                console.log("RTC service: Playing audio at initial position: " + millis);
                /** @type {?} */
                var userMediaConstraints = {
                    audio: true,
                    video: false
                };
                /** @type {?} */
                var options = {
                    remoteVideo: this.video.nativeElement,
                    mediaConstraints: userMediaConstraints,
                    onicecandidate: function (candidate) {
                        console.log('RTC service: Local candidate ' + JSON.stringify(candidate));
                        /** @type {?} */
                        var message = {
                            id: 'onIceCandidate',
                            candidate: candidate
                        };
                        try {
                            _this.sendMessage(message);
                        }
                        catch (error) {
                            /** @type {?} */
                            var event_1 = { type: EventType.WebSocketFailed, value: { reason: error } };
                            _this.eventService.Emitter.next(event_1);
                        }
                    }
                };
                this.webRtcPeer = kurentoUtilsBrowser.WebRtcPeer.WebRtcPeerRecvonly(options, function (error) {
                    if (error) {
                        console.error("Error creating the peer connection: %s", error);
                        /** @type {?} */
                        var event_2 = { type: EventType.RemotePlayFailed, value: { at: "start", reason: error } };
                        _this.eventService.Emitter.next(event_2);
                    }
                    else {
                        _this.webRtcPeer.generateOffer(function (error, sdp) {
                            if (error) {
                                console.error("Error generating the offer: %s", error);
                                /** @type {?} */
                                var event_3 = { type: EventType.RemotePlayFailed, value: { at: "start", reason: error } };
                                _this.eventService.Emitter.next(event_3);
                            }
                            else {
                                /** @type {?} */
                                var message = {
                                    id: 'start',
                                    sdpOffer: sdp,
                                    position: millis,
                                    videourl: _this.audioSource
                                };
                                console.log("Sending start message");
                                try {
                                    _this.sendMessage(message);
                                }
                                catch (error) {
                                    /** @type {?} */
                                    var event_4 = { type: EventType.WebSocketFailed, value: { reason: error } };
                                    _this.eventService.Emitter.next(event_4);
                                }
                            }
                        });
                    }
                });
            };
        /**
         * Stops the streaming
         */
        /**
         * Stops the streaming
         * @return {?}
         */
        KurentoService.prototype.stop = /**
         * Stops the streaming
         * @return {?}
         */
            function () {
                console.log("RTC service: Stopping audio");
                if (this.webRtcPeer) {
                    try {
                        this.webRtcPeer.dispose();
                        this.webRtcPeer = null;
                        /** @type {?} */
                        var message = {
                            id: 'stop'
                        };
                        this.sendMessage(message);
                        /** @type {?} */
                        var event_5 = { type: EventType.RemotePlayStopped, value: {} };
                        this.eventService.Emitter.next(event_5);
                    }
                    catch (error) {
                        console.error("Error stopping the player: %s", error);
                        /** @type {?} */
                        var event_6 = { type: EventType.RemotePlayFailed, value: { at: "stop", reason: error } };
                        this.eventService.Emitter.next(event_6);
                    }
                }
                else {
                    console.error("Error stopping the player: peer connection is closed");
                    /** @type {?} */
                    var event_7 = { type: EventType.RemotePlayFailed, value: { at: "stop", reason: "Peer connection is closed" } };
                    this.eventService.Emitter.next(event_7);
                }
            };
        /**
         * Resets the Peer connection
         */
        /**
         * Resets the Peer connection
         * @return {?}
         */
        KurentoService.prototype.resetConnection = /**
         * Resets the Peer connection
         * @return {?}
         */
            function () {
                console.log("RTC service: resetting peer connection");
                if (this.webRtcPeer) {
                    try {
                        this.webRtcPeer.dispose();
                        this.webRtcPeer = null;
                        /** @type {?} */
                        var event_8 = { type: EventType.RemoteConnectionReset, value: {} };
                        this.eventService.Emitter.next(event_8);
                    }
                    catch (error) {
                        console.error("Error resetting the peer connection: %s", error);
                        /** @type {?} */
                        var event_9 = { type: EventType.LocalConnectionError, value: { at: "resetConnection", reason: error } };
                        this.eventService.Emitter.next(event_9);
                    }
                }
            };
        /**
         * Moves to the specified millisecond
         * @param time: played time in milliseconds
         */
        /**
         * Moves to the specified millisecond
         * @param {?} time
         * @return {?}
         */
        KurentoService.prototype.doSeekAt = /**
         * Moves to the specified millisecond
         * @param {?} time
         * @return {?}
         */
            function (time) {
                console.log("RTC service: doing seek at %s", time.toString());
                try {
                    /** @type {?} */
                    var message = {
                        id: 'doSeek',
                        position: time
                    };
                    this.sendMessage(message);
                    /** @type {?} */
                    var event_10 = { type: EventType.RemotePlaySeeked, value: { seekTime: time } };
                    this.eventService.Emitter.next(event_10);
                }
                catch (error) {
                    console.error("Error doing seek: %s", error);
                    /** @type {?} */
                    var event_11 = { type: EventType.RemoteSeekFailed, value: { at: "doSeek", reason: error } };
                    this.eventService.Emitter.next(event_11);
                }
            };
        /**
         * Pauses the streaming
         */
        /**
         * Pauses the streaming
         * @return {?}
         */
        KurentoService.prototype.pause = /**
         * Pauses the streaming
         * @return {?}
         */
            function () {
                console.log("RTC service: Pausing audio");
                try {
                    /** @type {?} */
                    var message = {
                        id: 'pause'
                    };
                    this.sendMessage(message);
                    /** @type {?} */
                    var event_12 = { type: EventType.RemotePlayPaused, value: {} };
                    this.eventService.Emitter.next(event_12);
                }
                catch (error) {
                    console.error("Error pausing the streaming: %s", error);
                    /** @type {?} */
                    var event_13 = { type: EventType.RemotePlayFailed, value: { at: "pause", reason: error } };
                    this.eventService.Emitter.next(event_13);
                }
            };
        /**
         * Resumes the streaming
         */
        /**
         * Resumes the streaming
         * @return {?}
         */
        KurentoService.prototype.resume = /**
         * Resumes the streaming
         * @return {?}
         */
            function () {
                console.log("RTC service: Resuming audio");
                try {
                    /** @type {?} */
                    var message = {
                        id: 'resume'
                    };
                    this.sendMessage(message);
                    /** @type {?} */
                    var event_14 = { type: EventType.RemotePlayResumed, value: {} };
                    this.eventService.Emitter.next(event_14);
                }
                catch (error) {
                    console.error("Error resuming the streaming: %s", error);
                    /** @type {?} */
                    var event_15 = { type: EventType.WebSocketFailed, value: { reason: error } };
                    this.eventService.Emitter.next(event_15);
                }
            };
        /**
         * @return {?}
         */
        KurentoService.prototype.mute = /**
         * @return {?}
         */
            function () {
                if (this.webRtcPeer) {
                    try {
                        this.webRtcPeer.getRemoteStream().getAudioTracks().forEach(function (track) {
                            track.enabled = false;
                        });
                        /** @type {?} */
                        var event_16 = { type: EventType.LocalAudioLevel, value: { action: "mute" } };
                        this.eventService.Emitter.next(event_16);
                    }
                    catch (error) {
                        console.error("Error muting audio: %s", error);
                        /** @type {?} */
                        var event_17 = { type: EventType.LocalAudioLevelError, value: { at: "mute", reason: error } };
                        this.eventService.Emitter.next(event_17);
                    }
                }
                else {
                    /** @type {?} */
                    var event_18 = { type: EventType.LocalAudioLevel, value: { action: "mute" } };
                    this.eventService.Emitter.next(event_18);
                }
            };
        /**
         * @return {?}
         */
        KurentoService.prototype.unmute = /**
         * @return {?}
         */
            function () {
                if (this.webRtcPeer) {
                    try {
                        this.webRtcPeer.getRemoteStream().getAudioTracks().forEach(function (track) {
                            track.enabled = true;
                        });
                        /** @type {?} */
                        var event_19 = { type: EventType.LocalAudioLevel, value: { action: "unmute" } };
                        this.eventService.Emitter.next(event_19);
                    }
                    catch (error) {
                        console.error("Error unmuting audio: %s", error);
                        /** @type {?} */
                        var event_20 = { type: EventType.LocalAudioLevelError, value: { at: "unmute", reason: error } };
                        this.eventService.Emitter.next(event_20);
                    }
                }
                else {
                    /** @type {?} */
                    var event_21 = { type: EventType.LocalAudioLevel, value: { action: "unmute" } };
                    this.eventService.Emitter.next(event_21);
                }
            };
        /**
         * Processes the SDP answer
         * @param sdpAnswer SDP answer as string
         * @param callback callback
         */
        /**
         * Processes the SDP answer
         * @param {?} sdpAnswer SDP answer as string
         * @param {?} callback callback
         * @return {?}
         */
        KurentoService.prototype.processAnswer = /**
         * Processes the SDP answer
         * @param {?} sdpAnswer SDP answer as string
         * @param {?} callback callback
         * @return {?}
         */
            function (sdpAnswer, callback) {
                console.log("RTC service: Processing SDP answer: %s", sdpAnswer);
                this.webRtcPeer.processAnswer(sdpAnswer, callback);
            };
        /**
         * Adds ICE candidate
         * @param candidate candidate
         * @param callback callback
         */
        /**
         * Adds ICE candidate
         * @param {?} candidate candidate
         * @param {?} callback callback
         * @return {?}
         */
        KurentoService.prototype.addIceCandidate = /**
         * Adds ICE candidate
         * @param {?} candidate candidate
         * @param {?} callback callback
         * @return {?}
         */
            function (candidate, callback) {
                console.log("RTC service: Adding Ice Candidate: %s", JSON.stringify(candidate));
                this.webRtcPeer.addIceCandidate(candidate, callback);
            };
        /**
         * @param {?} message
         * @return {?}
         */
        KurentoService.prototype.sendMessage = /**
         * @param {?} message
         * @return {?}
         */
            function (message) {
                if (this.ws.readyState == 1) {
                    this.ws.send(JSON.stringify(message));
                }
                else {
                    throw new Error("Websocket is closed");
                }
            };
        return KurentoService;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */
    var EventService = /** @class */ (function () {
        function EventService() {
            this.emitter = new rxjs.BehaviorSubject(null);
        }
        Object.defineProperty(EventService.prototype, "Emitter", {
            get: /**
             * @return {?}
             */ function () {
                return this.emitter;
            },
            enumerable: true,
            configurable: true
        });
        EventService.decorators = [
            { type: i0.Injectable, args: [{
                        providedIn: 'root'
                    },] }
        ];
        /** @nocollapse */
        EventService.ctorParameters = function () { return []; };
        /** @nocollapse */ EventService.ngInjectableDef = i0.defineInjectable({ factory: function EventService_Factory() { return new EventService(); }, token: EventService, providedIn: "root" });
        return EventService;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */
    var C3playerComponent = /** @class */ (function () {
        function C3playerComponent(mathService, eventService, spinner, modalService, viewRef) {
            var _this = this;
            this.mathService = mathService;
            this.eventService = eventService;
            this.spinner = spinner;
            this.modalService = modalService;
            this.viewRef = viewRef;
            //milliseconds
            this.wantedTime = 0; //tooltip
            this.componentWidth = "100%";
            this.componentMargin = "auto";
            this.imgRelation = 5;
            eventService.Emitter.subscribe(function (event) {
                if (event) {
                    switch (event.type) {
                        case EventType.LocalConnectionError: {
                            _this.spinner.hide();
                            _this.playing.next(false);
                            _this.displayErrorMessage("Error in connection");
                            break;
                        }
                        case EventType.RemotePlayStarted: {
                            _this.firstTime.next(false);
                            _this.playing.next(true);
                            _this.kurentoService.doSeekAt(_this.playedTime);
                            break;
                        }
                        case EventType.RemotePlayPaused: {
                            _this.playing.next(false);
                            break;
                        }
                        case EventType.RemotePlayStopped: {
                            _this.playedTime = 0;
                            _this.firstTime.next(true);
                            _this.playing.next(false);
                            break;
                        }
                        case EventType.RemotePlayEnded: {
                            _this.playing.next(false);
                            _this.playedTime = 0;
                            break;
                        }
                        case EventType.RemotePlaySeeked: {
                            _this.spinner.hide();
                            _this.playedTime = event.value.seekTime;
                            break;
                        }
                        case EventType.RemoteSeekFailed: {
                            _this.spinner.hide();
                            _this.playing.next(false);
                            _this.displayErrorMessage("Server error");
                            break;
                        }
                        case EventType.RemotePlayResumed: {
                            _this.spinner.hide();
                            _this.playing.next(true);
                            break;
                        }
                        case EventType.WebSocketFailed: {
                            _this.spinner.hide();
                            _this.displayErrorMessage("Connection to the server failed");
                            break;
                        }
                        case EventType.LocalAudioLevel: {
                            if (event.value && event.value.action) {
                                switch (event.value.action) {
                                    case "mute": {
                                        _this.muted.next(true);
                                        break;
                                    }
                                    case "unmute": {
                                        _this.muted.next(false);
                                        break;
                                    }
                                    default: {
                                        console.error("Received unknown Local Audio Level event: %s", event.value.action);
                                    }
                                }
                            }
                            else {
                                console.error("Received incorrect Local Audio Level event: %s", JSON.stringify(event));
                            }
                            break;
                        }
                        case EventType.LocalAudioLevelError: {
                            _this.displayErrorMessage("Error at audio control");
                            break;
                        }
                        case EventType.RemotePlayFailed: {
                            _this.spinner.hide();
                            _this.playing.next(false);
                            break;
                        }
                        case EventType.RemoteConnectionReset: {
                            _this.spinner.hide();
                            _this.firstTime.next(true);
                            _this.playing.next(false);
                            _this.playedTime = 0;
                        }
                        default: {
                            console.error("Unrecognized event type '%s'", event.type);
                        }
                    }
                }
            });
        }
        /**
         * @return {?}
         */
        C3playerComponent.prototype.ngOnInit = /**
         * @return {?}
         */
            function () {
                var _this = this;
                //Initializing global variables
                this.firstTime = new rxjs.BehaviorSubject(true);
                this.wsConnected = new rxjs.BehaviorSubject(false);
                this.muted = new rxjs.BehaviorSubject(false);
                this.playedTime = 0;
                this.offset = Math.round(this.totalDuration / 100);
                if (this.offset < 1000) {
                    this.offset = 1000;
                }
                if (this.offset > 4000) {
                    this.offset = 4000;
                }
                this.playing = new rxjs.BehaviorSubject(false);
                this.tooltipDisplay.nativeElement.style.display = "none";
                this.spinner.hide();
                //Play timer
                this._timer = rxjs.timer(0, 100).pipe(operators.filter(function () { return _this.playing.value === true; })).subscribe(function (t) {
                    _this.playedTime += 100;
                    if (_this.playedTime >= (_this.totalDuration + _this.offset)) {
                        _this.stop();
                    }
                });
                //Connection
                this.ws = new WebSocket(this.wsUrl);
                this.kurentoService = new KurentoService(this.ws, this.audioSource, this.video, this.eventService);
                //WebSocket event handling
                /** @type {?} */
                var context = this;
                this.ws.onopen = function (e) {
                    console.log("C3player service: Connection established with Kurento");
                    context.wsConnected.next(true);
                };
                this.ws.onclose = function (e) {
                    _this.spinner.hide();
                    console.log("C3Player service: Connection closed");
                    context.wsConnected.next(false);
                    context.stop();
                };
                this.ws.onerror = function (e) {
                    _this.spinner.hide();
                    console.error("An error has occured: %s", e);
                    _this.displayErrorMessage("Connection with server failed");
                    context.stop();
                };
                this.ws.onmessage = function (e) {
                    console.log("Message received: " + e.data);
                    /** @type {?} */
                    var message = JSON.parse(e.data);
                    switch (message.id) {
                        case "playStarted": {
                            /** @type {?} */
                            var event_1 = { type: EventType.RemotePlayStarted, value: {} };
                            _this.eventService.Emitter.next(event_1);
                            break;
                        }
                        case "startResponse": {
                            console.log("Received start response");
                            context.kurentoService.processAnswer(message.sdpAnswer, function (error) {
                                if (error) {
                                    console.error("Error processing response: %s", error);
                                }
                                else {
                                    console.log("C3Player service: SDP response processed");
                                }
                            });
                            break;
                        }
                        case "error": {
                            console.error("Error in websocket: %s", message.message);
                            break;
                        }
                        case "playEnd": {
                            console.log("C3Player service: Play ended");
                            context.firstTime.next(true);
                            context.playing.next(false);
                            context.playedTime = 0;
                            break;
                        }
                        case "videoInfo": {
                            context.totalDuration = message.videoDuration;
                            break;
                        }
                        case "iceCandidate": {
                            context.kurentoService.addIceCandidate(message.candidate, function (error) {
                                if (error) {
                                    console.error("Error adding candidate: %s", error);
                                }
                                else {
                                    console.log("Added candidate %s", JSON.stringify(message.candidate));
                                }
                            });
                            break;
                        }
                        case "seek": {
                            console.log("C3Player service: Seek Done -> %s", message.message);
                            if (message.message !== "ok") {
                                _this.displayErrorMessage("An error has occured");
                            }
                            break;
                        }
                        case "position": {
                            context.playedTime = message.position;
                            break;
                        }
                        default: {
                            console.log("C3Player service: Unrecognized message received -> %s", message.id);
                        }
                    }
                };
            };
        /**
         * @return {?}
         */
        C3playerComponent.prototype.ngOnDestroy = /**
         * @return {?}
         */
            function () {
                this._timer.unsubscribe();
                this.kurentoService.resetConnection();
                this.ws.close();
            };
        /**
         * @return {?}
         */
        C3playerComponent.prototype.getPlayedHours = /**
         * @return {?}
         */
            function () {
                return this.mathService.pad(Math.floor(this.playedTime / 3600000));
            };
        /**
         * @return {?}
         */
        C3playerComponent.prototype.getPlayedMinutes = /**
         * @return {?}
         */
            function () {
                return this.mathService.pad(Math.floor(((this.playedTime / 1000) % 3600) / 60));
            };
        /**
         * @return {?}
         */
        C3playerComponent.prototype.getPlayedSeconds = /**
         * @return {?}
         */
            function () {
                return this.mathService.padm((this.playedTime / 1000) % 60);
            };
        /**
         * @return {?}
         */
        C3playerComponent.prototype.getTotalHours = /**
         * @return {?}
         */
            function () {
                return this.mathService.pad(Math.floor(this.totalDuration / 3600000));
            };
        /**
         * @return {?}
         */
        C3playerComponent.prototype.getTotalMinutes = /**
         * @return {?}
         */
            function () {
                return this.mathService.pad(Math.floor(((this.totalDuration / 1000) % 3600) / 60));
            };
        /**
         * @return {?}
         */
        C3playerComponent.prototype.getTotalSeconds = /**
         * @return {?}
         */
            function () {
                return this.mathService.pad(Math.round(this.totalDuration / 1000) % 60);
            };
        /**
         * @return {?}
         */
        C3playerComponent.prototype.getWantedHours = /**
         * @return {?}
         */
            function () {
                return this.mathService.pad(Math.floor(this.wantedTime / 3600000));
            };
        /**
         * @return {?}
         */
        C3playerComponent.prototype.getWantedMinutes = /**
         * @return {?}
         */
            function () {
                return this.mathService.pad(Math.floor(((this.wantedTime / 1000) % 3600) / 60));
            };
        /**
         * @return {?}
         */
        C3playerComponent.prototype.getWantedSeconds = /**
         * @return {?}
         */
            function () {
                return this.mathService.pad(Math.floor((this.wantedTime / 1000) % 60));
            };
        /**
         * @return {?}
         */
        C3playerComponent.prototype.getSeekPosition = /**
         * @return {?}
         */
            function () {
                return Math.floor((this.playedTime / this.totalDuration) * this.player.nativeElement.offsetWidth);
            };
        /**
         * TODO implementar metodos
         */
        /**
         * TODO implementar metodos
         * @return {?}
         */
        C3playerComponent.prototype.play = /**
         * TODO implementar metodos
         * @return {?}
         */
            function () {
                if (this.playing.value === true) {
                    //Pause the video
                    this.kurentoService.pause();
                }
                else {
                    if (this.firstTime.value === true) {
                        //Play
                        this.spinner.show();
                        this.kurentoService.unmute();
                        this.kurentoService.start(this.playedTime);
                    }
                    else {
                        //Resume
                        this.spinner.show();
                        this.kurentoService.resume();
                    }
                }
            };
        /**
         * @return {?}
         */
        C3playerComponent.prototype.stop = /**
         * @return {?}
         */
            function () {
                if (this.wsConnected.value === true) {
                    this.kurentoService.unmute();
                    this.kurentoService.stop();
                }
                else {
                    this.playedTime = 0;
                    this.firstTime.next(true);
                    this.playing.next(false);
                }
            };
        /**
         * @param {?} event
         * @return {?}
         */
        C3playerComponent.prototype.seekClicked = /**
         * @param {?} event
         * @return {?}
         */
            function (event) {
            };
        /**
         * @param {?} event
         * @return {?}
         */
        C3playerComponent.prototype.seekReleased = /**
         * @param {?} event
         * @return {?}
         */
            function (event) {
                //set playedTime and seekPosition
                this.spinner.show();
                /** @type {?} */
                var clicked = Math.floor(this.totalDuration * (event.offsetX / this.player.nativeElement.offsetWidth));
                this.kurentoService.doSeekAt(clicked);
            };
        /**
         * @return {?}
         */
        C3playerComponent.prototype.seekDragged = /**
         * @return {?}
         */
            function () {
                console.log("Seek dragged");
            };
        /**
         * @param {?} event
         * @return {?}
         */
        C3playerComponent.prototype.onDragStart = /**
         * @param {?} event
         * @return {?}
         */
            function (event) {
                console.log("Drag start");
            };
        /**
         * @param {?} event
         * @return {?}
         */
        C3playerComponent.prototype.onDragEnd = /**
         * @param {?} event
         * @return {?}
         */
            function (event) {
                console.log("Drag end");
            };
        /**
         * @param {?} event
         * @return {?}
         */
        C3playerComponent.prototype.onMouseOverSeek = /**
         * @param {?} event
         * @return {?}
         */
            function (event) {
                this.tooltipDisplay.nativeElement.style.display = "inline-block";
                this.tooltipDisplay.nativeElement.style.transform = "translate(" + event.offsetX + "px," + (15 + event.offsetY) + "px)";
            };
        /**
         * @param {?} event
         * @return {?}
         */
        C3playerComponent.prototype.onMouseExitSeek = /**
         * @param {?} event
         * @return {?}
         */
            function (event) {
                this.tooltipDisplay.nativeElement.style.display = "none";
            };
        /**
         * @param {?} event
         * @return {?}
         */
        C3playerComponent.prototype.onMouseMoveSeek = /**
         * @param {?} event
         * @return {?}
         */
            function (event) {
                this.wantedTime = Math.floor(this.totalDuration * (event.offsetX / this.player.nativeElement.offsetWidth));
                if (this.player.nativeElement.offsetWidth - event.offsetX <= 55) {
                    this.tooltipDisplay.nativeElement.style.transform = "translate(" + (event.offsetX - 55) + "px," + (15 + event.offsetY) + "px)";
                }
                else {
                    this.tooltipDisplay.nativeElement.style.transform = "translate(" + event.offsetX + "px," + (15 + event.offsetY) + "px)";
                }
            };
        /**
         * @param {?} error
         * @return {?}
         */
        C3playerComponent.prototype.displayErrorMessage = /**
         * @param {?} error
         * @return {?}
         */
            function (error) {
                this.modalService.openDialog(this.viewRef, {
                    title: 'Error',
                    childComponent: ngxModalDialog.SimpleModalComponent,
                    data: {
                        text: "Error occured while playing the audio: <strong>" + error + "</strong>"
                    },
                    settings: {
                        closeButtonClass: 'close theme-icon-close',
                        headerTitleClass: "text-danger"
                    },
                    actionButtons: [
                        {
                            text: 'Close',
                            buttonClass: "btn btn-default",
                            onAction: function () {
                                return new Promise(function (resolve) {
                                    resolve();
                                });
                            }
                        }
                    ]
                });
            };
        /**
         * @return {?}
         */
        C3playerComponent.prototype.switchSound = /**
         * @return {?}
         */
            function () {
                if (this.muted.value === true) {
                    this.kurentoService.unmute();
                }
                else {
                    this.kurentoService.mute();
                }
            };
        /**
         * @return {?}
         */
        C3playerComponent.prototype.getOptimHeight = /**
         * @return {?}
         */
            function () {
                return Math.round(this.player.nativeElement.offsetWidth / this.imgRelation) + "px";
            };
        C3playerComponent.decorators = [
            { type: i0.Component, args: [{
                        selector: 'c3-player',
                        template: "<div class=\"player jquery-trackswitch\" [style.width]=\"componentWidth\" [style.margin]=\"componentMargin\" #c3player>\n    <div class=\"main-control\">\n        <div class=\"seekable-img-wrap\" style=\"display: block;\">\n            <div class=\"seekable\" data-seek-margin-left=\"0\" data-seek-margin-right=\"0\" [style.background]=\"'url('+imageSource+')'\" [style.background-size]=\"'contain'\" [style.background-repeat]=\"'no-repeat'\" [style.height]=\"getOptimHeight()\" [style.width]=\"'auto'\">\n                <div class=\"inner\" [style.background]=\"'url('+imageSource+')'\" [style.background-size]=\"'cover'\" [style.height]=\"getOptimHeight()\" [style.width]=\"getSeekPosition()+'px'\"></div>\n                <svg>\n                    <filter id=\"blue-wash\">\n                    <feColorMatrix type=\"matrix\" values=\"0 1.0 0 0 0 -0.2 1.0 0 0 0 0 0.6 1 0 0 0 0 0 1 0\"/>\n                    </filter>\n                </svg>\n            </div>\n            <div class=\"seekwrap seekwrap-custom\"  \n                (mousedown)=\"seekClicked($event)\" \n                (mouseup)=\"seekReleased($event)\" \n                (mouseover)=\"onMouseOverSeek($event)\" \n                (mouseout)=\"onMouseExitSeek($event)\"\n                (mousemove)=\"onMouseMoveSeek($event)\">\n                <div class=\"seekhead\" [style.transform]=\"'translate('+getSeekPosition()+'px,0px)'\" #seekbar>\n                </div>\n                <span class=\"seek-tooltip\" #tooltipDisplay [style.padding]=\"'3px'\" [style.border-radius]=\"'1px'\">{{getWantedHours()}}:{{getWantedMinutes()}}:{{getWantedSeconds()}}</span>\n            </div>\n            <div style=\"display: none;\">\n                <audio id=\"gum-local\" controls autoplay #videoelement></audio>\n            </div>\n        </div>\n        <ul class=\"control\">\n            <li class=\"playpause {{playing.value ? 'checked':'' }} button\" (click)=\"play()\">Play</li>\n            <li class=\"stop button\" (click)=\"stop()\">Stop</li>\n            <li class=\"volume {{muted.value ? 'checked':'' }} button\" (click)=\"switchSound()\">Sound</li>\n            <li class=\"timing\"><span class=\"time\">{{getPlayedHours()}}:{{getPlayedMinutes()}}:{{getPlayedSeconds()}}</span> / <span class=\"length\">{{getTotalHours()}}:{{getTotalMinutes()}}:{{getTotalSeconds()}}</span></li>\n            <li class=\"seekwrap\" style=\"display: none;\">\n                <div class=\"seekbar\">\n                    <div class=\"seekhead\"></div>\n                </div>\n            </li>\n        </ul>\n        <ngx-spinner></ngx-spinner>\n    </div>\n</div>\n",
                        styles: ["html{position:relative;min-height:100%}body{padding-top:40px}.seekwrap-custom{left:0;right:0}.inner{position:absolute;left:0;-webkit-filter:url(#blue-wash);filter:url(#blue-wash)}.seek-tooltip{background-color:#000;margin:0 auto;color:#eee;font-size:15px;font-family:'Lucida Sans','Lucida Sans Regular','Lucida Grande','Lucida Sans Unicode',Geneva,Verdana,sans-serif}.hidden-video{display:none}#console,video{display:block;font-size:14px;line-height:1.42857143;color:#555;background-color:#fff;background-image:none;border:1px solid #ccc;border-radius:4px;box-shadow:inset 0 1px 1px rgba(0,0,0,.075);transition:border-color .15s ease-in-out,box-shadow .15s ease-in-out}#console{overflow-y:auto;width:100%;height:175px}#videoContainer{position:absolute;float:left}#videoBig{width:640px;height:480px;top:0;left:0;z-index:1}div#videoSmall{width:240px;height:180px;padding:0;position:absolute;top:15px;left:400px;cursor:pointer;z-index:10}div.dragged{cursor:all-scroll!important;border-color:#00f!important;z-index:10!important}.jquery-trackswitch a,.jquery-trackswitch abbr,.jquery-trackswitch acronym,.jquery-trackswitch address,.jquery-trackswitch applet,.jquery-trackswitch article,.jquery-trackswitch aside,.jquery-trackswitch audio,.jquery-trackswitch b,.jquery-trackswitch big,.jquery-trackswitch blockquote,.jquery-trackswitch canvas,.jquery-trackswitch caption,.jquery-trackswitch center,.jquery-trackswitch cite,.jquery-trackswitch code,.jquery-trackswitch dd,.jquery-trackswitch del,.jquery-trackswitch details,.jquery-trackswitch dfn,.jquery-trackswitch div,.jquery-trackswitch dl,.jquery-trackswitch dt,.jquery-trackswitch em,.jquery-trackswitch embed,.jquery-trackswitch fieldset,.jquery-trackswitch figcaption,.jquery-trackswitch figure,.jquery-trackswitch footer,.jquery-trackswitch form,.jquery-trackswitch h1,.jquery-trackswitch h2,.jquery-trackswitch h3,.jquery-trackswitch h4,.jquery-trackswitch h5,.jquery-trackswitch h6,.jquery-trackswitch header,.jquery-trackswitch hgroup,.jquery-trackswitch i,.jquery-trackswitch iframe,.jquery-trackswitch img,.jquery-trackswitch ins,.jquery-trackswitch kbd,.jquery-trackswitch label,.jquery-trackswitch legend,.jquery-trackswitch li,.jquery-trackswitch mark,.jquery-trackswitch menu,.jquery-trackswitch nav,.jquery-trackswitch object,.jquery-trackswitch ol,.jquery-trackswitch output,.jquery-trackswitch p,.jquery-trackswitch pre,.jquery-trackswitch q,.jquery-trackswitch ruby,.jquery-trackswitch s,.jquery-trackswitch samp,.jquery-trackswitch section,.jquery-trackswitch small,.jquery-trackswitch span,.jquery-trackswitch strike,.jquery-trackswitch strong,.jquery-trackswitch sub,.jquery-trackswitch summary,.jquery-trackswitch sup,.jquery-trackswitch table,.jquery-trackswitch tbody,.jquery-trackswitch td,.jquery-trackswitch tfoot,.jquery-trackswitch th,.jquery-trackswitch thead,.jquery-trackswitch time,.jquery-trackswitch tr,.jquery-trackswitch tt,.jquery-trackswitch u,.jquery-trackswitch ul,.jquery-trackswitch var,.jquery-trackswitch video{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}.jquery-trackswitch article,.jquery-trackswitch aside,.jquery-trackswitch details,.jquery-trackswitch figcaption,.jquery-trackswitch figure,.jquery-trackswitch footer,.jquery-trackswitch header,.jquery-trackswitch hgroup,.jquery-trackswitch menu,.jquery-trackswitch nav,.jquery-trackswitch section{display:block}.jquery-trackswitch ol,.jquery-trackswitch ul{list-style:none}.jquery-trackswitch blockquote,.jquery-trackswitch q{quotes:none}.jquery-trackswitch blockquote:after,.jquery-trackswitch blockquote:before,.jquery-trackswitch q:after,.jquery-trackswitch q:before{content:'';content:none}.jquery-trackswitch table{border-collapse:collapse;border-spacing:0}.jquery-trackswitch *,.jquery-trackswitch :after,.jquery-trackswitch :before{box-sizing:border-box}.jquery-trackswitch{background:#eee;position:relative;margin:10px;overflow:hidden;color:#000;line-height:1}.jquery-trackswitch ts-track{display:none}.jquery-trackswitch ul{margin:0;padding:0}.jquery-trackswitch li{margin:0;padding:0;list-style:none}.jquery-trackswitch .control li.button:after,.jquery-trackswitch .overlay span:after,.jquery-trackswitch li.track.error:before{content:\"\";display:block;font-family:FontAwesome;font-style:normal;font-weight:400;font-size:16px;line-height:1;text-indent:0}.jquery-trackswitch .overlay{background-color:rgba(0,0,0,.3);position:absolute;top:0;right:0;bottom:0;left:0;z-index:10}.jquery-trackswitch .overlay #overlayinfo span.info,.jquery-trackswitch .overlay>p,.jquery-trackswitch .overlay>span{display:block;position:absolute;text-align:center}.jquery-trackswitch .overlay>span{background-color:#f1c40f;width:50px;height:50px;top:calc(50% - 25px);left:calc(50% - 25px);text-indent:-9999px;line-height:0;border-radius:100%;cursor:pointer}.jquery-trackswitch .overlay>span.loading{cursor:inherit}.jquery-trackswitch .overlay>span:after{content:\"\\f011\";padding-top:7px;font-size:28pt}.jquery-trackswitch .overlay>span.loading:after{content:\"\\f110\"}.jquery-trackswitch.error .overlay{background:rgba(0,0,0,.6)}.jquery-trackswitch.error .overlay>span{background:#c03328;cursor:inherit}.jquery-trackswitch.error .overlay>span:after{content:\"\\f12a\"}.jquery-trackswitch.error .overlay p{width:100%;top:calc(50% + 35px);color:#fff}.jquery-trackswitch .overlay #overlayinfo{height:40px;width:100%;bottom:5px;right:10px;color:#000;text-align:right;font-size:14pt}.jquery-trackswitch .overlay #overlayinfo span.info{bottom:0;right:0;width:380px;cursor:pointer;text-indent:-9999px;opacity:.4}.jquery-trackswitch .overlay #overlayinfo span.info:after{content:\"\\f05a\";position:absolute;bottom:0;right:0;font-size:16pt}.jquery-trackswitch .overlay #overlayinfo span.text{display:none;position:absolute;right:0}.jquery-trackswitch .overlay #overlayinfo span.text strong{font-weight:700}.jquery-trackswitch .overlay #overlayinfo a{color:#eee;text-decoration:underline}.jquery-trackswitch .main-control ul{background-color:#333;height:auto;min-height:36px;padding:4px 12px;overflow:hidden;color:#ddd}.jquery-trackswitch .main-control .button{float:left;width:15px;margin:7px 10px 0 0;cursor:pointer}.jquery-trackswitch .main-control .timing{float:right;font-family:monospace;margin:7px 0 0 10px}.jquery-trackswitch .main-control .seekwrap{overflow:hidden;height:100%;cursor:pointer}.jquery-trackswitch .main-control .seekwrap .seekbar{background-color:#ed8c01;height:6px;margin:11px 4px 0 0;position:relative;box-shadow:4px 0 0 0 #ed8c01}.jquery-trackswitch .main-control .seekwrap .seekbar .seekhead{background-color:#ed8c01;position:absolute;width:4px;height:22px;top:-8px;left:0}.jquery-trackswitch>p{margin:12px 10px}.jquery-trackswitch img{max-width:100%;display:block;margin:0;padding:0}.jquery-trackswitch .seekable-img-wrap{display:inline-block;position:relative}.jquery-trackswitch .seekable-img-wrap .seekwrap{position:absolute;top:0;right:0;bottom:0;left:0;cursor:pointer}.jquery-trackswitch .seekable-img-wrap .seekwrap .seekhead{position:absolute;top:0;bottom:0;border-left:2px solid #000;border-right:2px solid #fff}.jquery-trackswitch ul.track_list{padding:0}.jquery-trackswitch li.track{background-color:#ddd;position:relative;min-height:32px;padding:8px 10px 8px 60px}.jquery-trackswitch li.track.tabs{display:inline-block;padding-right:12px;border:1px solid #999}.jquery-trackswitch li.track:not(.tabs):nth-child(even){background-color:#eee}.jquery-trackswitch li.track.error{background-color:#dd9b9b!important}.jquery-trackswitch li.track.error:before{content:\"\\f071  ERROR\";display:inline;padding-right:10px;color:#7c2525;cursor:inherit}.jquery-trackswitch li.track ul.control{position:absolute;top:calc(50% - 14px);left:5px;padding-left:2px}.jquery-trackswitch li.track ul.control li{display:inline-block;width:24px;height:24px;text-align:center}.jquery-trackswitch .control li.button{position:relative;text-indent:-9999px;line-height:0;cursor:pointer}.jquery-trackswitch .control li.button:after{position:absolute;top:0}.jquery-trackswitch .control li.playpause:after{content:\"\\f04b\"}.jquery-trackswitch .control li.playpause.checked:after{content:\"\\f04c\"}.jquery-trackswitch .control li.volume:after{content:\"\\f028\"}.jquery-trackswitch .control li.volume.checked:after{content:\"\\f026\"}.jquery-trackswitch .control li.stop:after{content:\"\\f04d\"}.jquery-trackswitch .control li.repeat:after{content:\"\\f01e\";opacity:.5}.jquery-trackswitch .control li.repeat.checked:after{opacity:1}.jquery-trackswitch .control li.mute:after{content:\"\\f028\";position:absolute;bottom:50%;left:4px}.jquery-trackswitch .control li.mute.checked:after{content:\"\\f026\"}.jquery-trackswitch .control li.solo:after{content:\"\\f10c\";position:absolute;bottom:50%;left:4px}.jquery-trackswitch .control li.solo.checked:after{content:\"\\f05d\"}.jquery-trackswitch .control li.solo.radio{margin:0}.jquery-trackswitch .control li.solo.radio.checked:after{content:\"\\f192\"}@media (max-width:767px){.jquery-trackswitch .overlay span{width:70px;height:70px;top:calc(50% - 35px);left:calc(50% - 35px);line-height:10px}.jquery-trackswitch .overlay span:after{padding-top:3px;font-size:36pt}.jquery-trackswitch.error .overlay p{top:calc(50% + 45px)}.jquery-trackswitch .control li.button:after{font-size:23px}.jquery-trackswitch .main-control .button{margin:4px 22px 0 0}.jquery-trackswitch .main-control .seekwrap{width:100%;margin-top:30px}.jquery-trackswitch li.track{padding-left:80px}.jquery-trackswitch li.track ul.control{top:calc(50% - 19px)}.jquery-trackswitch .track .control li.button{margin:0 10px 0 0}.jquery-trackswitch .control li.mute:after,.jquery-trackswitch .control li.solo:after{padding-top:0;bottom:35%}}@media (max-width:400px){.jquery-trackswitch .main-control{text-align:center}.jquery-trackswitch .main-control .button{float:none;display:inline-block;margin:0 14px}.jquery-trackswitch .main-control .timing{width:100%;float:none;margin:32px 0 8px}.jquery-trackswitch .main-control .seekwrap{margin-top:8px}}"]
                    }] }
        ];
        /** @nocollapse */
        C3playerComponent.ctorParameters = function () {
            return [
                { type: MathService },
                { type: EventService },
                { type: ngxSpinner.NgxSpinnerService },
                { type: ngxModalDialog.ModalDialogService },
                { type: i0.ViewContainerRef }
            ];
        };
        C3playerComponent.propDecorators = {
            tooltipDisplay: [{ type: i0.ViewChild, args: ['tooltipDisplay',] }],
            player: [{ type: i0.ViewChild, args: ['c3player',] }],
            video: [{ type: i0.ViewChild, args: ['videoelement',] }],
            imageSource: [{ type: i0.Input, args: ['image',] }],
            audioSource: [{ type: i0.Input, args: ['audio',] }],
            wsUrl: [{ type: i0.Input, args: ['wsUrl',] }],
            totalDuration: [{ type: i0.Input, args: ['duration',] }],
            componentWidth: [{ type: i0.Input, args: ['width',] }],
            componentMargin: [{ type: i0.Input, args: ['margin',] }],
            imgRelation: [{ type: i0.Input, args: ['img-dim',] }]
        };
        return C3playerComponent;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */
    var C3playerModule = /** @class */ (function () {
        function C3playerModule() {
        }
        C3playerModule.decorators = [
            { type: i0.NgModule, args: [{
                        imports: [
                            common.CommonModule,
                            animations.BrowserAnimationsModule,
                            slider.MatSliderModule,
                            ngxSpinner.NgxSpinnerModule,
                            ngxModalDialog.ModalDialogModule.forRoot()
                        ],
                        declarations: [C3playerComponent],
                        exports: [
                            C3playerComponent,
                            slider.MatSliderModule,
                            ngxSpinner.NgxSpinnerModule,
                            ngxModalDialog.ModalDialogModule,
                            animations.BrowserAnimationsModule
                        ]
                    },] }
        ];
        return C3playerModule;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */

    exports.C3playerModule = C3playerModule;
    exports.ɵa = C3playerComponent;
    exports.ɵc = EventService;
    exports.ɵb = MathService;

    Object.defineProperty(exports, '__esModule', { value: true });

})));

//# sourceMappingURL=c3-player.umd.js.map