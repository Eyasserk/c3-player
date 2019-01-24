/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Component, Input, ViewChild, ElementRef, ViewContainerRef } from '@angular/core';
import { BehaviorSubject, timer } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MathService } from '../../services/math.service';
import { KurentoService } from '../../services/kurento.service';
import { EventService } from '../../services/event.service';
import { EventType } from '../../models/event-type.enum';
import { NgxSpinnerService } from 'ngx-spinner';
import { ModalDialogService, SimpleModalComponent } from 'ngx-modal-dialog';
export class C3playerComponent {
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
                        this.playing.next(true);
                        this.kurentoService.doSeekAt(this.playedTime);
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
                        this.spinner.hide();
                        this.playedTime = event.value.seekTime;
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
    /**
     * @return {?}
     */
    getOptimHeight() {
        return Math.round(this.player.nativeElement.offsetWidth / this.imgRelation) + "px";
    }
}
C3playerComponent.decorators = [
    { type: Component, args: [{
                selector: 'c3-player',
                template: "<div class=\"player jquery-trackswitch\" [style.width]=\"componentWidth\" [style.margin]=\"componentMargin\" #c3player>\n    <div class=\"main-control\">\n        <div class=\"seekable-img-wrap\" style=\"display: block;\">\n            <div class=\"seekable\" data-seek-margin-left=\"0\" data-seek-margin-right=\"0\" [style.background]=\"'url('+imageSource+')'\" [style.background-size]=\"'contain'\" [style.background-repeat]=\"'no-repeat'\" [style.height]=\"getOptimHeight()\" [style.width]=\"'auto'\">\n                <div class=\"inner\" [style.background]=\"'url('+imageSource+')'\" [style.background-size]=\"'cover'\" [style.height]=\"getOptimHeight()\" [style.width]=\"getSeekPosition()+'px'\"></div>\n                <svg>\n                    <filter id=\"blue-wash\">\n                    <feColorMatrix type=\"matrix\" values=\"0 1.0 0 0 0 -0.2 1.0 0 0 0 0 0.6 1 0 0 0 0 0 1 0\"/>\n                    </filter>\n                </svg>\n            </div>\n            <div class=\"seekwrap seekwrap-custom\"  \n                (mousedown)=\"seekClicked($event)\" \n                (mouseup)=\"seekReleased($event)\" \n                (mouseover)=\"onMouseOverSeek($event)\" \n                (mouseout)=\"onMouseExitSeek($event)\"\n                (mousemove)=\"onMouseMoveSeek($event)\">\n                <div class=\"seekhead\" [style.transform]=\"'translate('+getSeekPosition()+'px,0px)'\" #seekbar>\n                </div>\n                <span class=\"seek-tooltip\" #tooltipDisplay [style.padding]=\"'3px'\" [style.border-radius]=\"'1px'\">{{getWantedHours()}}:{{getWantedMinutes()}}:{{getWantedSeconds()}}</span>\n            </div>\n            <div style=\"display: none;\">\n                <audio id=\"gum-local\" controls autoplay #videoelement></audio>\n            </div>\n        </div>\n        <ul class=\"control\">\n            <li class=\"playpause {{playing.value ? 'checked':'' }} button\" (click)=\"play()\">Play</li>\n            <li class=\"stop button\" (click)=\"stop()\">Stop</li>\n            <li class=\"volume {{muted.value ? 'checked':'' }} button\" (click)=\"switchSound()\">Sound</li>\n            <li class=\"timing\"><span class=\"time\">{{getPlayedHours()}}:{{getPlayedMinutes()}}:{{getPlayedSeconds()}}</span> / <span class=\"length\">{{getTotalHours()}}:{{getTotalMinutes()}}:{{getTotalSeconds()}}</span></li>\n            <li class=\"seekwrap\" style=\"display: none;\">\n                <div class=\"seekbar\">\n                    <div class=\"seekhead\"></div>\n                </div>\n            </li>\n        </ul>\n        <ngx-spinner></ngx-spinner>\n    </div>\n</div>\n",
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
    /**
     * @type {?}
     * @private
     */
    C3playerComponent.prototype.wantedTime;
    /** @type {?} */
    C3playerComponent.prototype.tooltipDisplay;
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
    C3playerComponent.prototype.componentWidth;
    /** @type {?} */
    C3playerComponent.prototype.componentMargin;
    /** @type {?} */
    C3playerComponent.prototype.imgRelation;
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
    /**
     * @type {?}
     * @private
     */
    C3playerComponent.prototype.spinner;
    /**
     * @type {?}
     * @private
     */
    C3playerComponent.prototype.modalService;
    /**
     * @type {?}
     * @private
     */
    C3playerComponent.prototype.viewRef;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYzNwbGF5ZXIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vYzMtcGxheWVyLyIsInNvdXJjZXMiOlsic3JjL2FwcC9tb2R1bGVzL2MzcGxheWVyL2MzcGxheWVyLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQXFCLFNBQVMsRUFBRSxVQUFVLEVBQUUsZ0JBQWdCLEVBQWdCLE1BQU0sZUFBZSxDQUFDO0FBRTNILE9BQU8sRUFBRSxlQUFlLEVBQUUsS0FBSyxFQUFlLE1BQU0sTUFBTSxDQUFDO0FBQzNELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUN4QyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDMUQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQ2hFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUU1RCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDekQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQ2hELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxvQkFBb0IsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBTzVFLE1BQU0sT0FBTyxpQkFBaUI7Ozs7Ozs7O0lBMEM1QixZQUFvQixXQUF3QixFQUFVLFlBQTBCLEVBQVUsT0FBMEIsRUFDaEcsWUFBZ0MsRUFBVSxPQUF5QjtRQURuRSxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtRQUFVLGlCQUFZLEdBQVosWUFBWSxDQUFjO1FBQVUsWUFBTyxHQUFQLE9BQU8sQ0FBbUI7UUFDaEcsaUJBQVksR0FBWixZQUFZLENBQW9CO1FBQVUsWUFBTyxHQUFQLE9BQU8sQ0FBa0I7O1FBM0IvRSxlQUFVLEdBQVcsQ0FBQyxDQUFDLENBQUMsU0FBUztRQWdCekMsbUJBQWMsR0FBVyxNQUFN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OztJQUN0QiwyQ0FDZ0M7O0lBQ2hDLDRDQUNpQzs7SUFDakMsd0NBQ3dCOztJQUV4QixrQ0FBZ0M7Ozs7O0lBRWhDLHNDQUE0Qzs7Ozs7SUFFaEMsd0NBQWdDOzs7OztJQUFFLHlDQUFrQzs7Ozs7SUFBRSxvQ0FBa0M7Ozs7O0lBQ3hHLHlDQUF3Qzs7Ozs7SUFBRSxvQ0FBaUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIElucHV0LCBPbkluaXQsIE9uRGVzdHJveSwgVmlld0NoaWxkLCBFbGVtZW50UmVmLCBWaWV3Q29udGFpbmVyUmVmLCBBZnRlclZpZXdJbml0fSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgQmVoYXZpb3JTdWJqZWN0LCB0aW1lciwgU3Vic2NyaXB0aW9ufSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGZpbHRlciB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7IE1hdGhTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vc2VydmljZXMvbWF0aC5zZXJ2aWNlJztcbmltcG9ydCB7IEt1cmVudG9TZXJ2aWNlIH0gZnJvbSAnLi4vLi4vc2VydmljZXMva3VyZW50by5zZXJ2aWNlJztcbmltcG9ydCB7IEV2ZW50U2VydmljZSB9IGZyb20gJy4uLy4uL3NlcnZpY2VzL2V2ZW50LnNlcnZpY2UnO1xuaW1wb3J0IHsgQzNldmVudCB9IGZyb20gJy4uLy4uL21vZGVscy9jM2V2ZW50JztcbmltcG9ydCB7IEV2ZW50VHlwZSB9IGZyb20gJy4uLy4uL21vZGVscy9ldmVudC10eXBlLmVudW0nO1xuaW1wb3J0IHsgTmd4U3Bpbm5lclNlcnZpY2UgfSBmcm9tICduZ3gtc3Bpbm5lcic7XG5pbXBvcnQgeyBNb2RhbERpYWxvZ1NlcnZpY2UsIFNpbXBsZU1vZGFsQ29tcG9uZW50IH0gZnJvbSAnbmd4LW1vZGFsLWRpYWxvZyc7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2MzLXBsYXllcicsXG4gIHRlbXBsYXRlVXJsOiAnLi9jM3BsYXllci5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWycuL2MzcGxheWVyLmNvbXBvbmVudC5jc3MnXVxufSlcbmV4cG9ydCBjbGFzcyBDM3BsYXllckNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95e1xuXG4gIHByaXZhdGUgd3M6IFdlYlNvY2tldDtcblxuICAvL0t1cmVudG8gc2VydmljZVxuICBwcml2YXRlIGt1cmVudG9TZXJ2aWNlOiBLdXJlbnRvU2VydmljZTtcblxuICAvL3RpbWVyIGZvciBwbGF5IHRpbWVcbiAgcHJpdmF0ZSBfdGltZXI6IFN1YnNjcmlwdGlvbjtcbiAgcHJpdmF0ZSBvZmZzZXQ6IG51bWJlcjsgLy9tYXggZGlmZmVyZW5jZSBiZXR3ZWVuIHJlbW90ZSBhbmQgbG9jYWwgcGxheVxuXG4gIC8vaGFuZGxlIGlmIGNvbXBvbmVudCBpcyBwbGF5aW5nXG4gIHBsYXlpbmc6IEJlaGF2aW9yU3ViamVjdDxib29sZWFuPjtcbiAgcHJpdmF0ZSB3c0Nvbm5lY3RlZDogQmVoYXZpb3JTdWJqZWN0PGJvb2xlYW4+O1xuXG4gIHByaXZhdGUgcGxheWVkVGltZTogbnVtYmVyOyAvL21pbGxpc2Vjb25kc1xuICBwcml2YXRlIHdhbnRlZFRpbWU6IG51bWJlciA9IDA7IC8vdG9vbHRpcFxuXG4gIEBWaWV3Q2hpbGQoJ3Rvb2x0aXBEaXNwbGF5JykgdG9vbHRpcERpc3BsYXk6IEVsZW1lbnRSZWY7XG4gIEBWaWV3Q2hpbGQoJ2MzcGxheWVyJykgcGxheWVyOiBFbGVtZW50UmVmOyBcbiAgQFZpZXdDaGlsZCgndmlkZW9lbGVtZW50JykgdmlkZW86IEVsZW1lbnRSZWY7XG5cbiAgLy9cbiAgQElucHV0KCdpbWFnZScpXG4gIGltYWdlU291cmNlOiBzdHJpbmc7IFxuICBASW5wdXQoJ2F1ZGlvJylcbiAgYXVkaW9Tb3VyY2U6IHN0cmluZztcbiAgQElucHV0KCd3c1VybCcpXG4gIHdzVXJsOiBzdHJpbmc7XG4gIEBJbnB1dCgnZHVyYXRpb24nKVxuICB0b3RhbER1cmF0aW9uOiBudW1iZXI7XG4gIEBJbnB1dCgnd2lkdGgnKVxuICBjb21wb25lbnRXaWR0aDogc3RyaW5nID0gXCIxMDAlXCI7XG4gIEBJbnB1dCgnbWFyZ2luJylcbiAgY29tcG9uZW50TWFyZ2luOiBzdHJpbmcgPSBcImF1dG9cIjsgXG4gIEBJbnB1dCgnaW1nLWRpbScpXG4gIGltZ1JlbGF0aW9uOiBudW1iZXIgPSA1O1xuXG4gIG11dGVkOiBCZWhhdmlvclN1YmplY3Q8Ym9vbGVhbj47XG5cbiAgcHJpdmF0ZSBmaXJzdFRpbWU6IEJlaGF2aW9yU3ViamVjdDxib29sZWFuPjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIG1hdGhTZXJ2aWNlOiBNYXRoU2VydmljZSwgcHJpdmF0ZSBldmVudFNlcnZpY2U6IEV2ZW50U2VydmljZSwgcHJpdmF0ZSBzcGlubmVyOiBOZ3hTcGlubmVyU2VydmljZSxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBtb2RhbFNlcnZpY2U6IE1vZGFsRGlhbG9nU2VydmljZSwgcHJpdmF0ZSB2aWV3UmVmOiBWaWV3Q29udGFpbmVyUmVmKXtcbiAgICBldmVudFNlcnZpY2UuRW1pdHRlci5zdWJzY3JpYmUoKGV2ZW50OiBDM2V2ZW50KSA9PiB7XG4gICAgICBpZihldmVudCl7XG4gICAgICAgIHN3aXRjaChldmVudC50eXBlKXtcbiAgICAgICAgICBjYXNlIEV2ZW50VHlwZS5Mb2NhbENvbm5lY3Rpb25FcnJvcjoge1xuICAgICAgICAgICAgdGhpcy5zcGlubmVyLmhpZGUoKTtcbiAgICAgICAgICAgIHRoaXMucGxheWluZy5uZXh0KGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheUVycm9yTWVzc2FnZShcIkVycm9yIGluIGNvbm5lY3Rpb25cIik7XG4gICAgICAgICAgICBicmVhazsgXG4gICAgICAgICAgfVxuICAgICAgICAgIGNhc2UgRXZlbnRUeXBlLlJlbW90ZVBsYXlTdGFydGVkOiB7XG4gICAgICAgICAgICB0aGlzLmZpcnN0VGltZS5uZXh0KGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMucGxheWluZy5uZXh0KHRydWUpO1xuICAgICAgICAgICAgdGhpcy5rdXJlbnRvU2VydmljZS5kb1NlZWtBdCh0aGlzLnBsYXllZFRpbWUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNhc2UgRXZlbnRUeXBlLlJlbW90ZVBsYXlQYXVzZWQ6IHtcbiAgICAgICAgICAgIHRoaXMucGxheWluZy5uZXh0KGZhbHNlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjYXNlIEV2ZW50VHlwZS5SZW1vdGVQbGF5U3RvcHBlZDoge1xuICAgICAgICAgICAgdGhpcy5wbGF5ZWRUaW1lID0gMDtcbiAgICAgICAgICAgIHRoaXMuZmlyc3RUaW1lLm5leHQodHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLnBsYXlpbmcubmV4dChmYWxzZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgICAgY2FzZSBFdmVudFR5cGUuUmVtb3RlUGxheUVuZGVkOiB7XG4gICAgICAgICAgICB0aGlzLnBsYXlpbmcubmV4dChmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLnBsYXllZFRpbWUgPSAwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNhc2UgRXZlbnRUeXBlLlJlbW90ZVBsYXlTZWVrZWQ6IHtcbiAgICAgICAgICAgIHRoaXMuc3Bpbm5lci5oaWRlKCk7XG4gICAgICAgICAgICB0aGlzLnBsYXllZFRpbWUgPSBldmVudC52YWx1ZS5zZWVrVGltZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjYXNlIEV2ZW50VHlwZS5SZW1vdGVTZWVrRmFpbGVkOiB7XG4gICAgICAgICAgICB0aGlzLnNwaW5uZXIuaGlkZSgpO1xuICAgICAgICAgICAgdGhpcy5wbGF5aW5nLm5leHQoZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5kaXNwbGF5RXJyb3JNZXNzYWdlKFwiU2VydmVyIGVycm9yXCIpO1xuICAgICAgICAgICAgYnJlYWs7IFxuICAgICAgICAgIH1cbiAgICAgICAgICBjYXNlIEV2ZW50VHlwZS5SZW1vdGVQbGF5UmVzdW1lZDoge1xuICAgICAgICAgICAgdGhpcy5zcGlubmVyLmhpZGUoKTtcbiAgICAgICAgICAgIHRoaXMucGxheWluZy5uZXh0KHRydWUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNhc2UgRXZlbnRUeXBlLldlYlNvY2tldEZhaWxlZDoge1xuICAgICAgICAgICAgdGhpcy5zcGlubmVyLmhpZGUoKTtcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheUVycm9yTWVzc2FnZShcIkNvbm5lY3Rpb24gdG8gdGhlIHNlcnZlciBmYWlsZWRcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgICAgY2FzZSBFdmVudFR5cGUuTG9jYWxBdWRpb0xldmVsOiB7XG4gICAgICAgICAgICBpZihldmVudC52YWx1ZSAmJiBldmVudC52YWx1ZS5hY3Rpb24pe1xuICAgICAgICAgICAgICBzd2l0Y2goZXZlbnQudmFsdWUuYWN0aW9uKXtcbiAgICAgICAgICAgICAgICBjYXNlIFwibXV0ZVwiOntcbiAgICAgICAgICAgICAgICAgIHRoaXMubXV0ZWQubmV4dCh0cnVlKTtcbiAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlIFwidW5tdXRlXCI6e1xuICAgICAgICAgICAgICAgICAgdGhpcy5tdXRlZC5uZXh0KGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkZWZhdWx0OntcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJSZWNlaXZlZCB1bmtub3duIExvY2FsIEF1ZGlvIExldmVsIGV2ZW50OiAlc1wiLCBldmVudC52YWx1ZS5hY3Rpb24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJSZWNlaXZlZCBpbmNvcnJlY3QgTG9jYWwgQXVkaW8gTGV2ZWwgZXZlbnQ6ICVzXCIsIEpTT04uc3RyaW5naWZ5KGV2ZW50KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgICAgY2FzZSBFdmVudFR5cGUuTG9jYWxBdWRpb0xldmVsRXJyb3I6e1xuICAgICAgICAgICAgdGhpcy5kaXNwbGF5RXJyb3JNZXNzYWdlKFwiRXJyb3IgYXQgYXVkaW8gY29udHJvbFwiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjYXNlIEV2ZW50VHlwZS5SZW1vdGVQbGF5RmFpbGVkOiB7XG4gICAgICAgICAgICB0aGlzLnNwaW5uZXIuaGlkZSgpO1xuICAgICAgICAgICAgdGhpcy5wbGF5aW5nLm5leHQoZmFsc2UpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNhc2UgRXZlbnRUeXBlLlJlbW90ZUNvbm5lY3Rpb25SZXNldDoge1xuICAgICAgICAgICAgdGhpcy5zcGlubmVyLmhpZGUoKTtcbiAgICAgICAgICAgIHRoaXMuZmlyc3RUaW1lLm5leHQodHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLnBsYXlpbmcubmV4dChmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLnBsYXllZFRpbWUgPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiVW5yZWNvZ25pemVkIGV2ZW50IHR5cGUgJyVzJ1wiLCBldmVudC50eXBlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gXG4gICAgfSk7XG4gIH1cblxuICBuZ09uSW5pdCgpIHtcbiAgICAvL0luaXRpYWxpemluZyBnbG9iYWwgdmFyaWFibGVzXG4gICAgdGhpcy5maXJzdFRpbWUgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PGJvb2xlYW4+KHRydWUpO1xuICAgIHRoaXMud3NDb25uZWN0ZWQgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PGJvb2xlYW4+KGZhbHNlKTtcbiAgICB0aGlzLm11dGVkID0gbmV3IEJlaGF2aW9yU3ViamVjdDxib29sZWFuPihmYWxzZSk7XG4gICAgdGhpcy5wbGF5ZWRUaW1lID0gMDtcbiAgICB0aGlzLm9mZnNldCA9IE1hdGgucm91bmQodGhpcy50b3RhbER1cmF0aW9uIC8gMTAwKTtcbiAgICBpZih0aGlzLm9mZnNldCA8IDEwMDApe1xuICAgICAgdGhpcy5vZmZzZXQgPSAxMDAwO1xuICAgIH1cbiAgICBpZih0aGlzLm9mZnNldCA+IDQwMDApe1xuICAgICAgdGhpcy5vZmZzZXQgPSA0MDAwO1xuICAgIH1cbiAgICB0aGlzLnBsYXlpbmcgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PGJvb2xlYW4+KGZhbHNlKTtcbiAgICB0aGlzLnRvb2x0aXBEaXNwbGF5Lm5hdGl2ZUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgIHRoaXMuc3Bpbm5lci5oaWRlKCk7XG5cbiAgICAvL1BsYXkgdGltZXJcbiAgICB0aGlzLl90aW1lciA9IHRpbWVyKDAsMTAwKS5waXBlKGZpbHRlcigoKSA9PiB0aGlzLnBsYXlpbmcudmFsdWUgPT09IHRydWUpKS5zdWJzY3JpYmUodCA9PiB7XG4gICAgICB0aGlzLnBsYXllZFRpbWUgKz0gMTAwO1xuICAgICAgaWYodGhpcy5wbGF5ZWRUaW1lID49ICh0aGlzLnRvdGFsRHVyYXRpb24gKyB0aGlzLm9mZnNldCkpe1xuICAgICAgICB0aGlzLnN0b3AoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBcbiAgICAvL0Nvbm5lY3Rpb25cbiAgICB0aGlzLndzID0gbmV3IFdlYlNvY2tldCh0aGlzLndzVXJsKTtcbiAgICB0aGlzLmt1cmVudG9TZXJ2aWNlID0gbmV3IEt1cmVudG9TZXJ2aWNlKHRoaXMud3MsIHRoaXMuYXVkaW9Tb3VyY2UsIHRoaXMudmlkZW8sIHRoaXMuZXZlbnRTZXJ2aWNlKTtcblxuICAgIC8vV2ViU29ja2V0IGV2ZW50IGhhbmRsaW5nXG4gICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgdGhpcy53cy5vbm9wZW4gPSAoZTogRXZlbnQpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwiQzNwbGF5ZXIgc2VydmljZTogQ29ubmVjdGlvbiBlc3RhYmxpc2hlZCB3aXRoIEt1cmVudG9cIik7XG4gICAgICBjb250ZXh0LndzQ29ubmVjdGVkLm5leHQodHJ1ZSk7XG4gICAgfVxuICAgIHRoaXMud3Mub25jbG9zZSA9IChlOiBDbG9zZUV2ZW50KSA9PiB7XG4gICAgICB0aGlzLnNwaW5uZXIuaGlkZSgpO1xuICAgICAgY29uc29sZS5sb2coXCJDM1BsYXllciBzZXJ2aWNlOiBDb25uZWN0aW9uIGNsb3NlZFwiKTtcbiAgICAgIGNvbnRleHQud3NDb25uZWN0ZWQubmV4dChmYWxzZSk7XG4gICAgICBjb250ZXh0LnN0b3AoKTtcbiAgICB9XG4gICAgdGhpcy53cy5vbmVycm9yID0gKGU6IEV2ZW50KSA9PiB7XG4gICAgICB0aGlzLnNwaW5uZXIuaGlkZSgpO1xuICAgICAgY29uc29sZS5lcnJvcihcIkFuIGVycm9yIGhhcyBvY2N1cmVkOiAlc1wiLCBlKTtcbiAgICAgIHRoaXMuZGlzcGxheUVycm9yTWVzc2FnZShcIkNvbm5lY3Rpb24gd2l0aCBzZXJ2ZXIgZmFpbGVkXCIpO1xuICAgICAgY29udGV4dC5zdG9wKCk7XG4gICAgfVxuICAgIHRoaXMud3Mub25tZXNzYWdlID0gKGU6IE1lc3NhZ2VFdmVudCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJNZXNzYWdlIHJlY2VpdmVkOiBcIitlLmRhdGEpO1xuICAgICAgbGV0IG1lc3NhZ2UgPSBKU09OLnBhcnNlKGUuZGF0YSk7XG4gICAgICBzd2l0Y2gobWVzc2FnZS5pZCl7XG4gICAgICAgIGNhc2UgXCJwbGF5U3RhcnRlZFwiOntcbiAgICAgICAgICBsZXQgZXZlbnQgOiBDM2V2ZW50ID0ge3R5cGU6IEV2ZW50VHlwZS5SZW1vdGVQbGF5U3RhcnRlZCwgdmFsdWU6IHt9fTtcbiAgICAgICAgICB0aGlzLmV2ZW50U2VydmljZS5FbWl0dGVyLm5leHQoZXZlbnQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgXCJzdGFydFJlc3BvbnNlXCI6IHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIlJlY2VpdmVkIHN0YXJ0IHJlc3BvbnNlXCIpO1xuICAgICAgICAgIGNvbnRleHQua3VyZW50b1NlcnZpY2UucHJvY2Vzc0Fuc3dlcihtZXNzYWdlLnNkcEFuc3dlciwgKGVycm9yOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIGlmKGVycm9yKXtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIHByb2Nlc3NpbmcgcmVzcG9uc2U6ICVzXCIsIGVycm9yKTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkMzUGxheWVyIHNlcnZpY2U6IFNEUCByZXNwb25zZSBwcm9jZXNzZWRcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBcImVycm9yXCI6IHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgaW4gd2Vic29ja2V0OiAlc1wiLCBtZXNzYWdlLm1lc3NhZ2UpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgXCJwbGF5RW5kXCI6IHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkMzUGxheWVyIHNlcnZpY2U6IFBsYXkgZW5kZWRcIik7XG4gICAgICAgICAgY29udGV4dC5maXJzdFRpbWUubmV4dCh0cnVlKTtcbiAgICAgICAgICBjb250ZXh0LnBsYXlpbmcubmV4dChmYWxzZSk7XG4gICAgICAgICAgY29udGV4dC5wbGF5ZWRUaW1lID0gMDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlIFwidmlkZW9JbmZvXCI6IHtcbiAgICAgICAgICBjb250ZXh0LnRvdGFsRHVyYXRpb24gPSBtZXNzYWdlLnZpZGVvRHVyYXRpb247XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBcImljZUNhbmRpZGF0ZVwiOiB7XG4gICAgICAgICAgY29udGV4dC5rdXJlbnRvU2VydmljZS5hZGRJY2VDYW5kaWRhdGUobWVzc2FnZS5jYW5kaWRhdGUsIChlcnJvcjogc3RyaW5nKSA9PntcbiAgICAgICAgICAgIGlmKGVycm9yKXtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIGFkZGluZyBjYW5kaWRhdGU6ICVzXCIsIGVycm9yKTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkFkZGVkIGNhbmRpZGF0ZSAlc1wiLCBKU09OLnN0cmluZ2lmeShtZXNzYWdlLmNhbmRpZGF0ZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgXCJzZWVrXCI6IHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkMzUGxheWVyIHNlcnZpY2U6IFNlZWsgRG9uZSAtPiAlc1wiLCBtZXNzYWdlLm1lc3NhZ2UpO1xuICAgICAgICAgIGlmKG1lc3NhZ2UubWVzc2FnZSAhPT0gXCJva1wiKXtcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheUVycm9yTWVzc2FnZShcIkFuIGVycm9yIGhhcyBvY2N1cmVkXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlIFwicG9zaXRpb25cIjoge1xuICAgICAgICAgIGNvbnRleHQucGxheWVkVGltZSA9IG1lc3NhZ2UucG9zaXRpb247XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiQzNQbGF5ZXIgc2VydmljZTogVW5yZWNvZ25pemVkIG1lc3NhZ2UgcmVjZWl2ZWQgLT4gJXNcIiwgbWVzc2FnZS5pZCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpe1xuICAgIHRoaXMuX3RpbWVyLnVuc3Vic2NyaWJlKCk7XG4gICAgdGhpcy5rdXJlbnRvU2VydmljZS5yZXNldENvbm5lY3Rpb24oKTtcbiAgICB0aGlzLndzLmNsb3NlKCk7XG4gIH1cblxuICBnZXRQbGF5ZWRIb3VycygpOiBTdHJpbmd7XG4gICAgcmV0dXJuIHRoaXMubWF0aFNlcnZpY2UucGFkKE1hdGguZmxvb3IodGhpcy5wbGF5ZWRUaW1lIC8gMzYwMDAwMCkpO1xuICB9XG5cbiAgZ2V0UGxheWVkTWludXRlcygpOiBTdHJpbmd7XG4gICAgcmV0dXJuIHRoaXMubWF0aFNlcnZpY2UucGFkKE1hdGguZmxvb3IoKCh0aGlzLnBsYXllZFRpbWUgLyAxMDAwKSAlIDM2MDApIC8gNjApKTtcbiAgfVxuXG4gIGdldFBsYXllZFNlY29uZHMoKTogU3RyaW5ne1xuICAgIHJldHVybiB0aGlzLm1hdGhTZXJ2aWNlLnBhZG0oKHRoaXMucGxheWVkVGltZS8xMDAwKSAlIDYwKTtcbiAgfVxuXG4gIGdldFRvdGFsSG91cnMoKTogU3RyaW5ne1xuICAgIHJldHVybiB0aGlzLm1hdGhTZXJ2aWNlLnBhZChNYXRoLmZsb29yKHRoaXMudG90YWxEdXJhdGlvbiAvIDM2MDAwMDApKTtcbiAgfVxuXG4gIGdldFRvdGFsTWludXRlcygpOiBTdHJpbmd7XG4gICAgcmV0dXJuIHRoaXMubWF0aFNlcnZpY2UucGFkKE1hdGguZmxvb3IoKCh0aGlzLnRvdGFsRHVyYXRpb24gLyAxMDAwKSAlIDM2MDApIC8gNjApKTtcbiAgfVxuXG4gIGdldFRvdGFsU2Vjb25kcygpOiBTdHJpbmd7XG4gICAgcmV0dXJuIHRoaXMubWF0aFNlcnZpY2UucGFkKE1hdGgucm91bmQodGhpcy50b3RhbER1cmF0aW9uLzEwMDApICUgNjApO1xuICB9XG5cbiAgZ2V0V2FudGVkSG91cnMoKTogU3RyaW5ne1xuICAgIHJldHVybiB0aGlzLm1hdGhTZXJ2aWNlLnBhZChNYXRoLmZsb29yKHRoaXMud2FudGVkVGltZSAvIDM2MDAwMDApKTtcbiAgfVxuXG4gIGdldFdhbnRlZE1pbnV0ZXMoKTogU3RyaW5ne1xuICAgIHJldHVybiB0aGlzLm1hdGhTZXJ2aWNlLnBhZChNYXRoLmZsb29yKCgodGhpcy53YW50ZWRUaW1lIC8gMTAwMCkgJSAzNjAwKSAvIDYwKSk7XG4gIH1cblxuICBnZXRXYW50ZWRTZWNvbmRzKCk6IFN0cmluZ3tcbiAgICByZXR1cm4gdGhpcy5tYXRoU2VydmljZS5wYWQoTWF0aC5mbG9vcigodGhpcy53YW50ZWRUaW1lLzEwMDApICUgNjApKTtcbiAgfVxuXG4gIGdldFNlZWtQb3NpdGlvbigpe1xuICAgIHJldHVybiBNYXRoLmZsb29yKCh0aGlzLnBsYXllZFRpbWUvdGhpcy50b3RhbER1cmF0aW9uKSp0aGlzLnBsYXllci5uYXRpdmVFbGVtZW50Lm9mZnNldFdpZHRoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUT0RPIGltcGxlbWVudGFyIG1ldG9kb3NcbiAgICovXG4gIHBsYXkoKTogdm9pZHtcbiAgICBpZih0aGlzLnBsYXlpbmcudmFsdWUgPT09IHRydWUpe1xuICAgICAgIC8vUGF1c2UgdGhlIHZpZGVvXG4gICAgICB0aGlzLmt1cmVudG9TZXJ2aWNlLnBhdXNlKCk7XG4gICAgfWVsc2V7XG4gICAgICBpZih0aGlzLmZpcnN0VGltZS52YWx1ZSA9PT0gdHJ1ZSl7XG4gICAgICAgIC8vUGxheVxuICAgICAgICB0aGlzLnNwaW5uZXIuc2hvdygpO1xuICAgICAgICB0aGlzLmt1cmVudG9TZXJ2aWNlLnVubXV0ZSgpO1xuICAgICAgICB0aGlzLmt1cmVudG9TZXJ2aWNlLnN0YXJ0KHRoaXMucGxheWVkVGltZSk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgLy9SZXN1bWVcbiAgICAgICAgdGhpcy5zcGlubmVyLnNob3coKTtcbiAgICAgICAgdGhpcy5rdXJlbnRvU2VydmljZS5yZXN1bWUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzdG9wKCk6IHZvaWR7XG4gICAgaWYodGhpcy53c0Nvbm5lY3RlZC52YWx1ZSA9PT0gdHJ1ZSl7XG4gICAgICB0aGlzLmt1cmVudG9TZXJ2aWNlLnVubXV0ZSgpO1xuICAgICAgdGhpcy5rdXJlbnRvU2VydmljZS5zdG9wKCk7XG4gICAgfWVsc2V7XG4gICAgICB0aGlzLnBsYXllZFRpbWUgPSAwO1xuICAgICAgdGhpcy5maXJzdFRpbWUubmV4dCh0cnVlKTtcbiAgICAgIHRoaXMucGxheWluZy5uZXh0KGZhbHNlKTtcbiAgICB9XG4gIH1cblxuICBzZWVrQ2xpY2tlZChldmVudCk6IHZvaWR7XG4gICAgXG4gIH1cblxuICBzZWVrUmVsZWFzZWQoZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lke1xuICAgIC8vc2V0IHBsYXllZFRpbWUgYW5kIHNlZWtQb3NpdGlvblxuICAgIHRoaXMuc3Bpbm5lci5zaG93KCk7XG4gICAgbGV0IGNsaWNrZWQ6IG51bWJlciA9IE1hdGguZmxvb3IodGhpcy50b3RhbER1cmF0aW9uKihldmVudC5vZmZzZXRYL3RoaXMucGxheWVyLm5hdGl2ZUVsZW1lbnQub2Zmc2V0V2lkdGgpKTtcbiAgICB0aGlzLmt1cmVudG9TZXJ2aWNlLmRvU2Vla0F0KGNsaWNrZWQpO1xuICB9XG5cbiAgc2Vla0RyYWdnZWQoKTogdm9pZHtcbiAgICBjb25zb2xlLmxvZyhcIlNlZWsgZHJhZ2dlZFwiKTtcbiAgfVxuXG4gIG9uRHJhZ1N0YXJ0KGV2ZW50KXtcbiAgICBjb25zb2xlLmxvZyhcIkRyYWcgc3RhcnRcIik7XG4gIH1cblxuICBvbkRyYWdFbmQoZXZlbnQpe1xuICAgIGNvbnNvbGUubG9nKFwiRHJhZyBlbmRcIik7XG4gIH1cblxuICBvbk1vdXNlT3ZlclNlZWsoZXZlbnQ6IE1vdXNlRXZlbnQpe1xuICAgIHRoaXMudG9vbHRpcERpc3BsYXkubmF0aXZlRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gXCJpbmxpbmUtYmxvY2tcIjtcbiAgICB0aGlzLnRvb2x0aXBEaXNwbGF5Lm5hdGl2ZUVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gXCJ0cmFuc2xhdGUoXCIrZXZlbnQub2Zmc2V0WCtcInB4LFwiKygxNStldmVudC5vZmZzZXRZKStcInB4KVwiO1xuICB9XG5cbiAgb25Nb3VzZUV4aXRTZWVrKGV2ZW50OiBNb3VzZUV2ZW50KXtcbiAgICB0aGlzLnRvb2x0aXBEaXNwbGF5Lm5hdGl2ZUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICB9XG5cbiAgb25Nb3VzZU1vdmVTZWVrKGV2ZW50OiBNb3VzZUV2ZW50KXtcbiAgICB0aGlzLndhbnRlZFRpbWUgPSBNYXRoLmZsb29yKHRoaXMudG90YWxEdXJhdGlvbiooZXZlbnQub2Zmc2V0WC90aGlzLnBsYXllci5uYXRpdmVFbGVtZW50Lm9mZnNldFdpZHRoKSk7XG4gICAgaWYodGhpcy5wbGF5ZXIubmF0aXZlRWxlbWVudC5vZmZzZXRXaWR0aCAtIGV2ZW50Lm9mZnNldFggPD0gNTUpe1xuICAgICAgdGhpcy50b29sdGlwRGlzcGxheS5uYXRpdmVFbGVtZW50LnN0eWxlLnRyYW5zZm9ybSA9IFwidHJhbnNsYXRlKFwiKyhldmVudC5vZmZzZXRYIC0gNTUpK1wicHgsXCIrKDE1K2V2ZW50Lm9mZnNldFkpK1wicHgpXCI7XG4gICAgfWVsc2V7XG4gICAgICB0aGlzLnRvb2x0aXBEaXNwbGF5Lm5hdGl2ZUVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gXCJ0cmFuc2xhdGUoXCIrZXZlbnQub2Zmc2V0WCtcInB4LFwiKygxNStldmVudC5vZmZzZXRZKStcInB4KVwiO1xuICAgIH1cbiAgfVxuXG4gIGRpc3BsYXlFcnJvck1lc3NhZ2UoZXJyb3I6IHN0cmluZykgOiB2b2lke1xuICAgIHRoaXMubW9kYWxTZXJ2aWNlLm9wZW5EaWFsb2codGhpcy52aWV3UmVmLCB7XG4gICAgICB0aXRsZTogJ0Vycm9yJyxcbiAgICAgIGNoaWxkQ29tcG9uZW50OiBTaW1wbGVNb2RhbENvbXBvbmVudCxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdGV4dDogXCJFcnJvciBvY2N1cmVkIHdoaWxlIHBsYXlpbmcgdGhlIGF1ZGlvOiA8c3Ryb25nPlwiK2Vycm9yK1wiPC9zdHJvbmc+XCJcbiAgICAgIH0sXG4gICAgICBzZXR0aW5nczoge1xuICAgICAgICBjbG9zZUJ1dHRvbkNsYXNzOiAnY2xvc2UgdGhlbWUtaWNvbi1jbG9zZScsXG4gICAgICAgIGhlYWRlclRpdGxlQ2xhc3M6IFwidGV4dC1kYW5nZXJcIlxuICAgICAgfSxcbiAgICAgIGFjdGlvbkJ1dHRvbnM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6ICdDbG9zZScsXG4gICAgICAgICAgYnV0dG9uQ2xhc3M6IFwiYnRuIGJ0bi1kZWZhdWx0XCIsXG4gICAgICAgICAgb25BY3Rpb246ICgpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlOmFueSkgPT4ge1xuICAgICAgICAgICAgcmVzb2x2ZSgpXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0pO1xuICB9XG5cbiAgc3dpdGNoU291bmQoKTogdm9pZHtcbiAgICBpZih0aGlzLm11dGVkLnZhbHVlID09PSB0cnVlKXtcbiAgICAgIHRoaXMua3VyZW50b1NlcnZpY2UudW5tdXRlKCk7XG4gICAgfWVsc2V7XG4gICAgICB0aGlzLmt1cmVudG9TZXJ2aWNlLm11dGUoKTtcbiAgICB9XG4gIH1cblxuICBnZXRPcHRpbUhlaWdodCgpOiBzdHJpbmd7XG4gICAgcmV0dXJuIE1hdGgucm91bmQodGhpcy5wbGF5ZXIubmF0aXZlRWxlbWVudC5vZmZzZXRXaWR0aCAvIHRoaXMuaW1nUmVsYXRpb24pICtcInB4XCI7XG4gIH1cbn1cbiJdfQ==