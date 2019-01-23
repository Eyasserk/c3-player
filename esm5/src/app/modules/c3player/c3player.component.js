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
var C3playerComponent = /** @class */ (function () {
    function C3playerComponent(mathService, eventService) {
        var _this = this;
        this.mathService = mathService;
        this.eventService = eventService;
        this.wantedTime = 0; //tooltip
        eventService.Emitter.subscribe(function (event) {
            if (event) {
                switch (event.type) {
                    case EventType.LocalConnectionError: {
                        _this.spinnerDisplay = "none";
                        _this.playing.next(false);
                        _this.displayErrorMessage("");
                        break;
                    }
                    case EventType.RemotePlayStarted: {
                        _this.spinnerDisplay = "none";
                        _this.playing.next(true);
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
                        _this.spinnerDisplay = "none";
                        _this.playedTime = event.value.seekTime;
                        break;
                    }
                    case EventType.RemoteSeekFailed: {
                        _this.spinnerDisplay = "none";
                        _this.playing.next(false);
                        _this.displayErrorMessage("");
                        break;
                    }
                    case EventType.RemotePlayResumed: {
                        _this.spinnerDisplay = "none";
                        _this.playing.next(true);
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
                        _this.displayErrorMessage("");
                        break;
                    }
                    case EventType.RemotePlayFailed: {
                        _this.spinnerDisplay = "none";
                        _this.playing.next(false);
                        break;
                    }
                    case EventType.RemoteConnectionReset: {
                        _this.spinnerDisplay = "none";
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
        this._timer = timer(0, 100).pipe(filter(function () { return _this.playing.value === true; })).subscribe(function (t) {
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
            console.log("C3Player service: Connection closed");
            context.wsConnected.next(false);
            context.stop();
        };
        this.ws.onerror = function (e) {
            console.error("An error has occured: %s", e);
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
        this.spinnerDisplay = "block";
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
    C3playerComponent.decorators = [
        { type: Component, args: [{
                    selector: 'c3-player',
                    template: "<div class=\"player jquery-trackswitch\" style=\"width: 50%; margin: auto;\" #c3player>\n    <div class=\"main-control\">\n        <div class=\"seekable-img-wrap\" style=\"display: block;\">\n            <img class=\"seekable\" data-seek-margin-left=\"0\" data-seek-margin-right=\"0\" src=\"{{imageSource}}\">\n            <div class=\"seekwrap seekwrap-custom\"  \n                (mousedown)=\"seekClicked($event)\" \n                (mouseup)=\"seekReleased($event)\" \n                (mouseover)=\"onMouseOverSeek($event)\" \n                (mouseout)=\"onMouseExitSeek($event)\"\n                (mousemove)=\"onMouseMoveSeek($event)\">\n                <div class=\"seekhead\" [style.transform]=\"'translate('+getSeekPosition()+'px,0px)'\" #seekbar>\n                </div>\n                <span class=\"seek-tooltip\" #tooltipDisplay>{{getWantedHours()}}:{{getWantedMinutes()}}:{{getWantedSeconds()}}</span>\n            </div>\n            <div style=\"display: none;\">\n                <audio id=\"gum-local\" controls autoplay #videoelement></audio>\n            </div>\n        </div>\n        <ul class=\"control\">\n            <li class=\"playpause {{playing.value ? 'checked':'' }} button\" (click)=\"play()\">Play</li>\n            <li class=\"stop button\" (click)=\"stop()\">Stop</li>\n            <li class=\"volume {{muted.value ? 'checked':'' }} button\" (click)=\"switchSound()\">Sound</li>\n            <li class=\"timing\"><span class=\"time\">{{getPlayedHours()}}:{{getPlayedMinutes()}}:{{getPlayedSeconds()}}</span> / <span class=\"length\">{{getTotalHours()}}:{{getTotalMinutes()}}:{{getTotalSeconds()}}</span></li>\n            <li class=\"seekwrap\" style=\"display: none;\">\n                <div class=\"seekbar\">\n                    <div class=\"seekhead\"></div>\n                </div>\n            </li>\n        </ul>\n    </div>\n</div>\n",
                    styles: ["html{position:relative;min-height:100%}body{padding-top:40px}.seekwrap-custom{left:0;right:0}.seek-tooltip{background-color:#000;margin:0 auto;color:#eee;font-size:15px;font-family:'Lucida Sans','Lucida Sans Regular','Lucida Grande','Lucida Sans Unicode',Geneva,Verdana,sans-serif}.hidden-video{display:none}#console,video{display:block;font-size:14px;line-height:1.42857143;color:#555;background-color:#fff;background-image:none;border:1px solid #ccc;border-radius:4px;box-shadow:inset 0 1px 1px rgba(0,0,0,.075);transition:border-color .15s ease-in-out,box-shadow .15s ease-in-out}#console{overflow-y:auto;width:100%;height:175px}#videoContainer{position:absolute;float:left}#videoBig{width:640px;height:480px;top:0;left:0;z-index:1}div#videoSmall{width:240px;height:180px;padding:0;position:absolute;top:15px;left:400px;cursor:pointer;z-index:10}div.dragged{cursor:all-scroll!important;border-color:#00f!important;z-index:10!important}.jquery-trackswitch a,.jquery-trackswitch abbr,.jquery-trackswitch acronym,.jquery-trackswitch address,.jquery-trackswitch applet,.jquery-trackswitch article,.jquery-trackswitch aside,.jquery-trackswitch audio,.jquery-trackswitch b,.jquery-trackswitch big,.jquery-trackswitch blockquote,.jquery-trackswitch canvas,.jquery-trackswitch caption,.jquery-trackswitch center,.jquery-trackswitch cite,.jquery-trackswitch code,.jquery-trackswitch dd,.jquery-trackswitch del,.jquery-trackswitch details,.jquery-trackswitch dfn,.jquery-trackswitch div,.jquery-trackswitch dl,.jquery-trackswitch dt,.jquery-trackswitch em,.jquery-trackswitch embed,.jquery-trackswitch fieldset,.jquery-trackswitch figcaption,.jquery-trackswitch figure,.jquery-trackswitch footer,.jquery-trackswitch form,.jquery-trackswitch h1,.jquery-trackswitch h2,.jquery-trackswitch h3,.jquery-trackswitch h4,.jquery-trackswitch h5,.jquery-trackswitch h6,.jquery-trackswitch header,.jquery-trackswitch hgroup,.jquery-trackswitch i,.jquery-trackswitch iframe,.jquery-trackswitch img,.jquery-trackswitch ins,.jquery-trackswitch kbd,.jquery-trackswitch label,.jquery-trackswitch legend,.jquery-trackswitch li,.jquery-trackswitch mark,.jquery-trackswitch menu,.jquery-trackswitch nav,.jquery-trackswitch object,.jquery-trackswitch ol,.jquery-trackswitch output,.jquery-trackswitch p,.jquery-trackswitch pre,.jquery-trackswitch q,.jquery-trackswitch ruby,.jquery-trackswitch s,.jquery-trackswitch samp,.jquery-trackswitch section,.jquery-trackswitch small,.jquery-trackswitch span,.jquery-trackswitch strike,.jquery-trackswitch strong,.jquery-trackswitch sub,.jquery-trackswitch summary,.jquery-trackswitch sup,.jquery-trackswitch table,.jquery-trackswitch tbody,.jquery-trackswitch td,.jquery-trackswitch tfoot,.jquery-trackswitch th,.jquery-trackswitch thead,.jquery-trackswitch time,.jquery-trackswitch tr,.jquery-trackswitch tt,.jquery-trackswitch u,.jquery-trackswitch ul,.jquery-trackswitch var,.jquery-trackswitch video{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}.jquery-trackswitch article,.jquery-trackswitch aside,.jquery-trackswitch details,.jquery-trackswitch figcaption,.jquery-trackswitch figure,.jquery-trackswitch footer,.jquery-trackswitch header,.jquery-trackswitch hgroup,.jquery-trackswitch menu,.jquery-trackswitch nav,.jquery-trackswitch section{display:block}.jquery-trackswitch ol,.jquery-trackswitch ul{list-style:none}.jquery-trackswitch blockquote,.jquery-trackswitch q{quotes:none}.jquery-trackswitch blockquote:after,.jquery-trackswitch blockquote:before,.jquery-trackswitch q:after,.jquery-trackswitch q:before{content:'';content:none}.jquery-trackswitch table{border-collapse:collapse;border-spacing:0}.jquery-trackswitch *,.jquery-trackswitch :after,.jquery-trackswitch :before{box-sizing:border-box}.jquery-trackswitch{background:#eee;position:relative;margin:10px;overflow:hidden;color:#000;line-height:1}.jquery-trackswitch ts-track{display:none}.jquery-trackswitch ul{margin:0;padding:0}.jquery-trackswitch li{margin:0;padding:0;list-style:none}.jquery-trackswitch .control li.button:after,.jquery-trackswitch .overlay span:after,.jquery-trackswitch li.track.error:before{content:\"\";display:block;font-family:FontAwesome;font-style:normal;font-weight:400;font-size:16px;line-height:1;text-indent:0}.jquery-trackswitch .overlay{background-color:rgba(0,0,0,.3);position:absolute;top:0;right:0;bottom:0;left:0;z-index:10}.jquery-trackswitch .overlay #overlayinfo span.info,.jquery-trackswitch .overlay>p,.jquery-trackswitch .overlay>span{display:block;position:absolute;text-align:center}.jquery-trackswitch .overlay>span{background-color:#f1c40f;width:50px;height:50px;top:calc(50% - 25px);left:calc(50% - 25px);text-indent:-9999px;line-height:0;border-radius:100%;cursor:pointer}.jquery-trackswitch .overlay>span.loading{cursor:inherit}.jquery-trackswitch .overlay>span:after{content:\"\\f011\";padding-top:7px;font-size:28pt}.jquery-trackswitch .overlay>span.loading:after{content:\"\\f110\"}.jquery-trackswitch.error .overlay{background:rgba(0,0,0,.6)}.jquery-trackswitch.error .overlay>span{background:#c03328;cursor:inherit}.jquery-trackswitch.error .overlay>span:after{content:\"\\f12a\"}.jquery-trackswitch.error .overlay p{width:100%;top:calc(50% + 35px);color:#fff}.jquery-trackswitch .overlay #overlayinfo{height:40px;width:100%;bottom:5px;right:10px;color:#000;text-align:right;font-size:14pt}.jquery-trackswitch .overlay #overlayinfo span.info{bottom:0;right:0;width:380px;cursor:pointer;text-indent:-9999px;opacity:.4}.jquery-trackswitch .overlay #overlayinfo span.info:after{content:\"\\f05a\";position:absolute;bottom:0;right:0;font-size:16pt}.jquery-trackswitch .overlay #overlayinfo span.text{display:none;position:absolute;right:0}.jquery-trackswitch .overlay #overlayinfo span.text strong{font-weight:700}.jquery-trackswitch .overlay #overlayinfo a{color:#eee;text-decoration:underline}.jquery-trackswitch .main-control ul{background-color:#333;height:auto;min-height:36px;padding:4px 12px;overflow:hidden;color:#ddd}.jquery-trackswitch .main-control .button{float:left;width:15px;margin:7px 10px 0 0;cursor:pointer}.jquery-trackswitch .main-control .timing{float:right;font-family:monospace;margin:7px 0 0 10px}.jquery-trackswitch .main-control .seekwrap{overflow:hidden;height:100%;cursor:pointer}.jquery-trackswitch .main-control .seekwrap .seekbar{background-color:#ed8c01;height:6px;margin:11px 4px 0 0;position:relative;box-shadow:4px 0 0 0 #ed8c01}.jquery-trackswitch .main-control .seekwrap .seekbar .seekhead{background-color:#ed8c01;position:absolute;width:4px;height:22px;top:-8px;left:0}.jquery-trackswitch>p{margin:12px 10px}.jquery-trackswitch img{max-width:100%;display:block;margin:0;padding:0}.jquery-trackswitch .seekable-img-wrap{display:inline-block;position:relative}.jquery-trackswitch .seekable-img-wrap .seekwrap{position:absolute;top:0;right:0;bottom:0;left:0;cursor:pointer}.jquery-trackswitch .seekable-img-wrap .seekwrap .seekhead{position:absolute;top:0;bottom:0;border-left:2px solid #000;border-right:2px solid #fff}.jquery-trackswitch ul.track_list{padding:0}.jquery-trackswitch li.track{background-color:#ddd;position:relative;min-height:32px;padding:8px 10px 8px 60px}.jquery-trackswitch li.track.tabs{display:inline-block;padding-right:12px;border:1px solid #999}.jquery-trackswitch li.track:not(.tabs):nth-child(even){background-color:#eee}.jquery-trackswitch li.track.error{background-color:#dd9b9b!important}.jquery-trackswitch li.track.error:before{content:\"\\f071  ERROR\";display:inline;padding-right:10px;color:#7c2525;cursor:inherit}.jquery-trackswitch li.track ul.control{position:absolute;top:calc(50% - 14px);left:5px;padding-left:2px}.jquery-trackswitch li.track ul.control li{display:inline-block;width:24px;height:24px;text-align:center}.jquery-trackswitch .control li.button{position:relative;text-indent:-9999px;line-height:0;cursor:pointer}.jquery-trackswitch .control li.button:after{position:absolute;top:0}.jquery-trackswitch .control li.playpause:after{content:\"\\f04b\"}.jquery-trackswitch .control li.playpause.checked:after{content:\"\\f04c\"}.jquery-trackswitch .control li.volume:after{content:\"\\f028\"}.jquery-trackswitch .control li.volume.checked:after{content:\"\\f026\"}.jquery-trackswitch .control li.stop:after{content:\"\\f04d\"}.jquery-trackswitch .control li.repeat:after{content:\"\\f01e\";opacity:.5}.jquery-trackswitch .control li.repeat.checked:after{opacity:1}.jquery-trackswitch .control li.mute:after{content:\"\\f028\";position:absolute;bottom:50%;left:4px}.jquery-trackswitch .control li.mute.checked:after{content:\"\\f026\"}.jquery-trackswitch .control li.solo:after{content:\"\\f10c\";position:absolute;bottom:50%;left:4px}.jquery-trackswitch .control li.solo.checked:after{content:\"\\f05d\"}.jquery-trackswitch .control li.solo.radio{margin:0}.jquery-trackswitch .control li.solo.radio.checked:after{content:\"\\f192\"}@media (max-width:767px){.jquery-trackswitch .overlay span{width:70px;height:70px;top:calc(50% - 35px);left:calc(50% - 35px);line-height:10px}.jquery-trackswitch .overlay span:after{padding-top:3px;font-size:36pt}.jquery-trackswitch.error .overlay p{top:calc(50% + 45px)}.jquery-trackswitch .control li.button:after{font-size:23px}.jquery-trackswitch .main-control .button{margin:4px 22px 0 0}.jquery-trackswitch .main-control .seekwrap{width:100%;margin-top:30px}.jquery-trackswitch li.track{padding-left:80px}.jquery-trackswitch li.track ul.control{top:calc(50% - 19px)}.jquery-trackswitch .track .control li.button{margin:0 10px 0 0}.jquery-trackswitch .control li.mute:after,.jquery-trackswitch .control li.solo:after{padding-top:0;bottom:35%}}@media (max-width:400px){.jquery-trackswitch .main-control{text-align:center}.jquery-trackswitch .main-control .button{float:none;display:inline-block;margin:0 14px}.jquery-trackswitch .main-control .timing{width:100%;float:none;margin:32px 0 8px}.jquery-trackswitch .main-control .seekwrap{margin-top:8px}}"]
                }] }
    ];
    /** @nocollapse */
    C3playerComponent.ctorParameters = function () { return [
        { type: MathService },
        { type: EventService }
    ]; };
    C3playerComponent.propDecorators = {
        tooltipDisplay: [{ type: ViewChild, args: ['tooltipDisplay',] }],
        player: [{ type: ViewChild, args: ['c3player',] }],
        video: [{ type: ViewChild, args: ['videoelement',] }],
        imageSource: [{ type: Input }],
        audioSource: [{ type: Input }],
        wsUrl: [{ type: Input }],
        totalDuration: [{ type: Input }]
    };
    return C3playerComponent;
}());
export { C3playerComponent };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYzNwbGF5ZXIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vYzMtcGxheWVyLyIsInNvdXJjZXMiOlsic3JjL2FwcC9tb2R1bGVzL2MzcGxheWVyL2MzcGxheWVyLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQXFCLFNBQVMsRUFBRSxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFMUYsT0FBTyxFQUFFLGVBQWUsRUFBRSxLQUFLLEVBQWUsTUFBTSxNQUFNLENBQUM7QUFDM0QsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ3hDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDaEUsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRTVELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUV6RDtJQStDRSwyQkFBb0IsV0FBd0IsRUFBVSxZQUEwQjtRQUFoRixpQkF1RkM7UUF2Rm1CLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1FBQVUsaUJBQVksR0FBWixZQUFZLENBQWM7UUF4QnhFLGVBQVUsR0FBVyxDQUFDLENBQUMsQ0FBQyxTQUFTO1FBeUJ2QyxZQUFZLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxVQUFDLEtBQWM7WUFDNUMsSUFBRyxLQUFLLEVBQUM7Z0JBQ1AsUUFBTyxLQUFLLENBQUMsSUFBSSxFQUFDO29CQUNoQixLQUFLLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO3dCQUNuQyxLQUFJLENBQUMsY0FBYyxHQUFHLE1BQU0sQ0FBQzt3QkFDN0IsS0FBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQ3pCLEtBQUksQ0FBQyxtQkFBbUIsQ0FBQyxFQUFF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QUssSUFBSSxFQUFDO1lBQzNCLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUM7U0FDOUI7YUFBSTtZQUNILElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDNUI7SUFDSCxDQUFDOztnQkFwWEYsU0FBUyxTQUFDO29CQUNULFFBQVEsRUFBRSxXQUFXO29CQUNyQixxMkRBQXdDOztpQkFFekM7Ozs7Z0JBVlEsV0FBVztnQkFFWCxZQUFZOzs7aUNBMEJsQixTQUFTLFNBQUMsZ0JBQWdCO3lCQUkxQixTQUFTLFNBQUMsVUFBVTt3QkFFcEIsU0FBUyxTQUFDLGNBQWM7OEJBRXhCLEtBQUs7OEJBR0wsS0FBSzt3QkFHTCxLQUFLO2dDQUdMLEtBQUs7O0lBOFVSLHdCQUFDO0NBQUEsQUFyWEQsSUFxWEM7U0FoWFksaUJBQWlCOzs7Ozs7SUFFNUIsK0JBQXNCOzs7OztJQUd0QiwyQ0FBdUM7Ozs7O0lBR3ZDLG1DQUE2Qjs7Ozs7SUFDN0IsbUNBQXVCOztJQUd2QixvQ0FBa0M7Ozs7O0lBQ2xDLHdDQUE4Qzs7Ozs7SUFHOUMsdUNBQTJCOztJQUMzQiwyQ0FBd0Q7Ozs7O0lBQ3hELHVDQUErQjs7SUFHL0IsbUNBQTBDOztJQUUxQyxrQ0FBNkM7O0lBRTdDLHdDQUNvQjs7SUFFcEIsd0NBQ29COztJQUVwQixrQ0FDYzs7SUFFZCwwQ0FDc0I7O0lBRXRCLDJDQUF1Qjs7SUFDdkIsa0NBQWdDOzs7OztJQUVoQyxzQ0FBNEM7Ozs7O0lBRWhDLHdDQUFnQzs7Ozs7SUFBRSx5Q0FBa0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIElucHV0LCBPbkluaXQsIE9uRGVzdHJveSwgVmlld0NoaWxkLCBFbGVtZW50UmVmfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgQmVoYXZpb3JTdWJqZWN0LCB0aW1lciwgU3Vic2NyaXB0aW9ufSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGZpbHRlciB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7IE1hdGhTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vc2VydmljZXMvbWF0aC5zZXJ2aWNlJztcbmltcG9ydCB7IEt1cmVudG9TZXJ2aWNlIH0gZnJvbSAnLi4vLi4vc2VydmljZXMva3VyZW50by5zZXJ2aWNlJztcbmltcG9ydCB7IEV2ZW50U2VydmljZSB9IGZyb20gJy4uLy4uL3NlcnZpY2VzL2V2ZW50LnNlcnZpY2UnO1xuaW1wb3J0IHsgQzNldmVudCB9IGZyb20gJy4uLy4uL21vZGVscy9jM2V2ZW50JztcbmltcG9ydCB7IEV2ZW50VHlwZSB9IGZyb20gJy4uLy4uL21vZGVscy9ldmVudC10eXBlLmVudW0nO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdjMy1wbGF5ZXInLFxuICB0ZW1wbGF0ZVVybDogJy4vYzNwbGF5ZXIuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsnLi9jM3BsYXllci5jb21wb25lbnQuY3NzJ11cbn0pXG5leHBvcnQgY2xhc3MgQzNwbGF5ZXJDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG5cbiAgcHJpdmF0ZSB3czogV2ViU29ja2V0O1xuXG4gIC8vS3VyZW50byBzZXJ2aWNlXG4gIHByaXZhdGUga3VyZW50b1NlcnZpY2U6IEt1cmVudG9TZXJ2aWNlO1xuXG4gIC8vdGltZXIgZm9yIHBsYXkgdGltZVxuICBwcml2YXRlIF90aW1lcjogU3Vic2NyaXB0aW9uO1xuICBwcml2YXRlIG9mZnNldDogbnVtYmVyOyAvL21heCBkaWZmZXJlbmNlIGJldHdlZW4gcmVtb3RlIGFuZCBsb2NhbCBwbGF5XG5cbiAgLy9oYW5kbGUgaWYgY29tcG9uZW50IGlzIHBsYXlpbmdcbiAgcGxheWluZzogQmVoYXZpb3JTdWJqZWN0PGJvb2xlYW4+O1xuICBwcml2YXRlIHdzQ29ubmVjdGVkOiBCZWhhdmlvclN1YmplY3Q8Ym9vbGVhbj47XG5cbiAgLy9QbGF5IGhhbmRsaW5nXG4gIHByaXZhdGUgcGxheWVkVGltZTogbnVtYmVyOyAvL21pbGxpc2Vjb25kc1xuICBAVmlld0NoaWxkKCd0b29sdGlwRGlzcGxheScpIHRvb2x0aXBEaXNwbGF5OiBFbGVtZW50UmVmO1xuICBwcml2YXRlIHdhbnRlZFRpbWU6IG51bWJlciA9IDA7IC8vdG9vbHRpcFxuXG4gIC8vT3duIGNvbXBvbmVudFxuICBAVmlld0NoaWxkKCdjM3BsYXllcicpIHBsYXllcjogRWxlbWVudFJlZjsgXG5cbiAgQFZpZXdDaGlsZCgndmlkZW9lbGVtZW50JykgdmlkZW86IEVsZW1lbnRSZWY7XG5cbiAgQElucHV0KClcbiAgaW1hZ2VTb3VyY2U6IHN0cmluZzsgXG5cbiAgQElucHV0KClcbiAgYXVkaW9Tb3VyY2U6IHN0cmluZztcblxuICBASW5wdXQoKVxuICB3c1VybDogc3RyaW5nO1xuXG4gIEBJbnB1dCgpXG4gIHRvdGFsRHVyYXRpb246IG51bWJlcjtcblxuICBzcGlubmVyRGlzcGxheTogc3RyaW5nO1xuICBtdXRlZDogQmVoYXZpb3JTdWJqZWN0PGJvb2xlYW4+O1xuXG4gIHByaXZhdGUgZmlyc3RUaW1lOiBCZWhhdmlvclN1YmplY3Q8Ym9vbGVhbj47XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBtYXRoU2VydmljZTogTWF0aFNlcnZpY2UsIHByaXZhdGUgZXZlbnRTZXJ2aWNlOiBFdmVudFNlcnZpY2Upe1xuICAgIGV2ZW50U2VydmljZS5FbWl0dGVyLnN1YnNjcmliZSgoZXZlbnQ6IEMzZXZlbnQpID0+IHtcbiAgICAgIGlmKGV2ZW50KXtcbiAgICAgICAgc3dpdGNoKGV2ZW50LnR5cGUpe1xuICAgICAgICAgIGNhc2UgRXZlbnRUeXBlLkxvY2FsQ29ubmVjdGlvbkVycm9yOiB7XG4gICAgICAgICAgICB0aGlzLnNwaW5uZXJEaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgICAgICB0aGlzLnBsYXlpbmcubmV4dChmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLmRpc3BsYXlFcnJvck1lc3NhZ2UoXCJcIik7XG4gICAgICAgICAgICBicmVhazsgXG4gICAgICAgICAgfVxuICAgICAgICAgIGNhc2UgRXZlbnRUeXBlLlJlbW90ZVBsYXlTdGFydGVkOiB7XG4gICAgICAgICAgICB0aGlzLnNwaW5uZXJEaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgICAgICB0aGlzLnBsYXlpbmcubmV4dCh0cnVlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjYXNlIEV2ZW50VHlwZS5SZW1vdGVQbGF5UGF1c2VkOiB7XG4gICAgICAgICAgICB0aGlzLnBsYXlpbmcubmV4dChmYWxzZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgICAgY2FzZSBFdmVudFR5cGUuUmVtb3RlUGxheVN0b3BwZWQ6IHtcbiAgICAgICAgICAgIHRoaXMucGxheWVkVGltZSA9IDA7XG4gICAgICAgICAgICB0aGlzLmZpcnN0VGltZS5uZXh0KHRydWUpO1xuICAgICAgICAgICAgdGhpcy5wbGF5aW5nLm5leHQoZmFsc2UpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNhc2UgRXZlbnRUeXBlLlJlbW90ZVBsYXlFbmRlZDoge1xuICAgICAgICAgICAgdGhpcy5wbGF5aW5nLm5leHQoZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5wbGF5ZWRUaW1lID0gMDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjYXNlIEV2ZW50VHlwZS5SZW1vdGVQbGF5U2Vla2VkOiB7XG4gICAgICAgICAgICB0aGlzLnNwaW5uZXJEaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgICAgICB0aGlzLnBsYXllZFRpbWUgPSBldmVudC52YWx1ZS5zZWVrVGltZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjYXNlIEV2ZW50VHlwZS5SZW1vdGVTZWVrRmFpbGVkOiB7XG4gICAgICAgICAgICB0aGlzLnNwaW5uZXJEaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgICAgICB0aGlzLnBsYXlpbmcubmV4dChmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLmRpc3BsYXlFcnJvck1lc3NhZ2UoXCJcIik7XG4gICAgICAgICAgICBicmVhazsgXG4gICAgICAgICAgfVxuICAgICAgICAgIGNhc2UgRXZlbnRUeXBlLlJlbW90ZVBsYXlSZXN1bWVkOiB7XG4gICAgICAgICAgICB0aGlzLnNwaW5uZXJEaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgICAgICB0aGlzLnBsYXlpbmcubmV4dCh0cnVlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjYXNlIEV2ZW50VHlwZS5Mb2NhbEF1ZGlvTGV2ZWw6IHtcbiAgICAgICAgICAgIGlmKGV2ZW50LnZhbHVlICYmIGV2ZW50LnZhbHVlLmFjdGlvbil7XG4gICAgICAgICAgICAgIHN3aXRjaChldmVudC52YWx1ZS5hY3Rpb24pe1xuICAgICAgICAgICAgICAgIGNhc2UgXCJtdXRlXCI6e1xuICAgICAgICAgICAgICAgICAgdGhpcy5tdXRlZC5uZXh0KHRydWUpO1xuICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgXCJ1bm11dGVcIjp7XG4gICAgICAgICAgICAgICAgICB0aGlzLm11dGVkLm5leHQoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6e1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlJlY2VpdmVkIHVua25vd24gTG9jYWwgQXVkaW8gTGV2ZWwgZXZlbnQ6ICVzXCIsIGV2ZW50LnZhbHVlLmFjdGlvbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlJlY2VpdmVkIGluY29ycmVjdCBMb2NhbCBBdWRpbyBMZXZlbCBldmVudDogJXNcIiwgSlNPTi5zdHJpbmdpZnkoZXZlbnQpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjYXNlIEV2ZW50VHlwZS5Mb2NhbEF1ZGlvTGV2ZWxFcnJvcjp7XG4gICAgICAgICAgICB0aGlzLmRpc3BsYXlFcnJvck1lc3NhZ2UoXCJcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgICAgY2FzZSBFdmVudFR5cGUuUmVtb3RlUGxheUZhaWxlZDoge1xuICAgICAgICAgICAgdGhpcy5zcGlubmVyRGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICAgICAgdGhpcy5wbGF5aW5nLm5leHQoZmFsc2UpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNhc2UgRXZlbnRUeXBlLlJlbW90ZUNvbm5lY3Rpb25SZXNldDoge1xuICAgICAgICAgICAgdGhpcy5zcGlubmVyRGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICAgICAgdGhpcy5maXJzdFRpbWUubmV4dCh0cnVlKTtcbiAgICAgICAgICAgIHRoaXMucGxheWluZy5uZXh0KGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMucGxheWVkVGltZSA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJVbnJlY29nbml6ZWQgZXZlbnQgdHlwZSAnJXMnXCIsIGV2ZW50LnR5cGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBcbiAgICB9KTtcbiAgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIC8vSW5pdGlhbGl6aW5nIGdsb2JhbCB2YXJpYWJsZXNcbiAgICB0aGlzLmZpcnN0VGltZSA9IG5ldyBCZWhhdmlvclN1YmplY3Q8Ym9vbGVhbj4odHJ1ZSk7XG4gICAgdGhpcy53c0Nvbm5lY3RlZCA9IG5ldyBCZWhhdmlvclN1YmplY3Q8Ym9vbGVhbj4oZmFsc2UpO1xuICAgIHRoaXMubXV0ZWQgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PGJvb2xlYW4+KGZhbHNlKTtcbiAgICB0aGlzLnBsYXllZFRpbWUgPSAwO1xuICAgIHRoaXMub2Zmc2V0ID0gTWF0aC5yb3VuZCh0aGlzLnRvdGFsRHVyYXRpb24gLyAxMDApO1xuICAgIGlmKHRoaXMub2Zmc2V0IDwgMTAwMCl7XG4gICAgICB0aGlzLm9mZnNldCA9IDEwMDA7XG4gICAgfVxuICAgIGlmKHRoaXMub2Zmc2V0ID4gNDAwMCl7XG4gICAgICB0aGlzLm9mZnNldCA9IDQwMDA7XG4gICAgfVxuICAgIHRoaXMucGxheWluZyA9IG5ldyBCZWhhdmlvclN1YmplY3Q8Ym9vbGVhbj4oZmFsc2UpO1xuICAgIHRoaXMudG9vbHRpcERpc3BsYXkubmF0aXZlRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgdGhpcy5zcGlubmVyRGlzcGxheSA9IFwibm9uZVwiO1xuXG4gICAgLy9QbGF5IHRpbWVyXG4gICAgdGhpcy5fdGltZXIgPSB0aW1lcigwLDEwMCkucGlwZShmaWx0ZXIoKCkgPT4gdGhpcy5wbGF5aW5nLnZhbHVlID09PSB0cnVlKSkuc3Vic2NyaWJlKHQgPT4ge1xuICAgICAgdGhpcy5wbGF5ZWRUaW1lICs9IDEwMDtcbiAgICAgIGlmKHRoaXMucGxheWVkVGltZSA+PSAodGhpcy50b3RhbER1cmF0aW9uICsgdGhpcy5vZmZzZXQpKXtcbiAgICAgICAgdGhpcy5zdG9wKCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgXG4gICAgLy9Db25uZWN0aW9uXG4gICAgdGhpcy53cyA9IG5ldyBXZWJTb2NrZXQodGhpcy53c1VybCk7XG4gICAgdGhpcy5rdXJlbnRvU2VydmljZSA9IG5ldyBLdXJlbnRvU2VydmljZSh0aGlzLndzLCB0aGlzLmF1ZGlvU291cmNlLCB0aGlzLnZpZGVvLCB0aGlzLmV2ZW50U2VydmljZSk7XG5cbiAgICAvL1dlYlNvY2tldCBldmVudCBoYW5kbGluZ1xuICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgIHRoaXMud3Mub25vcGVuID0gKGU6IEV2ZW50KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIkMzcGxheWVyIHNlcnZpY2U6IENvbm5lY3Rpb24gZXN0YWJsaXNoZWQgd2l0aCBLdXJlbnRvXCIpO1xuICAgICAgY29udGV4dC53c0Nvbm5lY3RlZC5uZXh0KHRydWUpO1xuICAgIH1cbiAgICB0aGlzLndzLm9uY2xvc2UgPSAoZTogQ2xvc2VFdmVudCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJDM1BsYXllciBzZXJ2aWNlOiBDb25uZWN0aW9uIGNsb3NlZFwiKTtcbiAgICAgIGNvbnRleHQud3NDb25uZWN0ZWQubmV4dChmYWxzZSk7XG4gICAgICBjb250ZXh0LnN0b3AoKTtcbiAgICB9XG4gICAgdGhpcy53cy5vbmVycm9yID0gKGU6IEV2ZW50KSA9PiB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiQW4gZXJyb3IgaGFzIG9jY3VyZWQ6ICVzXCIsIGUpO1xuICAgICAgY29udGV4dC5zdG9wKCk7XG4gICAgfVxuICAgIHRoaXMud3Mub25tZXNzYWdlID0gKGU6IE1lc3NhZ2VFdmVudCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJNZXNzYWdlIHJlY2VpdmVkOiBcIitlLmRhdGEpO1xuICAgICAgbGV0IG1lc3NhZ2UgPSBKU09OLnBhcnNlKGUuZGF0YSk7XG4gICAgICBzd2l0Y2gobWVzc2FnZS5pZCl7XG4gICAgICAgIGNhc2UgXCJwbGF5U3RhcnRlZFwiOntcbiAgICAgICAgICBsZXQgZXZlbnQgOiBDM2V2ZW50ID0ge3R5cGU6IEV2ZW50VHlwZS5SZW1vdGVQbGF5U3RhcnRlZCwgdmFsdWU6IHt9fTtcbiAgICAgICAgICB0aGlzLmV2ZW50U2VydmljZS5FbWl0dGVyLm5leHQoZXZlbnQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgXCJzdGFydFJlc3BvbnNlXCI6IHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIlJlY2VpdmVkIHN0YXJ0IHJlc3BvbnNlXCIpO1xuICAgICAgICAgIGNvbnRleHQua3VyZW50b1NlcnZpY2UucHJvY2Vzc0Fuc3dlcihtZXNzYWdlLnNkcEFuc3dlciwgKGVycm9yOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIGlmKGVycm9yKXtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIHByb2Nlc3NpbmcgcmVzcG9uc2U6ICVzXCIsIGVycm9yKTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkMzUGxheWVyIHNlcnZpY2U6IFNEUCByZXNwb25zZSBwcm9jZXNzZWRcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBcImVycm9yXCI6IHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgaW4gd2Vic29ja2V0OiAlc1wiLCBtZXNzYWdlLm1lc3NhZ2UpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgXCJwbGF5RW5kXCI6IHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkMzUGxheWVyIHNlcnZpY2U6IFBsYXkgZW5kZWRcIik7XG4gICAgICAgICAgY29udGV4dC5maXJzdFRpbWUubmV4dCh0cnVlKTtcbiAgICAgICAgICBjb250ZXh0LnBsYXlpbmcubmV4dChmYWxzZSk7XG4gICAgICAgICAgY29udGV4dC5wbGF5ZWRUaW1lID0gMDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlIFwidmlkZW9JbmZvXCI6IHtcbiAgICAgICAgICBjb250ZXh0LnRvdGFsRHVyYXRpb24gPSBtZXNzYWdlLnZpZGVvRHVyYXRpb247XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBcImljZUNhbmRpZGF0ZVwiOiB7XG4gICAgICAgICAgY29udGV4dC5rdXJlbnRvU2VydmljZS5hZGRJY2VDYW5kaWRhdGUobWVzc2FnZS5jYW5kaWRhdGUsIChlcnJvcjogc3RyaW5nKSA9PntcbiAgICAgICAgICAgIGlmKGVycm9yKXtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIGFkZGluZyBjYW5kaWRhdGU6ICVzXCIsIGVycm9yKTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkFkZGVkIGNhbmRpZGF0ZSAlc1wiLCBKU09OLnN0cmluZ2lmeShtZXNzYWdlLmNhbmRpZGF0ZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgXCJzZWVrXCI6IHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkMzUGxheWVyIHNlcnZpY2U6IFNlZWsgRG9uZSAtPiAlc1wiLCBtZXNzYWdlLm1lc3NhZ2UpO1xuICAgICAgICAgIGlmKG1lc3NhZ2UubWVzc2FnZSAhPT0gXCJva1wiKXtcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheUVycm9yTWVzc2FnZShcIkFuIGVycm9yIGhhcyBvY2N1cmVkXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlIFwicG9zaXRpb25cIjoge1xuICAgICAgICAgIGNvbnRleHQucGxheWVkVGltZSA9IG1lc3NhZ2UucG9zaXRpb247XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiQzNQbGF5ZXIgc2VydmljZTogVW5yZWNvZ25pemVkIG1lc3NhZ2UgcmVjZWl2ZWQgLT4gJXNcIiwgbWVzc2FnZS5pZCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpe1xuICAgIHRoaXMuX3RpbWVyLnVuc3Vic2NyaWJlKCk7XG4gICAgdGhpcy5rdXJlbnRvU2VydmljZS5yZXNldENvbm5lY3Rpb24oKTtcbiAgICB0aGlzLndzLmNsb3NlKCk7XG4gIH1cblxuICBnZXRQbGF5ZWRIb3VycygpOiBTdHJpbmd7XG4gICAgcmV0dXJuIHRoaXMubWF0aFNlcnZpY2UucGFkKE1hdGguZmxvb3IodGhpcy5wbGF5ZWRUaW1lIC8gMzYwMDAwMCkpO1xuICB9XG5cbiAgZ2V0UGxheWVkTWludXRlcygpOiBTdHJpbmd7XG4gICAgcmV0dXJuIHRoaXMubWF0aFNlcnZpY2UucGFkKE1hdGguZmxvb3IoKCh0aGlzLnBsYXllZFRpbWUgLyAxMDAwKSAlIDM2MDApIC8gNjApKTtcbiAgfVxuXG4gIGdldFBsYXllZFNlY29uZHMoKTogU3RyaW5ne1xuICAgIHJldHVybiB0aGlzLm1hdGhTZXJ2aWNlLnBhZG0oKHRoaXMucGxheWVkVGltZS8xMDAwKSAlIDYwKTtcbiAgfVxuXG4gIGdldFRvdGFsSG91cnMoKTogU3RyaW5ne1xuICAgIHJldHVybiB0aGlzLm1hdGhTZXJ2aWNlLnBhZChNYXRoLmZsb29yKHRoaXMudG90YWxEdXJhdGlvbiAvIDM2MDAwMDApKTtcbiAgfVxuXG4gIGdldFRvdGFsTWludXRlcygpOiBTdHJpbmd7XG4gICAgcmV0dXJuIHRoaXMubWF0aFNlcnZpY2UucGFkKE1hdGguZmxvb3IoKCh0aGlzLnRvdGFsRHVyYXRpb24gLyAxMDAwKSAlIDM2MDApIC8gNjApKTtcbiAgfVxuXG4gIGdldFRvdGFsU2Vjb25kcygpOiBTdHJpbmd7XG4gICAgcmV0dXJuIHRoaXMubWF0aFNlcnZpY2UucGFkKE1hdGgucm91bmQodGhpcy50b3RhbER1cmF0aW9uLzEwMDApICUgNjApO1xuICB9XG5cbiAgZ2V0V2FudGVkSG91cnMoKTogU3RyaW5ne1xuICAgIHJldHVybiB0aGlzLm1hdGhTZXJ2aWNlLnBhZChNYXRoLmZsb29yKHRoaXMud2FudGVkVGltZSAvIDM2MDAwMDApKTtcbiAgfVxuXG4gIGdldFdhbnRlZE1pbnV0ZXMoKTogU3RyaW5ne1xuICAgIHJldHVybiB0aGlzLm1hdGhTZXJ2aWNlLnBhZChNYXRoLmZsb29yKCgodGhpcy53YW50ZWRUaW1lIC8gMTAwMCkgJSAzNjAwKSAvIDYwKSk7XG4gIH1cblxuICBnZXRXYW50ZWRTZWNvbmRzKCk6IFN0cmluZ3tcbiAgICByZXR1cm4gdGhpcy5tYXRoU2VydmljZS5wYWQoTWF0aC5mbG9vcigodGhpcy53YW50ZWRUaW1lLzEwMDApICUgNjApKTtcbiAgfVxuXG4gIGdldFNlZWtQb3NpdGlvbigpe1xuICAgIHJldHVybiBNYXRoLmZsb29yKCh0aGlzLnBsYXllZFRpbWUvdGhpcy50b3RhbER1cmF0aW9uKSp0aGlzLnBsYXllci5uYXRpdmVFbGVtZW50Lm9mZnNldFdpZHRoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUT0RPIGltcGxlbWVudGFyIG1ldG9kb3NcbiAgICovXG4gIHBsYXkoKTogdm9pZHtcbiAgICBpZih0aGlzLnBsYXlpbmcudmFsdWUgPT09IHRydWUpe1xuICAgICAgIC8vUGF1c2UgdGhlIHZpZGVvXG4gICAgICB0aGlzLmt1cmVudG9TZXJ2aWNlLnBhdXNlKCk7XG4gICAgfWVsc2V7XG4gICAgICBpZih0aGlzLmZpcnN0VGltZS52YWx1ZSA9PT0gdHJ1ZSl7XG4gICAgICAgIC8vUGxheVxuICAgICAgICB0aGlzLnNwaW5uZXJEaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgICAgICB0aGlzLmZpcnN0VGltZS5uZXh0KGZhbHNlKTtcbiAgICAgICAgdGhpcy5rdXJlbnRvU2VydmljZS5zdGFydCh0aGlzLnBsYXllZFRpbWUpO1xuICAgICAgfWVsc2V7XG4gICAgICAgIC8vUmVzdW1lXG4gICAgICAgIHRoaXMuc3Bpbm5lckRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgICAgIHRoaXMua3VyZW50b1NlcnZpY2UucmVzdW1lKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc3RvcCgpOiB2b2lke1xuICAgIGlmKHRoaXMud3NDb25uZWN0ZWQudmFsdWUgPT09IHRydWUpe1xuICAgICAgdGhpcy5rdXJlbnRvU2VydmljZS51bm11dGUoKTtcbiAgICAgIHRoaXMua3VyZW50b1NlcnZpY2Uuc3RvcCgpO1xuICAgIH1lbHNle1xuICAgICAgdGhpcy5wbGF5ZWRUaW1lID0gMDtcbiAgICAgIHRoaXMuZmlyc3RUaW1lLm5leHQodHJ1ZSk7XG4gICAgICB0aGlzLnBsYXlpbmcubmV4dChmYWxzZSk7XG4gICAgfVxuICB9XG5cbiAgc2Vla0NsaWNrZWQoZXZlbnQpOiB2b2lke1xuICAgIFxuICB9XG5cbiAgc2Vla1JlbGVhc2VkKGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZHtcbiAgICAvL3NldCBwbGF5ZWRUaW1lIGFuZCBzZWVrUG9zaXRpb25cbiAgICB0aGlzLnNwaW5uZXJEaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgIGxldCBjbGlja2VkOiBudW1iZXIgPSBNYXRoLmZsb29yKHRoaXMudG90YWxEdXJhdGlvbiooZXZlbnQub2Zmc2V0WC90aGlzLnBsYXllci5uYXRpdmVFbGVtZW50Lm9mZnNldFdpZHRoKSk7XG4gICAgdGhpcy5rdXJlbnRvU2VydmljZS5kb1NlZWtBdChjbGlja2VkKTtcbiAgfVxuXG4gIHNlZWtEcmFnZ2VkKCk6IHZvaWR7XG4gICAgY29uc29sZS5sb2coXCJTZWVrIGRyYWdnZWRcIik7XG4gIH1cblxuICBvbkRyYWdTdGFydChldmVudCl7XG4gICAgY29uc29sZS5sb2coXCJEcmFnIHN0YXJ0XCIpO1xuICB9XG5cbiAgb25EcmFnRW5kKGV2ZW50KXtcbiAgICBjb25zb2xlLmxvZyhcIkRyYWcgZW5kXCIpO1xuICB9XG5cbiAgb25Nb3VzZU92ZXJTZWVrKGV2ZW50OiBNb3VzZUV2ZW50KXtcbiAgICB0aGlzLnRvb2x0aXBEaXNwbGF5Lm5hdGl2ZUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IFwiaW5saW5lLWJsb2NrXCI7XG4gICAgdGhpcy50b29sdGlwRGlzcGxheS5uYXRpdmVFbGVtZW50LnN0eWxlLnRyYW5zZm9ybSA9IFwidHJhbnNsYXRlKFwiK2V2ZW50Lm9mZnNldFgrXCJweCxcIisoMTUrZXZlbnQub2Zmc2V0WSkrXCJweClcIjtcbiAgfVxuXG4gIG9uTW91c2VFeGl0U2VlayhldmVudDogTW91c2VFdmVudCl7XG4gICAgdGhpcy50b29sdGlwRGlzcGxheS5uYXRpdmVFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgfVxuXG4gIG9uTW91c2VNb3ZlU2VlayhldmVudDogTW91c2VFdmVudCl7XG4gICAgdGhpcy53YW50ZWRUaW1lID0gTWF0aC5mbG9vcih0aGlzLnRvdGFsRHVyYXRpb24qKGV2ZW50Lm9mZnNldFgvdGhpcy5wbGF5ZXIubmF0aXZlRWxlbWVudC5vZmZzZXRXaWR0aCkpO1xuICAgIGlmKHRoaXMucGxheWVyLm5hdGl2ZUVsZW1lbnQub2Zmc2V0V2lkdGggLSBldmVudC5vZmZzZXRYIDw9IDU1KXtcbiAgICAgIHRoaXMudG9vbHRpcERpc3BsYXkubmF0aXZlRWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSBcInRyYW5zbGF0ZShcIisoZXZlbnQub2Zmc2V0WCAtIDU1KStcInB4LFwiKygxNStldmVudC5vZmZzZXRZKStcInB4KVwiO1xuICAgIH1lbHNle1xuICAgICAgdGhpcy50b29sdGlwRGlzcGxheS5uYXRpdmVFbGVtZW50LnN0eWxlLnRyYW5zZm9ybSA9IFwidHJhbnNsYXRlKFwiK2V2ZW50Lm9mZnNldFgrXCJweCxcIisoMTUrZXZlbnQub2Zmc2V0WSkrXCJweClcIjtcbiAgICB9XG4gIH1cblxuICBkaXNwbGF5RXJyb3JNZXNzYWdlKGVycm9yOiBzdHJpbmcpIDogdm9pZHtcblxuICB9XG5cbiAgc3dpdGNoU291bmQoKTogdm9pZHtcbiAgICBpZih0aGlzLm11dGVkLnZhbHVlID09PSB0cnVlKXtcbiAgICAgIHRoaXMua3VyZW50b1NlcnZpY2UudW5tdXRlKCk7XG4gICAgfWVsc2V7XG4gICAgICB0aGlzLmt1cmVudG9TZXJ2aWNlLm11dGUoKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==