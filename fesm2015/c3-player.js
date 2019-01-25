import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { WebRtcPeer } from 'kurento-utils-browser';
import { Injectable, Component, Input, ViewChild, ViewContainerRef, NgModule, defineInjectable } from '@angular/core';
import { BehaviorSubject, timer } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSliderModule } from '@angular/material/slider';
import { NgxSpinnerService, NgxSpinnerModule } from 'ngx-spinner';
import { ModalDialogService, SimpleModalComponent, ModalDialogModule } from 'ngx-modal-dialog';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
class MathService {
    constructor() { }
    /**
     * @param {?} i
     * @return {?}
     */
    pad(i) {
        return (i < 10) ? "0" + i : "" + i;
    }
    /**
     * @param {?} i
     * @return {?}
     */
    padm(i) {
        return (i < 10) ? "0" + i.toFixed(1) : "" + i.toFixed(1);
    }
}
MathService.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root'
            },] }
];
/** @nocollapse */
MathService.ctorParameters = () => [];
/** @nocollapse */ MathService.ngInjectableDef = defineInjectable({ factory: function MathService_Factory() { return new MathService(); }, token: MathService, providedIn: "root" });

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/** @enum {number} */
const EventType = {
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
class KurentoService {
    /**
     * Creates a new Kurento Service
     * @param {?} ws WEb Socket Connection
     * @param {?} audioSource Audio URL
     * @param {?} video
     * @param {?} eventService
     */
    constructor(ws, audioSource, video, eventService) {
        this.ws = ws;
        this.audioSource = audioSource;
        this.video = video;
        this.eventService = eventService;
    }
    /**
     * Starts playing the streamed audio
     * @param {?} millis
     * @return {?}
     */
    start(millis) {
        console.log("RTC service: Playing audio at initial position: " + millis);
        /** @type {?} */
        let userMediaConstraints = {
            audio: true,
            video: false
        };
        /** @type {?} */
        let options = {
            remoteVideo: this.video.nativeElement,
            mediaConstraints: userMediaConstraints,
            onicecandidate: (candidate) => {
                console.log('RTC service: Local candidate ' + JSON.stringify(candidate));
                /** @type {?} */
                let message = {
                    id: 'onIceCandidate',
                    candidate: candidate
                };
                try {
                    this.sendMessage(message);
                }
                catch (error) {
                    /** @type {?} */
                    let event = { type: EventType.WebSocketFailed, value: { reason: error } };
                    this.eventService.Emitter.next(event);
                }
            }
        };
        this.webRtcPeer = WebRtcPeer.WebRtcPeerRecvonly(options, (error) => {
            if (error) {
                console.error("Error creating the peer connection: %s", error);
                /** @type {?} */
                let event = { type: EventType.RemotePlayFailed, value: { at: "start", reason: error } };
                this.eventService.Emitter.next(event);
            }
            else {
                this.webRtcPeer.generateOffer((error, sdp) => {
                    if (error) {
                        console.error("Error generating the offer: %s", error);
                        /** @type {?} */
                        let event = { type: EventType.RemotePlayFailed, value: { at: "start", reason: error } };
                        this.eventService.Emitter.next(event);
                    }
                    else {
                        /** @type {?} */
                        let message = {
                            id: 'start',
                            sdpOffer: sdp,
                            position: millis,
                            videourl: this.audioSource
                        };
                        console.log("Sending start message");
                        try {
                            this.sendMessage(message);
                        }
                        catch (error) {
                            /** @type {?} */
                            let event = { type: EventType.WebSocketFailed, value: { reason: error } };
                            this.eventService.Emitter.next(event);
                        }
                    }
                });
            }
        });
    }
    /**
     * Stops the streaming
     * @return {?}
     */
    stop() {
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
                let event = { type: EventType.RemotePlayStopped, value: {} };
                this.eventService.Emitter.next(event);
            }
            catch (error) {
                console.error("Error stopping the player: %s", error);
                /** @type {?} */
                let event = { type: EventType.RemotePlayFailed, value: { at: "stop", reason: error } };
                this.eventService.Emitter.next(event);
            }
        }
        else {
            console.error("Error stopping the player: peer connection is closed");
            /** @type {?} */
            let event = { type: EventType.RemotePlayFailed, value: { at: "stop", reason: "Peer connection is closed" } };
            this.eventService.Emitter.next(event);
        }
    }
    /**
     * Resets the Peer connection
     * @return {?}
     */
    resetConnection() {
        console.log("RTC service: resetting peer connection");
        if (this.webRtcPeer) {
            try {
                this.webRtcPeer.dispose();
                this.webRtcPeer = null;
                /** @type {?} */
                let event = { type: EventType.RemoteConnectionReset, value: {} };
                this.eventService.Emitter.next(event);
            }
            catch (error) {
                console.error("Error resetting the peer connection: %s", error);
                /** @type {?} */
                let event = { type: EventType.LocalConnectionError, value: { at: "resetConnection", reason: error } };
                this.eventService.Emitter.next(event);
            }
        }
    }
    /**
     * Moves to the specified millisecond
     * @param {?} time
     * @return {?}
     */
    doSeekAt(time) {
        console.log("RTC service: doing seek at %s", time.toString());
        try {
            /** @type {?} */
            var message = {
                id: 'doSeek',
                position: time
            };
            this.sendMessage(message);
            /** @type {?} */
            let event = { type: EventType.RemotePlaySeeked, value: { seekTime: time } };
            this.eventService.Emitter.next(event);
        }
        catch (error) {
            console.error("Error doing seek: %s", error);
            /** @type {?} */
            let event = { type: EventType.RemoteSeekFailed, value: { at: "doSeek", reason: error } };
            this.eventService.Emitter.next(event);
        }
    }
    /**
     * Pauses the streaming
     * @return {?}
     */
    pause() {
        console.log("RTC service: Pausing audio");
        try {
            /** @type {?} */
            var message = {
                id: 'pause'
            };
            this.sendMessage(message);
            /** @type {?} */
            let event = { type: EventType.RemotePlayPaused, value: {} };
            this.eventService.Emitter.next(event);
        }
        catch (error) {
            console.error("Error pausing the streaming: %s", error);
            /** @type {?} */
            let event = { type: EventType.RemotePlayFailed, value: { at: "pause", reason: error } };
            this.eventService.Emitter.next(event);
        }
    }
    /**
     * Resumes the streaming
     * @return {?}
     */
    resume() {
        console.log("RTC service: Resuming audio");
        try {
            /** @type {?} */
            var message = {
                id: 'resume'
            };
            this.sendMessage(message);
            /** @type {?} */
            let event = { type: EventType.RemotePlayResumed, value: {} };
            this.eventService.Emitter.next(event);
        }
        catch (error) {
            console.error("Error resuming the streaming: %s", error);
            /** @type {?} */
            let event = { type: EventType.WebSocketFailed, value: { reason: error } };
            this.eventService.Emitter.next(event);
        }
    }
    /**
     * @return {?}
     */
    mute() {
        if (this.webRtcPeer) {
            try {
                this.webRtcPeer.getRemoteStream().getAudioTracks().forEach(track => {
                    track.enabled = false;
                });
                /** @type {?} */
                let event = { type: EventType.LocalAudioLevel, value: { action: "mute" } };
                this.eventService.Emitter.next(event);
            }
            catch (error) {
                console.error("Error muting audio: %s", error);
                /** @type {?} */
                let event = { type: EventType.LocalAudioLevelError, value: { at: "mute", reason: error } };
                this.eventService.Emitter.next(event);
            }
        }
        else {
            /** @type {?} */
            let event = { type: EventType.LocalAudioLevel, value: { action: "mute" } };
            this.eventService.Emitter.next(event);
        }
    }
    /**
     * @return {?}
     */
    unmute() {
        if (this.webRtcPeer) {
            try {
                this.webRtcPeer.getRemoteStream().getAudioTracks().forEach(track => {
                    track.enabled = true;
                });
                /** @type {?} */
                let event = { type: EventType.LocalAudioLevel, value: { action: "unmute" } };
                this.eventService.Emitter.next(event);
            }
            catch (error) {
                console.error("Error unmuting audio: %s", error);
                /** @type {?} */
                let event = { type: EventType.LocalAudioLevelError, value: { at: "unmute", reason: error } };
                this.eventService.Emitter.next(event);
            }
        }
        else {
            /** @type {?} */
            let event = { type: EventType.LocalAudioLevel, value: { action: "unmute" } };
            this.eventService.Emitter.next(event);
        }
    }
    /**
     * Processes the SDP answer
     * @param {?} sdpAnswer SDP answer as string
     * @param {?} callback callback
     * @return {?}
     */
    processAnswer(sdpAnswer, callback) {
        console.log("RTC service: Processing SDP answer: %s", sdpAnswer);
        this.webRtcPeer.processAnswer(sdpAnswer, callback);
    }
    /**
     * Adds ICE candidate
     * @param {?} candidate candidate
     * @param {?} callback callback
     * @return {?}
     */
    addIceCandidate(candidate, callback) {
        console.log("RTC service: Adding Ice Candidate: %s", JSON.stringify(candidate));
        this.webRtcPeer.addIceCandidate(candidate, callback);
    }
    /**
     * @param {?} message
     * @return {?}
     */
    sendMessage(message) {
        if (this.ws.readyState == 1) {
            this.ws.send(JSON.stringify(message));
        }
        else {
            throw new Error("Websocket is closed");
        }
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
class EventService {
    constructor() {
        this.emitter = new BehaviorSubject(null);
    }
    /**
     * @return {?}
     */
    get Emitter() {
        return this.emitter;
    }
}
EventService.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root'
            },] }
];
/** @nocollapse */
EventService.ctorParameters = () => [];
/** @nocollapse */ EventService.ngInjectableDef = defineInjectable({ factory: function EventService_Factory() { return new EventService(); }, token: EventService, providedIn: "root" });

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
class C3playerComponent {
    /**
     * @param {?} mathService
     * @param {?} eventService
     * @param {?} spinner
     * @param {?} modalService
     * @param {?} viewRef
     */
    constructor(mathService, eventService, spinner, modalService, viewRef) {
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
        eventService.Emitter.subscribe((event) => {
            if (event) {
                switch (event.type) {
                    case EventType.LocalConnectionError: {
                        this.spinner.hide();
                        this.playing.next(false);
                        this.displayErrorMessage("Error in connection");
                        break;
                    }
                    case EventType.RemotePlayStarted: {
                        this.firstTime.next(false);
                        if (this.playedTime > 0) {
                            this.kurentoService.doSeekAt(this.playedTime);
                        }
                        this.playing.next(true);
                        this.spinner.hide();
                        break;
                    }
                    case EventType.RemotePlayPaused: {
                        this.spinner.hide();
                        this.playing.next(false);
                        break;
                    }
                    case EventType.RemotePlayStopped: {
                        this.spinner.hide();
                        this.playedTime = 0;
                        this.firstTime.next(true);
                        this.playing.next(false);
                        break;
                    }
                    case EventType.RemotePlayEnded: {
                        this.playing.next(false);
                        this.playedTime = 0;
                        break;
                    }
                    case EventType.RemotePlaySeeked: {
                        this.playedTime = event.value.seekTime;
                        this.spinner.hide();
                        break;
                    }
                    case EventType.RemoteSeekFailed: {
                        this.spinner.hide();
                        this.playing.next(false);
                        this.displayErrorMessage("Server error");
                        break;
                    }
                    case EventType.RemotePlayResumed: {
                        this.spinner.hide();
                        this.playing.next(true);
                        break;
                    }
                    case EventType.WebSocketFailed: {
                        this.spinner.hide();
                        this.displayErrorMessage("Connection to the server failed");
                        break;
                    }
                    case EventType.LocalAudioLevel: {
                        if (event.value && event.value.action) {
                            switch (event.value.action) {
                                case "mute": {
                                    this.muted.next(true);
                                    break;
                                }
                                case "unmute": {
                                    this.muted.next(false);
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
                        this.displayErrorMessage("Error at audio control");
                        break;
                    }
                    case EventType.RemotePlayFailed: {
                        this.spinner.hide();
                        this.playing.next(false);
                        break;
                    }
                    case EventType.RemoteConnectionReset: {
                        this.spinner.hide();
                        this.firstTime.next(true);
                        this.playing.next(false);
                        this.playedTime = 0;
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
    ngOnInit() {
        //Initializing global variables
        this.firstTime = new BehaviorSubject(true);
        this.wsConnected = new BehaviorSubject(false);
        this.muted = new BehaviorSubject(false);
        this.playedTime = 0;
        this.offset = Math.round(this.totalDuration / 100);
        if (this.offset < 1000) {
            this.offset = 1000;
        }
        if (this.offset > 4000) {
            this.offset = 4000;
        }
        this.playing = new BehaviorSubject(false);
        this.tooltipDisplay.nativeElement.style.display = "none";
        this.spinner.hide();
        //Play timer
        this._timer = timer(0, 100).pipe(filter(() => this.playing.value === true)).subscribe(t => {
            this.playedTime += 100;
            if (this.playedTime >= (this.totalDuration + this.offset)) {
                this.stop();
            }
        });
        //Connection
        this.ws = new WebSocket(this.wsUrl);
        this.kurentoService = new KurentoService(this.ws, this.audioSource, this.video, this.eventService);
        //WebSocket event handling
        /** @type {?} */
        const context = this;
        this.ws.onopen = (e) => {
            console.log("C3player service: Connection established with Kurento");
            context.wsConnected.next(true);
        };
        this.ws.onclose = (e) => {
            this.spinner.hide();
            console.log("C3Player service: Connection closed");
            context.wsConnected.next(false);
            context.stop();
        };
        this.ws.onerror = (e) => {
            this.spinner.hide();
            console.error("An error has occured: %s", e);
            this.displayErrorMessage("Connection with server failed");
            context.stop();
        };
        this.ws.onmessage = (e) => {
            console.log("Message received: " + e.data);
            /** @type {?} */
            let message = JSON.parse(e.data);
            switch (message.id) {
                case "playStarted": {
                    /** @type {?} */
                    let event = { type: EventType.RemotePlayStarted, value: {} };
                    this.eventService.Emitter.next(event);
                    break;
                }
                case "startResponse": {
                    console.log("Received start response");
                    context.kurentoService.processAnswer(message.sdpAnswer, (error) => {
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
                    context.kurentoService.addIceCandidate(message.candidate, (error) => {
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
                        this.displayErrorMessage("An error has occured");
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
    }
    /**
     * @return {?}
     */
    ngAfterViewInit() {
        setTimeout(() => this.componentHeight = Math.round(this.player.nativeElement.offsetWidth / this.imgRelation) + "px");
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this._timer.unsubscribe();
        this.kurentoService.resetConnection();
        this.ws.close();
    }
    /**
     * @return {?}
     */
    getPlayedHours() {
        return this.mathService.pad(Math.floor(this.playedTime / 3600000));
    }
    /**
     * @return {?}
     */
    getPlayedMinutes() {
        return this.mathService.pad(Math.floor(((this.playedTime / 1000) % 3600) / 60));
    }
    /**
     * @return {?}
     */
    getPlayedSeconds() {
        return this.mathService.padm((this.playedTime / 1000) % 60);
    }
    /**
     * @return {?}
     */
    getTotalHours() {
        return this.mathService.pad(Math.floor(this.totalDuration / 3600000));
    }
    /**
     * @return {?}
     */
    getTotalMinutes() {
        return this.mathService.pad(Math.floor(((this.totalDuration / 1000) % 3600) / 60));
    }
    /**
     * @return {?}
     */
    getTotalSeconds() {
        return this.mathService.pad(Math.round(this.totalDuration / 1000) % 60);
    }
    /**
     * @return {?}
     */
    getWantedHours() {
        return this.mathService.pad(Math.floor(this.wantedTime / 3600000));
    }
    /**
     * @return {?}
     */
    getWantedMinutes() {
        return this.mathService.pad(Math.floor(((this.wantedTime / 1000) % 3600) / 60));
    }
    /**
     * @return {?}
     */
    getWantedSeconds() {
        return this.mathService.pad(Math.floor((this.wantedTime / 1000) % 60));
    }
    /**
     * @return {?}
     */
    getSeekPosition() {
        return Math.floor((this.playedTime / this.totalDuration) * this.player.nativeElement.offsetWidth);
    }
    /**
     * TODO implementar metodos
     * @return {?}
     */
    play() {
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
    }
    /**
     * @return {?}
     */
    stop() {
        if (this.wsConnected.value === true) {
            this.kurentoService.unmute();
            this.kurentoService.stop();
        }
        else {
            this.playedTime = 0;
            this.firstTime.next(true);
            this.playing.next(false);
        }
    }
    /**
     * @param {?} event
     * @return {?}
     */
    seekClicked(event) {
    }
    /**
     * @param {?} event
     * @return {?}
     */
    seekReleased(event) {
        //set playedTime and seekPosition
        this.spinner.show();
        /** @type {?} */
        let clicked = Math.floor(this.totalDuration * (event.offsetX / this.player.nativeElement.offsetWidth));
        this.kurentoService.doSeekAt(clicked);
    }
    /**
     * @return {?}
     */
    seekDragged() {
        console.log("Seek dragged");
    }
    /**
     * @param {?} event
     * @return {?}
     */
    onDragStart(event) {
        console.log("Drag start");
    }
    /**
     * @param {?} event
     * @return {?}
     */
    onDragEnd(event) {
        console.log("Drag end");
    }
    /**
     * @param {?} event
     * @return {?}
     */
    onMouseOverSeek(event) {
        this.tooltipDisplay.nativeElement.style.display = "inline-block";
        this.tooltipDisplay.nativeElement.style.transform = "translate(" + event.offsetX + "px," + (15 + event.offsetY) + "px)";
    }
    /**
     * @param {?} event
     * @return {?}
     */
    onMouseExitSeek(event) {
        this.tooltipDisplay.nativeElement.style.display = "none";
    }
    /**
     * @param {?} event
     * @return {?}
     */
    onMouseMoveSeek(event) {
        this.wantedTime = Math.floor(this.totalDuration * (event.offsetX / this.player.nativeElement.offsetWidth));
        if (this.player.nativeElement.offsetWidth - event.offsetX <= 55) {
            this.tooltipDisplay.nativeElement.style.transform = "translate(" + (event.offsetX - 55) + "px," + (15 + event.offsetY) + "px)";
        }
        else {
            this.tooltipDisplay.nativeElement.style.transform = "translate(" + event.offsetX + "px," + (15 + event.offsetY) + "px)";
        }
    }
    /**
     * @param {?} error
     * @return {?}
     */
    displayErrorMessage(error) {
        this.modalService.openDialog(this.viewRef, {
            title: 'Error',
            childComponent: SimpleModalComponent,
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
                    onAction: () => new Promise((resolve) => {
                        resolve();
                    })
                }
            ]
        });
    }
    /**
     * @return {?}
     */
    switchSound() {
        if (this.muted.value === true) {
            this.kurentoService.unmute();
        }
        else {
            this.kurentoService.mute();
        }
    }
}
C3playerComponent.decorators = [
    { type: Component, args: [{
                selector: 'c3-player',
                template: "<div class=\"player jquery-trackswitch\" [style.width]=\"componentWidth\" [style.margin]=\"componentMargin\" #c3player>\n    <div class=\"main-control\">\n        <div class=\"seekable-img-wrap\" style=\"display: block;\">\n            <div class=\"seekable\" data-seek-margin-left=\"0\" data-seek-margin-right=\"0\" [style.background]=\"'url('+imageSource+')'\" [style.background-size]=\"'contain'\" [style.background-repeat]=\"'no-repeat'\" [style.height]=\"componentHeight\" [style.width]=\"'auto'\">\n                <div class=\"inner\" [style.background]=\"'url('+imageSource+')'\" [style.background-size]=\"'cover'\" [style.height]=\"componentHeight\" [style.width]=\"getSeekPosition()+'px'\"></div>\n                <svg>\n                    <filter id=\"blue-wash\">\n                    <feColorMatrix type=\"matrix\" values=\"0 1.0 0 0 0 -0.2 1.0 0 0 0 0 0.6 1 0 0 0 0 0 1 0\"/>\n                    </filter>\n                </svg>\n            </div>\n            <div class=\"seekwrap seekwrap-custom\"  \n                (mousedown)=\"seekClicked($event)\" \n                (mouseup)=\"seekReleased($event)\" \n                (mouseover)=\"onMouseOverSeek($event)\" \n                (mouseout)=\"onMouseExitSeek($event)\"\n                (mousemove)=\"onMouseMoveSeek($event)\">\n                <div class=\"seekhead\" [style.transform]=\"'translate('+getSeekPosition()+'px,0px)'\" #seekbar>\n                </div>\n                <span class=\"seek-tooltip\" #tooltipDisplay [style.padding]=\"'3px'\" [style.border-radius]=\"'1px'\">{{getWantedHours()}}:{{getWantedMinutes()}}:{{getWantedSeconds()}}</span>\n            </div>\n            <div style=\"display: none;\">\n                <audio id=\"gum-local\" controls autoplay #videoelement></audio>\n            </div>\n        </div>\n        <ul class=\"control\">\n            <li class=\"playpause {{playing.value ? 'checked':'' }} button\" (click)=\"play()\">Play</li>\n            <li class=\"stop button\" (click)=\"stop()\">Stop</li>\n            <li class=\"volume {{muted.value ? 'checked':'' }} button\" (click)=\"switchSound()\">Sound</li>\n            <li class=\"timing\"><span class=\"time\">{{getPlayedHours()}}:{{getPlayedMinutes()}}:{{getPlayedSeconds()}}</span> / <span class=\"length\">{{getTotalHours()}}:{{getTotalMinutes()}}:{{getTotalSeconds()}}</span></li>\n            <li class=\"seekwrap\" style=\"display: none;\">\n                <div class=\"seekbar\">\n                    <div class=\"seekhead\"></div>\n                </div>\n            </li>\n        </ul>\n        <ngx-spinner></ngx-spinner>\n    </div>\n</div>\n",
                styles: ["html{position:relative;min-height:100%}body{padding-top:40px}.seekwrap-custom{left:0;right:0}.inner{position:absolute;left:0;-webkit-filter:url(#blue-wash);filter:url(#blue-wash)}.seek-tooltip{background-color:#000;margin:0 auto;color:#eee;font-size:15px;font-family:'Lucida Sans','Lucida Sans Regular','Lucida Grande','Lucida Sans Unicode',Geneva,Verdana,sans-serif}.hidden-video{display:none}#console,video{display:block;font-size:14px;line-height:1.42857143;color:#555;background-color:#fff;background-image:none;border:1px solid #ccc;border-radius:4px;box-shadow:inset 0 1px 1px rgba(0,0,0,.075);transition:border-color .15s ease-in-out,box-shadow .15s ease-in-out}#console{overflow-y:auto;width:100%;height:175px}#videoContainer{position:absolute;float:left}#videoBig{width:640px;height:480px;top:0;left:0;z-index:1}div#videoSmall{width:240px;height:180px;padding:0;position:absolute;top:15px;left:400px;cursor:pointer;z-index:10}div.dragged{cursor:all-scroll!important;border-color:#00f!important;z-index:10!important}.jquery-trackswitch a,.jquery-trackswitch abbr,.jquery-trackswitch acronym,.jquery-trackswitch address,.jquery-trackswitch applet,.jquery-trackswitch article,.jquery-trackswitch aside,.jquery-trackswitch audio,.jquery-trackswitch b,.jquery-trackswitch big,.jquery-trackswitch blockquote,.jquery-trackswitch canvas,.jquery-trackswitch caption,.jquery-trackswitch center,.jquery-trackswitch cite,.jquery-trackswitch code,.jquery-trackswitch dd,.jquery-trackswitch del,.jquery-trackswitch details,.jquery-trackswitch dfn,.jquery-trackswitch div,.jquery-trackswitch dl,.jquery-trackswitch dt,.jquery-trackswitch em,.jquery-trackswitch embed,.jquery-trackswitch fieldset,.jquery-trackswitch figcaption,.jquery-trackswitch figure,.jquery-trackswitch footer,.jquery-trackswitch form,.jquery-trackswitch h1,.jquery-trackswitch h2,.jquery-trackswitch h3,.jquery-trackswitch h4,.jquery-trackswitch h5,.jquery-trackswitch h6,.jquery-trackswitch header,.jquery-trackswitch hgroup,.jquery-trackswitch i,.jquery-trackswitch iframe,.jquery-trackswitch img,.jquery-trackswitch ins,.jquery-trackswitch kbd,.jquery-trackswitch label,.jquery-trackswitch legend,.jquery-trackswitch li,.jquery-trackswitch mark,.jquery-trackswitch menu,.jquery-trackswitch nav,.jquery-trackswitch object,.jquery-trackswitch ol,.jquery-trackswitch output,.jquery-trackswitch p,.jquery-trackswitch pre,.jquery-trackswitch q,.jquery-trackswitch ruby,.jquery-trackswitch s,.jquery-trackswitch samp,.jquery-trackswitch section,.jquery-trackswitch small,.jquery-trackswitch span,.jquery-trackswitch strike,.jquery-trackswitch strong,.jquery-trackswitch sub,.jquery-trackswitch summary,.jquery-trackswitch sup,.jquery-trackswitch table,.jquery-trackswitch tbody,.jquery-trackswitch td,.jquery-trackswitch tfoot,.jquery-trackswitch th,.jquery-trackswitch thead,.jquery-trackswitch time,.jquery-trackswitch tr,.jquery-trackswitch tt,.jquery-trackswitch u,.jquery-trackswitch ul,.jquery-trackswitch var,.jquery-trackswitch video{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}.jquery-trackswitch article,.jquery-trackswitch aside,.jquery-trackswitch details,.jquery-trackswitch figcaption,.jquery-trackswitch figure,.jquery-trackswitch footer,.jquery-trackswitch header,.jquery-trackswitch hgroup,.jquery-trackswitch menu,.jquery-trackswitch nav,.jquery-trackswitch section{display:block}.jquery-trackswitch ol,.jquery-trackswitch ul{list-style:none}.jquery-trackswitch blockquote,.jquery-trackswitch q{quotes:none}.jquery-trackswitch blockquote:after,.jquery-trackswitch blockquote:before,.jquery-trackswitch q:after,.jquery-trackswitch q:before{content:'';content:none}.jquery-trackswitch table{border-collapse:collapse;border-spacing:0}.jquery-trackswitch *,.jquery-trackswitch :after,.jquery-trackswitch :before{box-sizing:border-box}.jquery-trackswitch{background:#eee;position:relative;margin:10px;overflow:hidden;color:#000;line-height:1}.jquery-trackswitch ts-track{display:none}.jquery-trackswitch ul{margin:0;padding:0}.jquery-trackswitch li{margin:0;padding:0;list-style:none}.jquery-trackswitch .control li.button:after,.jquery-trackswitch .overlay span:after,.jquery-trackswitch li.track.error:before{content:\"\";display:block;font-family:FontAwesome;font-style:normal;font-weight:400;font-size:16px;line-height:1;text-indent:0}.jquery-trackswitch .overlay{background-color:rgba(0,0,0,.3);position:absolute;top:0;right:0;bottom:0;left:0;z-index:10}.jquery-trackswitch .overlay #overlayinfo span.info,.jquery-trackswitch .overlay>p,.jquery-trackswitch .overlay>span{display:block;position:absolute;text-align:center}.jquery-trackswitch .overlay>span{background-color:#f1c40f;width:50px;height:50px;top:calc(50% - 25px);left:calc(50% - 25px);text-indent:-9999px;line-height:0;border-radius:100%;cursor:pointer}.jquery-trackswitch .overlay>span.loading{cursor:inherit}.jquery-trackswitch .overlay>span:after{content:\"\\f011\";padding-top:7px;font-size:28pt}.jquery-trackswitch .overlay>span.loading:after{content:\"\\f110\"}.jquery-trackswitch.error .overlay{background:rgba(0,0,0,.6)}.jquery-trackswitch.error .overlay>span{background:#c03328;cursor:inherit}.jquery-trackswitch.error .overlay>span:after{content:\"\\f12a\"}.jquery-trackswitch.error .overlay p{width:100%;top:calc(50% + 35px);color:#fff}.jquery-trackswitch .overlay #overlayinfo{height:40px;width:100%;bottom:5px;right:10px;color:#000;text-align:right;font-size:14pt}.jquery-trackswitch .overlay #overlayinfo span.info{bottom:0;right:0;width:380px;cursor:pointer;text-indent:-9999px;opacity:.4}.jquery-trackswitch .overlay #overlayinfo span.info:after{content:\"\\f05a\";position:absolute;bottom:0;right:0;font-size:16pt}.jquery-trackswitch .overlay #overlayinfo span.text{display:none;position:absolute;right:0}.jquery-trackswitch .overlay #overlayinfo span.text strong{font-weight:700}.jquery-trackswitch .overlay #overlayinfo a{color:#eee;text-decoration:underline}.jquery-trackswitch .main-control ul{background-color:#333;height:auto;min-height:36px;padding:4px 12px;overflow:hidden;color:#ddd}.jquery-trackswitch .main-control .button{float:left;width:15px;margin:7px 10px 0 0;cursor:pointer}.jquery-trackswitch .main-control .timing{float:right;font-family:monospace;margin:7px 0 0 10px}.jquery-trackswitch .main-control .seekwrap{overflow:hidden;height:100%;cursor:pointer}.jquery-trackswitch .main-control .seekwrap .seekbar{background-color:#ed8c01;height:6px;margin:11px 4px 0 0;position:relative;box-shadow:4px 0 0 0 #ed8c01}.jquery-trackswitch .main-control .seekwrap .seekbar .seekhead{background-color:#ed8c01;position:absolute;width:4px;height:22px;top:-8px;left:0}.jquery-trackswitch>p{margin:12px 10px}.jquery-trackswitch img{max-width:100%;display:block;margin:0;padding:0}.jquery-trackswitch .seekable-img-wrap{display:inline-block;position:relative}.jquery-trackswitch .seekable-img-wrap .seekwrap{position:absolute;top:0;right:0;bottom:0;left:0;cursor:pointer}.jquery-trackswitch .seekable-img-wrap .seekwrap .seekhead{position:absolute;top:0;bottom:0;border-left:2px solid #000;border-right:2px solid #fff}.jquery-trackswitch ul.track_list{padding:0}.jquery-trackswitch li.track{background-color:#ddd;position:relative;min-height:32px;padding:8px 10px 8px 60px}.jquery-trackswitch li.track.tabs{display:inline-block;padding-right:12px;border:1px solid #999}.jquery-trackswitch li.track:not(.tabs):nth-child(even){background-color:#eee}.jquery-trackswitch li.track.error{background-color:#dd9b9b!important}.jquery-trackswitch li.track.error:before{content:\"\\f071  ERROR\";display:inline;padding-right:10px;color:#7c2525;cursor:inherit}.jquery-trackswitch li.track ul.control{position:absolute;top:calc(50% - 14px);left:5px;padding-left:2px}.jquery-trackswitch li.track ul.control li{display:inline-block;width:24px;height:24px;text-align:center}.jquery-trackswitch .control li.button{position:relative;text-indent:-9999px;line-height:0;cursor:pointer}.jquery-trackswitch .control li.button:after{position:absolute;top:0}.jquery-trackswitch .control li.playpause:after{content:\"\\f04b\"}.jquery-trackswitch .control li.playpause.checked:after{content:\"\\f04c\"}.jquery-trackswitch .control li.volume:after{content:\"\\f028\"}.jquery-trackswitch .control li.volume.checked:after{content:\"\\f026\"}.jquery-trackswitch .control li.stop:after{content:\"\\f04d\"}.jquery-trackswitch .control li.repeat:after{content:\"\\f01e\";opacity:.5}.jquery-trackswitch .control li.repeat.checked:after{opacity:1}.jquery-trackswitch .control li.mute:after{content:\"\\f028\";position:absolute;bottom:50%;left:4px}.jquery-trackswitch .control li.mute.checked:after{content:\"\\f026\"}.jquery-trackswitch .control li.solo:after{content:\"\\f10c\";position:absolute;bottom:50%;left:4px}.jquery-trackswitch .control li.solo.checked:after{content:\"\\f05d\"}.jquery-trackswitch .control li.solo.radio{margin:0}.jquery-trackswitch .control li.solo.radio.checked:after{content:\"\\f192\"}@media (max-width:767px){.jquery-trackswitch .overlay span{width:70px;height:70px;top:calc(50% - 35px);left:calc(50% - 35px);line-height:10px}.jquery-trackswitch .overlay span:after{padding-top:3px;font-size:36pt}.jquery-trackswitch.error .overlay p{top:calc(50% + 45px)}.jquery-trackswitch .control li.button:after{font-size:23px}.jquery-trackswitch .main-control .button{margin:4px 22px 0 0}.jquery-trackswitch .main-control .seekwrap{width:100%;margin-top:30px}.jquery-trackswitch li.track{padding-left:80px}.jquery-trackswitch li.track ul.control{top:calc(50% - 19px)}.jquery-trackswitch .track .control li.button{margin:0 10px 0 0}.jquery-trackswitch .control li.mute:after,.jquery-trackswitch .control li.solo:after{padding-top:0;bottom:35%}}@media (max-width:400px){.jquery-trackswitch .main-control{text-align:center}.jquery-trackswitch .main-control .button{float:none;display:inline-block;margin:0 14px}.jquery-trackswitch .main-control .timing{width:100%;float:none;margin:32px 0 8px}.jquery-trackswitch .main-control .seekwrap{margin-top:8px}}"]
            }] }
];
/** @nocollapse */
C3playerComponent.ctorParameters = () => [
    { type: MathService },
    { type: EventService },
    { type: NgxSpinnerService },
    { type: ModalDialogService },
    { type: ViewContainerRef }
];
C3playerComponent.propDecorators = {
    tooltipDisplay: [{ type: ViewChild, args: ['tooltipDisplay',] }],
    player: [{ type: ViewChild, args: ['c3player',] }],
    video: [{ type: ViewChild, args: ['videoelement',] }],
    imageSource: [{ type: Input, args: ['image',] }],
    audioSource: [{ type: Input, args: ['audio',] }],
    wsUrl: [{ type: Input, args: ['wsUrl',] }],
    totalDuration: [{ type: Input, args: ['duration',] }],
    componentWidth: [{ type: Input, args: ['width',] }],
    componentMargin: [{ type: Input, args: ['margin',] }],
    imgRelation: [{ type: Input, args: ['img-dim',] }]
};

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
class C3playerModule {
}
C3playerModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    CommonModule,
                    BrowserAnimationsModule,
                    MatSliderModule,
                    NgxSpinnerModule,
                    ModalDialogModule.forRoot()
                ],
                declarations: [C3playerComponent],
                exports: [
                    C3playerComponent,
                    MatSliderModule,
                    NgxSpinnerModule,
                    ModalDialogModule,
                    BrowserAnimationsModule
                ]
            },] }
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */

export { C3playerModule, C3playerComponent as ɵa, EventService as ɵc, MathService as ɵb };

//# sourceMappingURL=c3-player.js.map