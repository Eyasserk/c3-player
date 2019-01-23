/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { BehaviorSubject, timer } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MathService } from '../../services/math.service';
import { KurentoService } from '../../services/kurento.service';
import { EventService } from '../../services/event.service';
import { EventType } from '../../models/event-type.enum';
export class C3playerComponent {
    /**
     * @param {?} mathService
     * @param {?} eventService
     */
    constructor(mathService, eventService) {
        this.mathService = mathService;
        this.eventService = eventService;
        this.wantedTime = 0; //tooltip
        eventService.Emitter.subscribe((event) => {
            if (event) {
                switch (event.type) {
                    case EventType.LocalConnectionError: {
                        this.spinnerDisplay = "none";
                        this.playing.next(false);
                        this.displayErrorMessage("");
                        break;
                    }
                    case EventType.RemotePlayStarted: {
                        this.spinnerDisplay = "none";
                        this.playing.next(true);
                        break;
                    }
                    case EventType.RemotePlayPaused: {
                        this.playing.next(false);
                        break;
                    }
                    case EventType.RemotePlayStopped: {
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
                        this.spinnerDisplay = "none";
                        this.playedTime = event.value.seekTime;
                        break;
                    }
                    case EventType.RemoteSeekFailed: {
                        this.spinnerDisplay = "none";
                        this.playing.next(false);
                        this.displayErrorMessage("");
                        break;
                    }
                    case EventType.RemotePlayResumed: {
                        this.spinnerDisplay = "none";
                        this.playing.next(true);
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
                        this.displayErrorMessage("");
                        break;
                    }
                    case EventType.RemotePlayFailed: {
                        this.spinnerDisplay = "none";
                        this.playing.next(false);
                        break;
                    }
                    case EventType.RemoteConnectionReset: {
                        this.spinnerDisplay = "none";
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
        this.spinnerDisplay = "none";
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
            console.log("C3Player service: Connection closed");
            context.wsConnected.next(false);
            context.stop();
        };
        this.ws.onerror = (e) => {
            console.error("An error has occured: %s", e);
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
                this.spinnerDisplay = "block";
                this.firstTime.next(false);
                this.kurentoService.start(this.playedTime);
            }
            else {
                //Resume
                this.spinnerDisplay = "block";
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
        this.spinnerDisplay = "block";
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
                template: "<div class=\"player jquery-trackswitch\" style=\"width: 50%; margin: auto;\" #c3player>\n    <div class=\"main-control\">\n        <div class=\"seekable-img-wrap\" style=\"display: block;\">\n            <img class=\"seekable\" data-seek-margin-left=\"0\" data-seek-margin-right=\"0\" src=\"{{imageSource}}\">\n            <div class=\"seekwrap seekwrap-custom\"  \n                (mousedown)=\"seekClicked($event)\" \n                (mouseup)=\"seekReleased($event)\" \n                (mouseover)=\"onMouseOverSeek($event)\" \n                (mouseout)=\"onMouseExitSeek($event)\"\n                (mousemove)=\"onMouseMoveSeek($event)\">\n                <div class=\"seekhead\" [style.transform]=\"'translate('+getSeekPosition()+'px,0px)'\" #seekbar>\n                </div>\n                <span class=\"seek-tooltip\" #tooltipDisplay>{{getWantedHours()}}:{{getWantedMinutes()}}:{{getWantedSeconds()}}</span>\n            </div>\n            <div style=\"display: none;\">\n                <audio id=\"gum-local\" controls autoplay #videoelement></audio>\n            </div>\n        </div>\n        <ul class=\"control\">\n            <li class=\"playpause {{playing.value ? 'checked':'' }} button\" (click)=\"play()\">Play</li>\n            <li class=\"stop button\" (click)=\"stop()\">Stop</li>\n            <li class=\"volume {{muted.value ? 'checked':'' }} button\" (click)=\"switchSound()\">Sound</li>\n            <li class=\"timing\"><span class=\"time\">{{getPlayedHours()}}:{{getPlayedMinutes()}}:{{getPlayedSeconds()}}</span> / <span class=\"length\">{{getTotalHours()}}:{{getTotalMinutes()}}:{{getTotalSeconds()}}</span></li>\n            <li class=\"seekwrap\" style=\"display: none;\">\n                <div class=\"seekbar\">\n                    <div class=\"seekhead\"></div>\n                </div>\n            </li>\n        </ul>\n    </div>\n</div>\n",
                styles: ["html{position:relative;min-height:100%}body{padding-top:40px}.seekwrap-custom{left:0;right:0}.seek-tooltip{background-color:#000;margin:0 auto;color:#eee;font-size:15px;font-family:'Lucida Sans','Lucida Sans Regular','Lucida Grande','Lucida Sans Unicode',Geneva,Verdana,sans-serif}.hidden-video{display:none}#console,video{display:block;font-size:14px;line-height:1.42857143;color:#555;background-color:#fff;background-image:none;border:1px solid #ccc;border-radius:4px;box-shadow:inset 0 1px 1px rgba(0,0,0,.075);transition:border-color .15s ease-in-out,box-shadow .15s ease-in-out}#console{overflow-y:auto;width:100%;height:175px}#videoContainer{position:absolute;float:left}#videoBig{width:640px;height:480px;top:0;left:0;z-index:1}div#videoSmall{width:240px;height:180px;padding:0;position:absolute;top:15px;left:400px;cursor:pointer;z-index:10}div.dragged{cursor:all-scroll!important;border-color:#00f!important;z-index:10!important}.jquery-trackswitch a,.jquery-trackswitch abbr,.jquery-trackswitch acronym,.jquery-trackswitch address,.jquery-trackswitch applet,.jquery-trackswitch article,.jquery-trackswitch aside,.jquery-trackswitch audio,.jquery-trackswitch b,.jquery-trackswitch big,.jquery-trackswitch blockquote,.jquery-trackswitch canvas,.jquery-trackswitch caption,.jquery-trackswitch center,.jquery-trackswitch cite,.jquery-trackswitch code,.jquery-trackswitch dd,.jquery-trackswitch del,.jquery-trackswitch details,.jquery-trackswitch dfn,.jquery-trackswitch div,.jquery-trackswitch dl,.jquery-trackswitch dt,.jquery-trackswitch em,.jquery-trackswitch embed,.jquery-trackswitch fieldset,.jquery-trackswitch figcaption,.jquery-trackswitch figure,.jquery-trackswitch footer,.jquery-trackswitch form,.jquery-trackswitch h1,.jquery-trackswitch h2,.jquery-trackswitch h3,.jquery-trackswitch h4,.jquery-trackswitch h5,.jquery-trackswitch h6,.jquery-trackswitch header,.jquery-trackswitch hgroup,.jquery-trackswitch i,.jquery-trackswitch iframe,.jquery-trackswitch img,.jquery-trackswitch ins,.jquery-trackswitch kbd,.jquery-trackswitch label,.jquery-trackswitch legend,.jquery-trackswitch li,.jquery-trackswitch mark,.jquery-trackswitch menu,.jquery-trackswitch nav,.jquery-trackswitch object,.jquery-trackswitch ol,.jquery-trackswitch output,.jquery-trackswitch p,.jquery-trackswitch pre,.jquery-trackswitch q,.jquery-trackswitch ruby,.jquery-trackswitch s,.jquery-trackswitch samp,.jquery-trackswitch section,.jquery-trackswitch small,.jquery-trackswitch span,.jquery-trackswitch strike,.jquery-trackswitch strong,.jquery-trackswitch sub,.jquery-trackswitch summary,.jquery-trackswitch sup,.jquery-trackswitch table,.jquery-trackswitch tbody,.jquery-trackswitch td,.jquery-trackswitch tfoot,.jquery-trackswitch th,.jquery-trackswitch thead,.jquery-trackswitch time,.jquery-trackswitch tr,.jquery-trackswitch tt,.jquery-trackswitch u,.jquery-trackswitch ul,.jquery-trackswitch var,.jquery-trackswitch video{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}.jquery-trackswitch article,.jquery-trackswitch aside,.jquery-trackswitch details,.jquery-trackswitch figcaption,.jquery-trackswitch figure,.jquery-trackswitch footer,.jquery-trackswitch header,.jquery-trackswitch hgroup,.jquery-trackswitch menu,.jquery-trackswitch nav,.jquery-trackswitch section{display:block}.jquery-trackswitch ol,.jquery-trackswitch ul{list-style:none}.jquery-trackswitch blockquote,.jquery-trackswitch q{quotes:none}.jquery-trackswitch blockquote:after,.jquery-trackswitch blockquote:before,.jquery-trackswitch q:after,.jquery-trackswitch q:before{content:'';content:none}.jquery-trackswitch table{border-collapse:collapse;border-spacing:0}.jquery-trackswitch *,.jquery-trackswitch :after,.jquery-trackswitch :before{box-sizing:border-box}.jquery-trackswitch{background:#eee;position:relative;margin:10px;overflow:hidden;color:#000;line-height:1}.jquery-trackswitch ts-track{display:none}.jquery-trackswitch ul{margin:0;padding:0}.jquery-trackswitch li{margin:0;padding:0;list-style:none}.jquery-trackswitch .control li.button:after,.jquery-trackswitch .overlay span:after,.jquery-trackswitch li.track.error:before{content:\"\";display:block;font-family:FontAwesome;font-style:normal;font-weight:400;font-size:16px;line-height:1;text-indent:0}.jquery-trackswitch .overlay{background-color:rgba(0,0,0,.3);position:absolute;top:0;right:0;bottom:0;left:0;z-index:10}.jquery-trackswitch .overlay #overlayinfo span.info,.jquery-trackswitch .overlay>p,.jquery-trackswitch .overlay>span{display:block;position:absolute;text-align:center}.jquery-trackswitch .overlay>span{background-color:#f1c40f;width:50px;height:50px;top:calc(50% - 25px);left:calc(50% - 25px);text-indent:-9999px;line-height:0;border-radius:100%;cursor:pointer}.jquery-trackswitch .overlay>span.loading{cursor:inherit}.jquery-trackswitch .overlay>span:after{content:\"\\f011\";padding-top:7px;font-size:28pt}.jquery-trackswitch .overlay>span.loading:after{content:\"\\f110\"}.jquery-trackswitch.error .overlay{background:rgba(0,0,0,.6)}.jquery-trackswitch.error .overlay>span{background:#c03328;cursor:inherit}.jquery-trackswitch.error .overlay>span:after{content:\"\\f12a\"}.jquery-trackswitch.error .overlay p{width:100%;top:calc(50% + 35px);color:#fff}.jquery-trackswitch .overlay #overlayinfo{height:40px;width:100%;bottom:5px;right:10px;color:#000;text-align:right;font-size:14pt}.jquery-trackswitch .overlay #overlayinfo span.info{bottom:0;right:0;width:380px;cursor:pointer;text-indent:-9999px;opacity:.4}.jquery-trackswitch .overlay #overlayinfo span.info:after{content:\"\\f05a\";position:absolute;bottom:0;right:0;font-size:16pt}.jquery-trackswitch .overlay #overlayinfo span.text{display:none;position:absolute;right:0}.jquery-trackswitch .overlay #overlayinfo span.text strong{font-weight:700}.jquery-trackswitch .overlay #overlayinfo a{color:#eee;text-decoration:underline}.jquery-trackswitch .main-control ul{background-color:#333;height:auto;min-height:36px;padding:4px 12px;overflow:hidden;color:#ddd}.jquery-trackswitch .main-control .button{float:left;width:15px;margin:7px 10px 0 0;cursor:pointer}.jquery-trackswitch .main-control .timing{float:right;font-family:monospace;margin:7px 0 0 10px}.jquery-trackswitch .main-control .seekwrap{overflow:hidden;height:100%;cursor:pointer}.jquery-trackswitch .main-control .seekwrap .seekbar{background-color:#ed8c01;height:6px;margin:11px 4px 0 0;position:relative;box-shadow:4px 0 0 0 #ed8c01}.jquery-trackswitch .main-control .seekwrap .seekbar .seekhead{background-color:#ed8c01;position:absolute;width:4px;height:22px;top:-8px;left:0}.jquery-trackswitch>p{margin:12px 10px}.jquery-trackswitch img{max-width:100%;display:block;margin:0;padding:0}.jquery-trackswitch .seekable-img-wrap{display:inline-block;position:relative}.jquery-trackswitch .seekable-img-wrap .seekwrap{position:absolute;top:0;right:0;bottom:0;left:0;cursor:pointer}.jquery-trackswitch .seekable-img-wrap .seekwrap .seekhead{position:absolute;top:0;bottom:0;border-left:2px solid #000;border-right:2px solid #fff}.jquery-trackswitch ul.track_list{padding:0}.jquery-trackswitch li.track{background-color:#ddd;position:relative;min-height:32px;padding:8px 10px 8px 60px}.jquery-trackswitch li.track.tabs{display:inline-block;padding-right:12px;border:1px solid #999}.jquery-trackswitch li.track:not(.tabs):nth-child(even){background-color:#eee}.jquery-trackswitch li.track.error{background-color:#dd9b9b!important}.jquery-trackswitch li.track.error:before{content:\"\\f071  ERROR\";display:inline;padding-right:10px;color:#7c2525;cursor:inherit}.jquery-trackswitch li.track ul.control{position:absolute;top:calc(50% - 14px);left:5px;padding-left:2px}.jquery-trackswitch li.track ul.control li{display:inline-block;width:24px;height:24px;text-align:center}.jquery-trackswitch .control li.button{position:relative;text-indent:-9999px;line-height:0;cursor:pointer}.jquery-trackswitch .control li.button:after{position:absolute;top:0}.jquery-trackswitch .control li.playpause:after{content:\"\\f04b\"}.jquery-trackswitch .control li.playpause.checked:after{content:\"\\f04c\"}.jquery-trackswitch .control li.volume:after{content:\"\\f028\"}.jquery-trackswitch .control li.volume.checked:after{content:\"\\f026\"}.jquery-trackswitch .control li.stop:after{content:\"\\f04d\"}.jquery-trackswitch .control li.repeat:after{content:\"\\f01e\";opacity:.5}.jquery-trackswitch .control li.repeat.checked:after{opacity:1}.jquery-trackswitch .control li.mute:after{content:\"\\f028\";position:absolute;bottom:50%;left:4px}.jquery-trackswitch .control li.mute.checked:after{content:\"\\f026\"}.jquery-trackswitch .control li.solo:after{content:\"\\f10c\";position:absolute;bottom:50%;left:4px}.jquery-trackswitch .control li.solo.checked:after{content:\"\\f05d\"}.jquery-trackswitch .control li.solo.radio{margin:0}.jquery-trackswitch .control li.solo.radio.checked:after{content:\"\\f192\"}@media (max-width:767px){.jquery-trackswitch .overlay span{width:70px;height:70px;top:calc(50% - 35px);left:calc(50% - 35px);line-height:10px}.jquery-trackswitch .overlay span:after{padding-top:3px;font-size:36pt}.jquery-trackswitch.error .overlay p{top:calc(50% + 45px)}.jquery-trackswitch .control li.button:after{font-size:23px}.jquery-trackswitch .main-control .button{margin:4px 22px 0 0}.jquery-trackswitch .main-control .seekwrap{width:100%;margin-top:30px}.jquery-trackswitch li.track{padding-left:80px}.jquery-trackswitch li.track ul.control{top:calc(50% - 19px)}.jquery-trackswitch .track .control li.button{margin:0 10px 0 0}.jquery-trackswitch .control li.mute:after,.jquery-trackswitch .control li.solo:after{padding-top:0;bottom:35%}}@media (max-width:400px){.jquery-trackswitch .main-control{text-align:center}.jquery-trackswitch .main-control .button{float:none;display:inline-block;margin:0 14px}.jquery-trackswitch .main-control .timing{width:100%;float:none;margin:32px 0 8px}.jquery-trackswitch .main-control .seekwrap{margin-top:8px}}"]
            }] }
];
/** @nocollapse */
C3playerComponent.ctorParameters = () => [
    { type: MathService },
    { type: EventService }
];
C3playerComponent.propDecorators = {
    tooltipDisplay: [{ type: ViewChild, args: ['tooltipDisplay',] }],
    player: [{ type: ViewChild, args: ['c3player',] }],
    video: [{ type: ViewChild, args: ['videoelement',] }],
    imageSource: [{ type: Input }],
    audioSource: [{ type: Input }],
    wsUrl: [{ type: Input }],
    totalDuration: [{ type: Input }]
};
if (false) {
    /**
     * @type {?}
     * @private
     */
    C3playerComponent.prototype.ws;
    /**
     * @type {?}
     * @private
     */
    C3playerComponent.prototype.kurentoService;
    /**
     * @type {?}
     * @private
     */
    C3playerComponent.prototype._timer;
    /**
     * @type {?}
     * @private
     */
    C3playerComponent.prototype.offset;
    /** @type {?} */
    C3playerComponent.prototype.playing;
    /**
     * @type {?}
     * @private
     */
    C3playerComponent.prototype.wsConnected;
    /**
     * @type {?}
     * @private
     */
    C3playerComponent.prototype.playedTime;
    /** @type {?} */
    C3playerComponent.prototype.tooltipDisplay;
    /**
     * @type {?}
     * @private
     */
    C3playerComponent.prototype.wantedTime;
    /** @type {?} */
    C3playerComponent.prototype.player;
    /** @type {?} */
    C3playerComponent.prototype.video;
    /** @type {?} */
    C3playerComponent.prototype.imageSource;
    /** @type {?} */
    C3playerComponent.prototype.audioSource;
    /** @type {?} */
    C3playerComponent.prototype.wsUrl;
    /** @type {?} */
    C3playerComponent.prototype.totalDuration;
    /** @type {?} */
    C3playerComponent.prototype.spinnerDisplay;
    /** @type {?} */
    C3playerComponent.prototype.muted;
    /**
     * @type {?}
     * @private
     */
    C3playerComponent.prototype.firstTime;
    /**
     * @type {?}
     * @private
     */
    C3playerComponent.prototype.mathService;
    /**
     * @type {?}
     * @private
     */
    C3playerComponent.prototype.eventService;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYzNwbGF5ZXIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vYzMtcGxheWVyLyIsInNvdXJjZXMiOlsic3JjL2FwcC9tb2R1bGVzL2MzcGxheWVyL2MzcGxheWVyLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQXFCLFNBQVMsRUFBRSxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFMUYsT0FBTyxFQUFFLGVBQWUsRUFBRSxLQUFLLEVBQWUsTUFBTSxNQUFNLENBQUM7QUFDM0QsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ3hDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDaEUsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRTVELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQU96RCxNQUFNLE9BQU8saUJBQWlCOzs7OztJQTBDNUIsWUFBb0IsV0FBd0IsRUFBVSxZQUEwQjtRQUE1RCxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtRQUFVLGlCQUFZLEdBQVosWUFBWSxDQUFjO1FBeEJ4RSxlQUFVLEdBQVcsQ0FBQyxDQUFDLENBQUMsU0FBUztRQXlCdkMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFjLEVBQUUsRUFBRTtZQUNoRCxJQUFHLEtBQUssRUFBQztnQkFDUCxRQUFPLEtBQUssQ0FBQyxJQUFJLEVBQUM7b0JBQ2hCLEtBQUssU0FBUyxDQUFDLG9CQUFvQixDQUFDLENBQUM7d0JBQ25DLElBQUksQ0FBQyxjQUFjLEdBQUcsTUFBTSxDQUFDO3dCQUM3QixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDekIsSUFBSSxDQUFD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LFdBQVc7Z0JBQ3JCLHEyREFBd0M7O2FBRXpDOzs7O1lBVlEsV0FBVztZQUVYLFlBQVk7Ozs2QkEwQmxCLFNBQVMsU0FBQyxnQkFBZ0I7cUJBSTFCLFNBQVMsU0FBQyxVQUFVO29CQUVwQixTQUFTLFNBQUMsY0FBYzswQkFFeEIsS0FBSzswQkFHTCxLQUFLO29CQUdMLEtBQUs7NEJBR0wsS0FBSzs7Ozs7OztJQWhDTiwrQkFBc0I7Ozs7O0lBR3RCLDJDQUF1Qzs7Ozs7SUFHdkMsbUNBQTZCOzs7OztJQUM3QixtQ0FBdUI7O0lBR3ZCLG9DQUFrQzs7Ozs7SUFDbEMsd0NBQThDOzs7OztJQUc5Qyx1Q0FBMkI7O0lBQzNCLDJDQUF3RDs7Ozs7SUFDeEQsdUNBQStCOztJQUcvQixtQ0FBMEM7O0lBRTFDLGtDQUE2Qzs7SUFFN0Msd0NBQ29COztJQUVwQix3Q0FDb0I7O0lBRXBCLGtDQUNjOztJQUVkLDBDQUNzQjs7SUFFdEIsMkNBQXVCOztJQUN2QixrQ0FBZ0M7Ozs7O0lBRWhDLHNDQUE0Qzs7Ozs7SUFFaEMsd0NBQWdDOzs7OztJQUFFLHlDQUFrQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5wdXQsIE9uSW5pdCwgT25EZXN0cm95LCBWaWV3Q2hpbGQsIEVsZW1lbnRSZWZ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBCZWhhdmlvclN1YmplY3QsIHRpbWVyLCBTdWJzY3JpcHRpb259IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgZmlsdGVyIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHsgTWF0aFNlcnZpY2UgfSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9tYXRoLnNlcnZpY2UnO1xuaW1wb3J0IHsgS3VyZW50b1NlcnZpY2UgfSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9rdXJlbnRvLnNlcnZpY2UnO1xuaW1wb3J0IHsgRXZlbnRTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vc2VydmljZXMvZXZlbnQuc2VydmljZSc7XG5pbXBvcnQgeyBDM2V2ZW50IH0gZnJvbSAnLi4vLi4vbW9kZWxzL2MzZXZlbnQnO1xuaW1wb3J0IHsgRXZlbnRUeXBlIH0gZnJvbSAnLi4vLi4vbW9kZWxzL2V2ZW50LXR5cGUuZW51bSc7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2MzLXBsYXllcicsXG4gIHRlbXBsYXRlVXJsOiAnLi9jM3BsYXllci5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWycuL2MzcGxheWVyLmNvbXBvbmVudC5jc3MnXVxufSlcbmV4cG9ydCBjbGFzcyBDM3BsYXllckNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcblxuICBwcml2YXRlIHdzOiBXZWJTb2NrZXQ7XG5cbiAgLy9LdXJlbnRvIHNlcnZpY2VcbiAgcHJpdmF0ZSBrdXJlbnRvU2VydmljZTogS3VyZW50b1NlcnZpY2U7XG5cbiAgLy90aW1lciBmb3IgcGxheSB0aW1lXG4gIHByaXZhdGUgX3RpbWVyOiBTdWJzY3JpcHRpb247XG4gIHByaXZhdGUgb2Zmc2V0OiBudW1iZXI7IC8vbWF4IGRpZmZlcmVuY2UgYmV0d2VlbiByZW1vdGUgYW5kIGxvY2FsIHBsYXlcblxuICAvL2hhbmRsZSBpZiBjb21wb25lbnQgaXMgcGxheWluZ1xuICBwbGF5aW5nOiBCZWhhdmlvclN1YmplY3Q8Ym9vbGVhbj47XG4gIHByaXZhdGUgd3NDb25uZWN0ZWQ6IEJlaGF2aW9yU3ViamVjdDxib29sZWFuPjtcblxuICAvL1BsYXkgaGFuZGxpbmdcbiAgcHJpdmF0ZSBwbGF5ZWRUaW1lOiBudW1iZXI7IC8vbWlsbGlzZWNvbmRzXG4gIEBWaWV3Q2hpbGQoJ3Rvb2x0aXBEaXNwbGF5JykgdG9vbHRpcERpc3BsYXk6IEVsZW1lbnRSZWY7XG4gIHByaXZhdGUgd2FudGVkVGltZTogbnVtYmVyID0gMDsgLy90b29sdGlwXG5cbiAgLy9Pd24gY29tcG9uZW50XG4gIEBWaWV3Q2hpbGQoJ2MzcGxheWVyJykgcGxheWVyOiBFbGVtZW50UmVmOyBcblxuICBAVmlld0NoaWxkKCd2aWRlb2VsZW1lbnQnKSB2aWRlbzogRWxlbWVudFJlZjtcblxuICBASW5wdXQoKVxuICBpbWFnZVNvdXJjZTogc3RyaW5nOyBcblxuICBASW5wdXQoKVxuICBhdWRpb1NvdXJjZTogc3RyaW5nO1xuXG4gIEBJbnB1dCgpXG4gIHdzVXJsOiBzdHJpbmc7XG5cbiAgQElucHV0KClcbiAgdG90YWxEdXJhdGlvbjogbnVtYmVyO1xuXG4gIHNwaW5uZXJEaXNwbGF5OiBzdHJpbmc7XG4gIG11dGVkOiBCZWhhdmlvclN1YmplY3Q8Ym9vbGVhbj47XG5cbiAgcHJpdmF0ZSBmaXJzdFRpbWU6IEJlaGF2aW9yU3ViamVjdDxib29sZWFuPjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIG1hdGhTZXJ2aWNlOiBNYXRoU2VydmljZSwgcHJpdmF0ZSBldmVudFNlcnZpY2U6IEV2ZW50U2VydmljZSl7XG4gICAgZXZlbnRTZXJ2aWNlLkVtaXR0ZXIuc3Vic2NyaWJlKChldmVudDogQzNldmVudCkgPT4ge1xuICAgICAgaWYoZXZlbnQpe1xuICAgICAgICBzd2l0Y2goZXZlbnQudHlwZSl7XG4gICAgICAgICAgY2FzZSBFdmVudFR5cGUuTG9jYWxDb25uZWN0aW9uRXJyb3I6IHtcbiAgICAgICAgICAgIHRoaXMuc3Bpbm5lckRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgICAgIHRoaXMucGxheWluZy5uZXh0KGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheUVycm9yTWVzc2FnZShcIlwiKTtcbiAgICAgICAgICAgIGJyZWFrOyBcbiAgICAgICAgICB9XG4gICAgICAgICAgY2FzZSBFdmVudFR5cGUuUmVtb3RlUGxheVN0YXJ0ZWQ6IHtcbiAgICAgICAgICAgIHRoaXMuc3Bpbm5lckRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgICAgIHRoaXMucGxheWluZy5uZXh0KHRydWUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNhc2UgRXZlbnRUeXBlLlJlbW90ZVBsYXlQYXVzZWQ6IHtcbiAgICAgICAgICAgIHRoaXMucGxheWluZy5uZXh0KGZhbHNlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjYXNlIEV2ZW50VHlwZS5SZW1vdGVQbGF5U3RvcHBlZDoge1xuICAgICAgICAgICAgdGhpcy5wbGF5ZWRUaW1lID0gMDtcbiAgICAgICAgICAgIHRoaXMuZmlyc3RUaW1lLm5leHQodHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLnBsYXlpbmcubmV4dChmYWxzZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgICAgY2FzZSBFdmVudFR5cGUuUmVtb3RlUGxheUVuZGVkOiB7XG4gICAgICAgICAgICB0aGlzLnBsYXlpbmcubmV4dChmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLnBsYXllZFRpbWUgPSAwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNhc2UgRXZlbnRUeXBlLlJlbW90ZVBsYXlTZWVrZWQ6IHtcbiAgICAgICAgICAgIHRoaXMuc3Bpbm5lckRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgICAgIHRoaXMucGxheWVkVGltZSA9IGV2ZW50LnZhbHVlLnNlZWtUaW1lO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNhc2UgRXZlbnRUeXBlLlJlbW90ZVNlZWtGYWlsZWQ6IHtcbiAgICAgICAgICAgIHRoaXMuc3Bpbm5lckRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgICAgIHRoaXMucGxheWluZy5uZXh0KGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheUVycm9yTWVzc2FnZShcIlwiKTtcbiAgICAgICAgICAgIGJyZWFrOyBcbiAgICAgICAgICB9XG4gICAgICAgICAgY2FzZSBFdmVudFR5cGUuUmVtb3RlUGxheVJlc3VtZWQ6IHtcbiAgICAgICAgICAgIHRoaXMuc3Bpbm5lckRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgICAgIHRoaXMucGxheWluZy5uZXh0KHRydWUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNhc2UgRXZlbnRUeXBlLkxvY2FsQXVkaW9MZXZlbDoge1xuICAgICAgICAgICAgaWYoZXZlbnQudmFsdWUgJiYgZXZlbnQudmFsdWUuYWN0aW9uKXtcbiAgICAgICAgICAgICAgc3dpdGNoKGV2ZW50LnZhbHVlLmFjdGlvbil7XG4gICAgICAgICAgICAgICAgY2FzZSBcIm11dGVcIjp7XG4gICAgICAgICAgICAgICAgICB0aGlzLm11dGVkLm5leHQodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FzZSBcInVubXV0ZVwiOntcbiAgICAgICAgICAgICAgICAgIHRoaXMubXV0ZWQubmV4dChmYWxzZSk7XG4gICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZGVmYXVsdDp7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiUmVjZWl2ZWQgdW5rbm93biBMb2NhbCBBdWRpbyBMZXZlbCBldmVudDogJXNcIiwgZXZlbnQudmFsdWUuYWN0aW9uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiUmVjZWl2ZWQgaW5jb3JyZWN0IExvY2FsIEF1ZGlvIExldmVsIGV2ZW50OiAlc1wiLCBKU09OLnN0cmluZ2lmeShldmVudCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNhc2UgRXZlbnRUeXBlLkxvY2FsQXVkaW9MZXZlbEVycm9yOntcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheUVycm9yTWVzc2FnZShcIlwiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjYXNlIEV2ZW50VHlwZS5SZW1vdGVQbGF5RmFpbGVkOiB7XG4gICAgICAgICAgICB0aGlzLnNwaW5uZXJEaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgICAgICB0aGlzLnBsYXlpbmcubmV4dChmYWxzZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgICAgY2FzZSBFdmVudFR5cGUuUmVtb3RlQ29ubmVjdGlvblJlc2V0OiB7XG4gICAgICAgICAgICB0aGlzLnNwaW5uZXJEaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgICAgICB0aGlzLmZpcnN0VGltZS5uZXh0KHRydWUpO1xuICAgICAgICAgICAgdGhpcy5wbGF5aW5nLm5leHQoZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5wbGF5ZWRUaW1lID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlVucmVjb2duaXplZCBldmVudCB0eXBlICclcydcIiwgZXZlbnQudHlwZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IFxuICAgIH0pO1xuICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgLy9Jbml0aWFsaXppbmcgZ2xvYmFsIHZhcmlhYmxlc1xuICAgIHRoaXMuZmlyc3RUaW1lID0gbmV3IEJlaGF2aW9yU3ViamVjdDxib29sZWFuPih0cnVlKTtcbiAgICB0aGlzLndzQ29ubmVjdGVkID0gbmV3IEJlaGF2aW9yU3ViamVjdDxib29sZWFuPihmYWxzZSk7XG4gICAgdGhpcy5tdXRlZCA9IG5ldyBCZWhhdmlvclN1YmplY3Q8Ym9vbGVhbj4oZmFsc2UpO1xuICAgIHRoaXMucGxheWVkVGltZSA9IDA7XG4gICAgdGhpcy5vZmZzZXQgPSBNYXRoLnJvdW5kKHRoaXMudG90YWxEdXJhdGlvbiAvIDEwMCk7XG4gICAgaWYodGhpcy5vZmZzZXQgPCAxMDAwKXtcbiAgICAgIHRoaXMub2Zmc2V0ID0gMTAwMDtcbiAgICB9XG4gICAgaWYodGhpcy5vZmZzZXQgPiA0MDAwKXtcbiAgICAgIHRoaXMub2Zmc2V0ID0gNDAwMDtcbiAgICB9XG4gICAgdGhpcy5wbGF5aW5nID0gbmV3IEJlaGF2aW9yU3ViamVjdDxib29sZWFuPihmYWxzZSk7XG4gICAgdGhpcy50b29sdGlwRGlzcGxheS5uYXRpdmVFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICB0aGlzLnNwaW5uZXJEaXNwbGF5ID0gXCJub25lXCI7XG5cbiAgICAvL1BsYXkgdGltZXJcbiAgICB0aGlzLl90aW1lciA9IHRpbWVyKDAsMTAwKS5waXBlKGZpbHRlcigoKSA9PiB0aGlzLnBsYXlpbmcudmFsdWUgPT09IHRydWUpKS5zdWJzY3JpYmUodCA9PiB7XG4gICAgICB0aGlzLnBsYXllZFRpbWUgKz0gMTAwO1xuICAgICAgaWYodGhpcy5wbGF5ZWRUaW1lID49ICh0aGlzLnRvdGFsRHVyYXRpb24gKyB0aGlzLm9mZnNldCkpe1xuICAgICAgICB0aGlzLnN0b3AoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBcbiAgICAvL0Nvbm5lY3Rpb25cbiAgICB0aGlzLndzID0gbmV3IFdlYlNvY2tldCh0aGlzLndzVXJsKTtcbiAgICB0aGlzLmt1cmVudG9TZXJ2aWNlID0gbmV3IEt1cmVudG9TZXJ2aWNlKHRoaXMud3MsIHRoaXMuYXVkaW9Tb3VyY2UsIHRoaXMudmlkZW8sIHRoaXMuZXZlbnRTZXJ2aWNlKTtcblxuICAgIC8vV2ViU29ja2V0IGV2ZW50IGhhbmRsaW5nXG4gICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgdGhpcy53cy5vbm9wZW4gPSAoZTogRXZlbnQpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwiQzNwbGF5ZXIgc2VydmljZTogQ29ubmVjdGlvbiBlc3RhYmxpc2hlZCB3aXRoIEt1cmVudG9cIik7XG4gICAgICBjb250ZXh0LndzQ29ubmVjdGVkLm5leHQodHJ1ZSk7XG4gICAgfVxuICAgIHRoaXMud3Mub25jbG9zZSA9IChlOiBDbG9zZUV2ZW50KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIkMzUGxheWVyIHNlcnZpY2U6IENvbm5lY3Rpb24gY2xvc2VkXCIpO1xuICAgICAgY29udGV4dC53c0Nvbm5lY3RlZC5uZXh0KGZhbHNlKTtcbiAgICAgIGNvbnRleHQuc3RvcCgpO1xuICAgIH1cbiAgICB0aGlzLndzLm9uZXJyb3IgPSAoZTogRXZlbnQpID0+IHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJBbiBlcnJvciBoYXMgb2NjdXJlZDogJXNcIiwgZSk7XG4gICAgICBjb250ZXh0LnN0b3AoKTtcbiAgICB9XG4gICAgdGhpcy53cy5vbm1lc3NhZ2UgPSAoZTogTWVzc2FnZUV2ZW50KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIk1lc3NhZ2UgcmVjZWl2ZWQ6IFwiK2UuZGF0YSk7XG4gICAgICBsZXQgbWVzc2FnZSA9IEpTT04ucGFyc2UoZS5kYXRhKTtcbiAgICAgIHN3aXRjaChtZXNzYWdlLmlkKXtcbiAgICAgICAgY2FzZSBcInBsYXlTdGFydGVkXCI6e1xuICAgICAgICAgIGxldCBldmVudCA6IEMzZXZlbnQgPSB7dHlwZTogRXZlbnRUeXBlLlJlbW90ZVBsYXlTdGFydGVkLCB2YWx1ZToge319O1xuICAgICAgICAgIHRoaXMuZXZlbnRTZXJ2aWNlLkVtaXR0ZXIubmV4dChldmVudCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBcInN0YXJ0UmVzcG9uc2VcIjoge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiUmVjZWl2ZWQgc3RhcnQgcmVzcG9uc2VcIik7XG4gICAgICAgICAgY29udGV4dC5rdXJlbnRvU2VydmljZS5wcm9jZXNzQW5zd2VyKG1lc3NhZ2Uuc2RwQW5zd2VyLCAoZXJyb3I6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgaWYoZXJyb3Ipe1xuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgcHJvY2Vzc2luZyByZXNwb25zZTogJXNcIiwgZXJyb3IpO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQzNQbGF5ZXIgc2VydmljZTogU0RQIHJlc3BvbnNlIHByb2Nlc3NlZFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlIFwiZXJyb3JcIjoge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBpbiB3ZWJzb2NrZXQ6ICVzXCIsIG1lc3NhZ2UubWVzc2FnZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBcInBsYXlFbmRcIjoge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiQzNQbGF5ZXIgc2VydmljZTogUGxheSBlbmRlZFwiKTtcbiAgICAgICAgICBjb250ZXh0LmZpcnN0VGltZS5uZXh0KHRydWUpO1xuICAgICAgICAgIGNvbnRleHQucGxheWluZy5uZXh0KGZhbHNlKTtcbiAgICAgICAgICBjb250ZXh0LnBsYXllZFRpbWUgPSAwO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgXCJ2aWRlb0luZm9cIjoge1xuICAgICAgICAgIGNvbnRleHQudG90YWxEdXJhdGlvbiA9IG1lc3NhZ2UudmlkZW9EdXJhdGlvbjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlIFwiaWNlQ2FuZGlkYXRlXCI6IHtcbiAgICAgICAgICBjb250ZXh0Lmt1cmVudG9TZXJ2aWNlLmFkZEljZUNhbmRpZGF0ZShtZXNzYWdlLmNhbmRpZGF0ZSwgKGVycm9yOiBzdHJpbmcpID0+e1xuICAgICAgICAgICAgaWYoZXJyb3Ipe1xuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgYWRkaW5nIGNhbmRpZGF0ZTogJXNcIiwgZXJyb3IpO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQWRkZWQgY2FuZGlkYXRlICVzXCIsIEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UuY2FuZGlkYXRlKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBcInNlZWtcIjoge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiQzNQbGF5ZXIgc2VydmljZTogU2VlayBEb25lIC0+ICVzXCIsIG1lc3NhZ2UubWVzc2FnZSk7XG4gICAgICAgICAgaWYobWVzc2FnZS5tZXNzYWdlICE9PSBcIm9rXCIpe1xuICAgICAgICAgICAgdGhpcy5kaXNwbGF5RXJyb3JNZXNzYWdlKFwiQW4gZXJyb3IgaGFzIG9jY3VyZWRcIik7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgXCJwb3NpdGlvblwiOiB7XG4gICAgICAgICAgY29udGV4dC5wbGF5ZWRUaW1lID0gbWVzc2FnZS5wb3NpdGlvbjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJDM1BsYXllciBzZXJ2aWNlOiBVbnJlY29nbml6ZWQgbWVzc2FnZSByZWNlaXZlZCAtPiAlc1wiLCBtZXNzYWdlLmlkKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCl7XG4gICAgdGhpcy5fdGltZXIudW5zdWJzY3JpYmUoKTtcbiAgICB0aGlzLmt1cmVudG9TZXJ2aWNlLnJlc2V0Q29ubmVjdGlvbigpO1xuICAgIHRoaXMud3MuY2xvc2UoKTtcbiAgfVxuXG4gIGdldFBsYXllZEhvdXJzKCk6IFN0cmluZ3tcbiAgICByZXR1cm4gdGhpcy5tYXRoU2VydmljZS5wYWQoTWF0aC5mbG9vcih0aGlzLnBsYXllZFRpbWUgLyAzNjAwMDAwKSk7XG4gIH1cblxuICBnZXRQbGF5ZWRNaW51dGVzKCk6IFN0cmluZ3tcbiAgICByZXR1cm4gdGhpcy5tYXRoU2VydmljZS5wYWQoTWF0aC5mbG9vcigoKHRoaXMucGxheWVkVGltZSAvIDEwMDApICUgMzYwMCkgLyA2MCkpO1xuICB9XG5cbiAgZ2V0UGxheWVkU2Vjb25kcygpOiBTdHJpbmd7XG4gICAgcmV0dXJuIHRoaXMubWF0aFNlcnZpY2UucGFkbSgodGhpcy5wbGF5ZWRUaW1lLzEwMDApICUgNjApO1xuICB9XG5cbiAgZ2V0VG90YWxIb3VycygpOiBTdHJpbmd7XG4gICAgcmV0dXJuIHRoaXMubWF0aFNlcnZpY2UucGFkKE1hdGguZmxvb3IodGhpcy50b3RhbER1cmF0aW9uIC8gMzYwMDAwMCkpO1xuICB9XG5cbiAgZ2V0VG90YWxNaW51dGVzKCk6IFN0cmluZ3tcbiAgICByZXR1cm4gdGhpcy5tYXRoU2VydmljZS5wYWQoTWF0aC5mbG9vcigoKHRoaXMudG90YWxEdXJhdGlvbiAvIDEwMDApICUgMzYwMCkgLyA2MCkpO1xuICB9XG5cbiAgZ2V0VG90YWxTZWNvbmRzKCk6IFN0cmluZ3tcbiAgICByZXR1cm4gdGhpcy5tYXRoU2VydmljZS5wYWQoTWF0aC5yb3VuZCh0aGlzLnRvdGFsRHVyYXRpb24vMTAwMCkgJSA2MCk7XG4gIH1cblxuICBnZXRXYW50ZWRIb3VycygpOiBTdHJpbmd7XG4gICAgcmV0dXJuIHRoaXMubWF0aFNlcnZpY2UucGFkKE1hdGguZmxvb3IodGhpcy53YW50ZWRUaW1lIC8gMzYwMDAwMCkpO1xuICB9XG5cbiAgZ2V0V2FudGVkTWludXRlcygpOiBTdHJpbmd7XG4gICAgcmV0dXJuIHRoaXMubWF0aFNlcnZpY2UucGFkKE1hdGguZmxvb3IoKCh0aGlzLndhbnRlZFRpbWUgLyAxMDAwKSAlIDM2MDApIC8gNjApKTtcbiAgfVxuXG4gIGdldFdhbnRlZFNlY29uZHMoKTogU3RyaW5ne1xuICAgIHJldHVybiB0aGlzLm1hdGhTZXJ2aWNlLnBhZChNYXRoLmZsb29yKCh0aGlzLndhbnRlZFRpbWUvMTAwMCkgJSA2MCkpO1xuICB9XG5cbiAgZ2V0U2Vla1Bvc2l0aW9uKCl7XG4gICAgcmV0dXJuIE1hdGguZmxvb3IoKHRoaXMucGxheWVkVGltZS90aGlzLnRvdGFsRHVyYXRpb24pKnRoaXMucGxheWVyLm5hdGl2ZUVsZW1lbnQub2Zmc2V0V2lkdGgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRPRE8gaW1wbGVtZW50YXIgbWV0b2Rvc1xuICAgKi9cbiAgcGxheSgpOiB2b2lke1xuICAgIGlmKHRoaXMucGxheWluZy52YWx1ZSA9PT0gdHJ1ZSl7XG4gICAgICAgLy9QYXVzZSB0aGUgdmlkZW9cbiAgICAgIHRoaXMua3VyZW50b1NlcnZpY2UucGF1c2UoKTtcbiAgICB9ZWxzZXtcbiAgICAgIGlmKHRoaXMuZmlyc3RUaW1lLnZhbHVlID09PSB0cnVlKXtcbiAgICAgICAgLy9QbGF5XG4gICAgICAgIHRoaXMuc3Bpbm5lckRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgICAgIHRoaXMuZmlyc3RUaW1lLm5leHQoZmFsc2UpO1xuICAgICAgICB0aGlzLmt1cmVudG9TZXJ2aWNlLnN0YXJ0KHRoaXMucGxheWVkVGltZSk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgLy9SZXN1bWVcbiAgICAgICAgdGhpcy5zcGlubmVyRGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICAgICAgdGhpcy5rdXJlbnRvU2VydmljZS5yZXN1bWUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzdG9wKCk6IHZvaWR7XG4gICAgaWYodGhpcy53c0Nvbm5lY3RlZC52YWx1ZSA9PT0gdHJ1ZSl7XG4gICAgICB0aGlzLmt1cmVudG9TZXJ2aWNlLnVubXV0ZSgpO1xuICAgICAgdGhpcy5rdXJlbnRvU2VydmljZS5zdG9wKCk7XG4gICAgfWVsc2V7XG4gICAgICB0aGlzLnBsYXllZFRpbWUgPSAwO1xuICAgICAgdGhpcy5maXJzdFRpbWUubmV4dCh0cnVlKTtcbiAgICAgIHRoaXMucGxheWluZy5uZXh0KGZhbHNlKTtcbiAgICB9XG4gIH1cblxuICBzZWVrQ2xpY2tlZChldmVudCk6IHZvaWR7XG4gICAgXG4gIH1cblxuICBzZWVrUmVsZWFzZWQoZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lke1xuICAgIC8vc2V0IHBsYXllZFRpbWUgYW5kIHNlZWtQb3NpdGlvblxuICAgIHRoaXMuc3Bpbm5lckRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgbGV0IGNsaWNrZWQ6IG51bWJlciA9IE1hdGguZmxvb3IodGhpcy50b3RhbER1cmF0aW9uKihldmVudC5vZmZzZXRYL3RoaXMucGxheWVyLm5hdGl2ZUVsZW1lbnQub2Zmc2V0V2lkdGgpKTtcbiAgICB0aGlzLmt1cmVudG9TZXJ2aWNlLmRvU2Vla0F0KGNsaWNrZWQpO1xuICB9XG5cbiAgc2Vla0RyYWdnZWQoKTogdm9pZHtcbiAgICBjb25zb2xlLmxvZyhcIlNlZWsgZHJhZ2dlZFwiKTtcbiAgfVxuXG4gIG9uRHJhZ1N0YXJ0KGV2ZW50KXtcbiAgICBjb25zb2xlLmxvZyhcIkRyYWcgc3RhcnRcIik7XG4gIH1cblxuICBvbkRyYWdFbmQoZXZlbnQpe1xuICAgIGNvbnNvbGUubG9nKFwiRHJhZyBlbmRcIik7XG4gIH1cblxuICBvbk1vdXNlT3ZlclNlZWsoZXZlbnQ6IE1vdXNlRXZlbnQpe1xuICAgIHRoaXMudG9vbHRpcERpc3BsYXkubmF0aXZlRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gXCJpbmxpbmUtYmxvY2tcIjtcbiAgICB0aGlzLnRvb2x0aXBEaXNwbGF5Lm5hdGl2ZUVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gXCJ0cmFuc2xhdGUoXCIrZXZlbnQub2Zmc2V0WCtcInB4LFwiKygxNStldmVudC5vZmZzZXRZKStcInB4KVwiO1xuICB9XG5cbiAgb25Nb3VzZUV4aXRTZWVrKGV2ZW50OiBNb3VzZUV2ZW50KXtcbiAgICB0aGlzLnRvb2x0aXBEaXNwbGF5Lm5hdGl2ZUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICB9XG5cbiAgb25Nb3VzZU1vdmVTZWVrKGV2ZW50OiBNb3VzZUV2ZW50KXtcbiAgICB0aGlzLndhbnRlZFRpbWUgPSBNYXRoLmZsb29yKHRoaXMudG90YWxEdXJhdGlvbiooZXZlbnQub2Zmc2V0WC90aGlzLnBsYXllci5uYXRpdmVFbGVtZW50Lm9mZnNldFdpZHRoKSk7XG4gICAgaWYodGhpcy5wbGF5ZXIubmF0aXZlRWxlbWVudC5vZmZzZXRXaWR0aCAtIGV2ZW50Lm9mZnNldFggPD0gNTUpe1xuICAgICAgdGhpcy50b29sdGlwRGlzcGxheS5uYXRpdmVFbGVtZW50LnN0eWxlLnRyYW5zZm9ybSA9IFwidHJhbnNsYXRlKFwiKyhldmVudC5vZmZzZXRYIC0gNTUpK1wicHgsXCIrKDE1K2V2ZW50Lm9mZnNldFkpK1wicHgpXCI7XG4gICAgfWVsc2V7XG4gICAgICB0aGlzLnRvb2x0aXBEaXNwbGF5Lm5hdGl2ZUVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gXCJ0cmFuc2xhdGUoXCIrZXZlbnQub2Zmc2V0WCtcInB4LFwiKygxNStldmVudC5vZmZzZXRZKStcInB4KVwiO1xuICAgIH1cbiAgfVxuXG4gIGRpc3BsYXlFcnJvck1lc3NhZ2UoZXJyb3I6IHN0cmluZykgOiB2b2lke1xuXG4gIH1cblxuICBzd2l0Y2hTb3VuZCgpOiB2b2lke1xuICAgIGlmKHRoaXMubXV0ZWQudmFsdWUgPT09IHRydWUpe1xuICAgICAgdGhpcy5rdXJlbnRvU2VydmljZS51bm11dGUoKTtcbiAgICB9ZWxzZXtcbiAgICAgIHRoaXMua3VyZW50b1NlcnZpY2UubXV0ZSgpO1xuICAgIH1cbiAgfVxufVxuIl19