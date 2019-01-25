/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { WebRtcPeer } from 'kurento-utils-browser';
import { EventType } from '../models/event-type.enum';
export class KurentoService {
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
if (false) {
    /**
     * @type {?}
     * @private
     */
    KurentoService.prototype.webRtcPeer;
    /**
     * @type {?}
     * @private
     */
    KurentoService.prototype.ws;
    /**
     * @type {?}
     * @private
     */
    KurentoService.prototype.audioSource;
    /**
     * @type {?}
     * @private
     */
    KurentoService.prototype.video;
    /**
     * @type {?}
     * @private
     */
    KurentoService.prototype.eventService;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia3VyZW50by5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYzMtcGxheWVyLyIsInNvdXJjZXMiOlsic3JjL2FwcC9zZXJ2aWNlcy9rdXJlbnRvLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUluRCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFFdEQsTUFBTSxPQUFPLGNBQWM7Ozs7Ozs7O0lBU3pCLFlBQW9CLEVBQWEsRUFBVSxXQUFtQixFQUFVLEtBQWlCLEVBQVUsWUFBMEI7UUFBekcsT0FBRSxHQUFGLEVBQUUsQ0FBVztRQUFVLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1FBQVUsVUFBSyxHQUFMLEtBQUssQ0FBWTtRQUFVLGlCQUFZLEdBQVosWUFBWSxDQUFjO0lBRTdILENBQUM7Ozs7OztJQUtELEtBQUssQ0FBQyxNQUFjO1FBQ2xCLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0RBQWtELEdBQUMsTUFBTSxDQUFDLENBQUM7O1lBQ25FLG9CQUFvQixHQUFHO1lBQ3pCLEtBQUssRUFBRSxJQUFJO1lBQ1gsS0FBSyxFQUFFLEtBQUs7U0FDYjs7WUFDRyxPQUFPLEdBQUc7WUFDWixXQUFXLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhO1lBQ3JDLGdCQUFnQixFQUFFLG9CQUFvQjtZQUN0QyxjQUFjLEVBQUUsQ0FBQyxTQUFjLEVBQUUsRUFBRTtnQkFDakMsT0FBTyxDQUFDLEdBQUcsQ0FBQywrQkFBK0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7O29CQUNyRSxPQUFPLEdBQUc7b0JBQ1osRUFBRSxFQUFFLGdCQUFnQjtvQkFDcEIsU0FBUyxFQUFFLFNBQVM7aUJBQ3JCO2dCQUNELElBQUc7b0JBQ0QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztpQkFDM0I7Z0JBQUEs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T0QsZUFBZSxDQUFDLFNBQTBCLEVBQUUsUUFBaUM7UUFDM0UsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1Q0FBdUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDaEYsSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7Ozs7O0lBRUQsV0FBVyxDQUFDLE9BQWU7UUFDekIsSUFBRyxJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsSUFBSSxDQUFDLEVBQUM7WUFDekIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1NBQ3ZDO2FBQUk7WUFDSCxNQUFNLElBQUksS0FBSyxDQUFDLHFCQUFxQixDQUFDLENBQUM7U0FDeEM7SUFDSCxDQUFDO0NBQ0Y7Ozs7OztJQTlPQyxvQ0FBK0I7Ozs7O0lBT25CLDRCQUFxQjs7Ozs7SUFBRSxxQ0FBMkI7Ozs7O0lBQUUsK0JBQXlCOzs7OztJQUFFLHNDQUFrQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFdlYlJ0Y1BlZXIgfSBmcm9tICdrdXJlbnRvLXV0aWxzLWJyb3dzZXInO1xuaW1wb3J0IHsgRWxlbWVudFJlZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRXZlbnRTZXJ2aWNlIH0gZnJvbSAnLi9ldmVudC5zZXJ2aWNlJztcbmltcG9ydCB7IEMzZXZlbnQgfSBmcm9tICcuLi9tb2RlbHMvYzNldmVudCc7XG5pbXBvcnQgeyBFdmVudFR5cGUgfSBmcm9tICcuLi9tb2RlbHMvZXZlbnQtdHlwZS5lbnVtJztcblxuZXhwb3J0IGNsYXNzIEt1cmVudG9TZXJ2aWNlIHtcblxuICBwcml2YXRlIHdlYlJ0Y1BlZXI6IFdlYlJ0Y1BlZXI7XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgS3VyZW50byBTZXJ2aWNlXG4gICAqIEBwYXJhbSB3cyBXRWIgU29ja2V0IENvbm5lY3Rpb25cbiAgICogQHBhcmFtIGF1ZGlvU291cmNlIEF1ZGlvIFVSTFxuICAgKi9cbiAgY29uc3RydWN0b3IocHJpdmF0ZSB3czogV2ViU29ja2V0LCBwcml2YXRlIGF1ZGlvU291cmNlOiBzdHJpbmcsIHByaXZhdGUgdmlkZW86IEVsZW1lbnRSZWYsIHByaXZhdGUgZXZlbnRTZXJ2aWNlOiBFdmVudFNlcnZpY2UpIHtcbiAgICBcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydHMgcGxheWluZyB0aGUgc3RyZWFtZWQgYXVkaW9cbiAgICovXG4gIHN0YXJ0KG1pbGxpczogbnVtYmVyKTogdm9pZHtcbiAgICBjb25zb2xlLmxvZyhcIlJUQyBzZXJ2aWNlOiBQbGF5aW5nIGF1ZGlvIGF0IGluaXRpYWwgcG9zaXRpb246IFwiK21pbGxpcyk7XG4gICAgbGV0IHVzZXJNZWRpYUNvbnN0cmFpbnRzID0ge1xuICAgICAgYXVkaW86IHRydWUsXG4gICAgICB2aWRlbzogZmFsc2VcbiAgICB9XG4gICAgbGV0IG9wdGlvbnMgPSB7XG4gICAgICByZW1vdGVWaWRlbzogdGhpcy52aWRlby5uYXRpdmVFbGVtZW50LFxuICAgICAgbWVkaWFDb25zdHJhaW50czogdXNlck1lZGlhQ29uc3RyYWludHMsXG4gICAgICBvbmljZWNhbmRpZGF0ZTogKGNhbmRpZGF0ZTogYW55KSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdSVEMgc2VydmljZTogTG9jYWwgY2FuZGlkYXRlICcgKyBKU09OLnN0cmluZ2lmeShjYW5kaWRhdGUpKTtcbiAgICAgICAgbGV0IG1lc3NhZ2UgPSB7XG4gICAgICAgICAgaWQ6ICdvbkljZUNhbmRpZGF0ZScsXG4gICAgICAgICAgY2FuZGlkYXRlOiBjYW5kaWRhdGVcbiAgICAgICAgfVxuICAgICAgICB0cnl7XG4gICAgICAgICAgdGhpcy5zZW5kTWVzc2FnZShtZXNzYWdlKTtcbiAgICAgICAgfWNhdGNoKGVycm9yKXtcbiAgICAgICAgICBsZXQgZXZlbnQgOiBDM2V2ZW50ID0ge3R5cGU6IEV2ZW50VHlwZS5XZWJTb2NrZXRGYWlsZWQsIHZhbHVlOiB7cmVhc29uOmVycm9yfX07XG4gICAgICAgICAgdGhpcy5ldmVudFNlcnZpY2UuRW1pdHRlci5uZXh0KGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLndlYlJ0Y1BlZXIgPSBXZWJSdGNQZWVyLldlYlJ0Y1BlZXJSZWN2b25seShvcHRpb25zLCAoZXJyb3I6IFN0cmluZykgPT4ge1xuICAgICAgaWYoZXJyb3Ipe1xuICAgICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgY3JlYXRpbmcgdGhlIHBlZXIgY29ubmVjdGlvbjogJXNcIiwgZXJyb3IpO1xuICAgICAgICBsZXQgZXZlbnQgOiBDM2V2ZW50ID0ge3R5cGU6IEV2ZW50VHlwZS5SZW1vdGVQbGF5RmFpbGVkLCB2YWx1ZToge2F0Olwic3RhcnRcIiwgcmVhc29uOmVycm9yfX07XG4gICAgICAgIHRoaXMuZXZlbnRTZXJ2aWNlLkVtaXR0ZXIubmV4dChldmVudCk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhpcy53ZWJSdGNQZWVyLmdlbmVyYXRlT2ZmZXIoKGVycm9yOiBTdHJpbmcsIHNkcDogU3RyaW5nKSA9PiB7XG4gICAgICAgICAgaWYoZXJyb3Ipe1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIGdlbmVyYXRpbmcgdGhlIG9mZmVyOiAlc1wiLCBlcnJvcik7XG4gICAgICAgICAgICBsZXQgZXZlbnQgOiBDM2V2ZW50ID0ge3R5cGU6IEV2ZW50VHlwZS5SZW1vdGVQbGF5RmFpbGVkLCB2YWx1ZToge2F0Olwic3RhcnRcIiwgcmVhc29uOmVycm9yfX07XG4gICAgICAgICAgICB0aGlzLmV2ZW50U2VydmljZS5FbWl0dGVyLm5leHQoZXZlbnQpO1xuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgbGV0IG1lc3NhZ2UgPSB7XG4gICAgICAgICAgICAgIGlkOiAnc3RhcnQnLFxuICAgICAgICAgICAgICBzZHBPZmZlcjogc2RwLFxuICAgICAgICAgICAgICBwb3NpdGlvbjogbWlsbGlzLFxuICAgICAgICAgICAgICB2aWRlb3VybDogdGhpcy5hdWRpb1NvdXJjZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJTZW5kaW5nIHN0YXJ0IG1lc3NhZ2VcIik7XG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgIHRoaXMuc2VuZE1lc3NhZ2UobWVzc2FnZSk7XG4gICAgICAgICAgICB9Y2F0Y2goZXJyb3Ipe1xuICAgICAgICAgICAgICBsZXQgZXZlbnQgOiBDM2V2ZW50ID0ge3R5cGU6IEV2ZW50VHlwZS5XZWJTb2NrZXRGYWlsZWQsIHZhbHVlOiB7cmVhc29uOmVycm9yfX07XG4gICAgICAgICAgICAgIHRoaXMuZXZlbnRTZXJ2aWNlLkVtaXR0ZXIubmV4dChldmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wcyB0aGUgc3RyZWFtaW5nXG4gICAqL1xuICBzdG9wKCk6IHZvaWR7XG4gICAgY29uc29sZS5sb2coXCJSVEMgc2VydmljZTogU3RvcHBpbmcgYXVkaW9cIik7XG4gICAgaWYgKHRoaXMud2ViUnRjUGVlcikge1xuICAgICAgdHJ5e1xuICAgICAgICB0aGlzLndlYlJ0Y1BlZXIuZGlzcG9zZSgpO1xuICAgICAgICB0aGlzLndlYlJ0Y1BlZXIgPSBudWxsO1xuICAgICAgICB2YXIgbWVzc2FnZSA9IHtcbiAgICAgICAgICAgIGlkOiAnc3RvcCdcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNlbmRNZXNzYWdlKG1lc3NhZ2UpO1xuICAgICAgICBsZXQgZXZlbnQgOiBDM2V2ZW50ID0ge3R5cGU6IEV2ZW50VHlwZS5SZW1vdGVQbGF5U3RvcHBlZCwgdmFsdWU6IHt9fTtcbiAgICAgICAgdGhpcy5ldmVudFNlcnZpY2UuRW1pdHRlci5uZXh0KGV2ZW50KTtcbiAgICAgIH1jYXRjaChlcnJvcil7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBzdG9wcGluZyB0aGUgcGxheWVyOiAlc1wiLCBlcnJvcik7XG4gICAgICAgIGxldCBldmVudCA6IEMzZXZlbnQgPSB7dHlwZTogRXZlbnRUeXBlLlJlbW90ZVBsYXlGYWlsZWQsIHZhbHVlOiB7YXQ6XCJzdG9wXCIsIHJlYXNvbjplcnJvcn19O1xuICAgICAgICB0aGlzLmV2ZW50U2VydmljZS5FbWl0dGVyLm5leHQoZXZlbnQpO1xuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIHN0b3BwaW5nIHRoZSBwbGF5ZXI6IHBlZXIgY29ubmVjdGlvbiBpcyBjbG9zZWRcIik7XG4gICAgICBsZXQgZXZlbnQgOiBDM2V2ZW50ID0ge3R5cGU6IEV2ZW50VHlwZS5SZW1vdGVQbGF5RmFpbGVkLCB2YWx1ZToge2F0Olwic3RvcFwiLCByZWFzb246XCJQZWVyIGNvbm5lY3Rpb24gaXMgY2xvc2VkXCJ9fTtcbiAgICAgIHRoaXMuZXZlbnRTZXJ2aWNlLkVtaXR0ZXIubmV4dChldmVudCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0cyB0aGUgUGVlciBjb25uZWN0aW9uXG4gICAqL1xuICByZXNldENvbm5lY3Rpb24oKTogdm9pZHtcbiAgICBjb25zb2xlLmxvZyhcIlJUQyBzZXJ2aWNlOiByZXNldHRpbmcgcGVlciBjb25uZWN0aW9uXCIpO1xuICAgIGlmKHRoaXMud2ViUnRjUGVlcil7XG4gICAgICB0cnl7XG4gICAgICAgIHRoaXMud2ViUnRjUGVlci5kaXNwb3NlKCk7XG4gICAgICAgIHRoaXMud2ViUnRjUGVlciA9IG51bGw7XG4gICAgICAgIGxldCBldmVudCA6IEMzZXZlbnQgPSB7dHlwZTogRXZlbnRUeXBlLlJlbW90ZUNvbm5lY3Rpb25SZXNldCwgdmFsdWU6IHt9fTtcbiAgICAgICAgdGhpcy5ldmVudFNlcnZpY2UuRW1pdHRlci5uZXh0KGV2ZW50KTtcbiAgICAgIH1jYXRjaChlcnJvcil7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciByZXNldHRpbmcgdGhlIHBlZXIgY29ubmVjdGlvbjogJXNcIiwgZXJyb3IpO1xuICAgICAgICBsZXQgZXZlbnQgOiBDM2V2ZW50ID0ge3R5cGU6IEV2ZW50VHlwZS5Mb2NhbENvbm5lY3Rpb25FcnJvciwgdmFsdWU6IHthdDogXCJyZXNldENvbm5lY3Rpb25cIiwgcmVhc29uOmVycm9yfX07XG4gICAgICAgIHRoaXMuZXZlbnRTZXJ2aWNlLkVtaXR0ZXIubmV4dChldmVudCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE1vdmVzIHRvIHRoZSBzcGVjaWZpZWQgbWlsbGlzZWNvbmRcbiAgICogQHBhcmFtIHRpbWU6IHBsYXllZCB0aW1lIGluIG1pbGxpc2Vjb25kc1xuICAgKi9cbiAgZG9TZWVrQXQodGltZTogbnVtYmVyKTogdm9pZHtcbiAgICBjb25zb2xlLmxvZyhcIlJUQyBzZXJ2aWNlOiBkb2luZyBzZWVrIGF0ICVzXCIsIHRpbWUudG9TdHJpbmcoKSk7XG4gICAgdHJ5e1xuICAgICAgdmFyIG1lc3NhZ2UgPSB7XG4gICAgICAgIGlkOiAnZG9TZWVrJyxcbiAgICAgICAgcG9zaXRpb246IHRpbWVcbiAgICAgIH1cbiAgICAgIHRoaXMuc2VuZE1lc3NhZ2UobWVzc2FnZSk7XG4gICAgICBsZXQgZXZlbnQgOiBDM2V2ZW50ID0ge3R5cGU6IEV2ZW50VHlwZS5SZW1vdGVQbGF5U2Vla2VkLCB2YWx1ZToge3NlZWtUaW1lOiB0aW1lfX07XG4gICAgICB0aGlzLmV2ZW50U2VydmljZS5FbWl0dGVyLm5leHQoZXZlbnQpO1xuICAgIH1jYXRjaChlcnJvcil7XG4gICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgZG9pbmcgc2VlazogJXNcIiwgZXJyb3IpO1xuICAgICAgbGV0IGV2ZW50IDogQzNldmVudCA9IHt0eXBlOiBFdmVudFR5cGUuUmVtb3RlU2Vla0ZhaWxlZCwgdmFsdWU6IHthdDogXCJkb1NlZWtcIiwgcmVhc29uOmVycm9yfX07XG4gICAgICB0aGlzLmV2ZW50U2VydmljZS5FbWl0dGVyLm5leHQoZXZlbnQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQYXVzZXMgdGhlIHN0cmVhbWluZ1xuICAgKi9cbiAgcGF1c2UoKTogdm9pZHtcbiAgICBjb25zb2xlLmxvZyhcIlJUQyBzZXJ2aWNlOiBQYXVzaW5nIGF1ZGlvXCIpO1xuICAgIHRyeXtcbiAgICAgIHZhciBtZXNzYWdlID0ge1xuICAgICAgICBpZDogJ3BhdXNlJ1xuICAgICAgfVxuICAgICAgdGhpcy5zZW5kTWVzc2FnZShtZXNzYWdlKTtcbiAgICAgIGxldCBldmVudCA6IEMzZXZlbnQgPSB7dHlwZTogRXZlbnRUeXBlLlJlbW90ZVBsYXlQYXVzZWQsIHZhbHVlOiB7fX07XG4gICAgICB0aGlzLmV2ZW50U2VydmljZS5FbWl0dGVyLm5leHQoZXZlbnQpO1xuICAgIH1jYXRjaChlcnJvcil7XG4gICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgcGF1c2luZyB0aGUgc3RyZWFtaW5nOiAlc1wiLCBlcnJvcik7XG4gICAgICBsZXQgZXZlbnQgOiBDM2V2ZW50ID0ge3R5cGU6IEV2ZW50VHlwZS5SZW1vdGVQbGF5RmFpbGVkLCB2YWx1ZToge2F0OiBcInBhdXNlXCIsIHJlYXNvbjplcnJvcn19O1xuICAgICAgdGhpcy5ldmVudFNlcnZpY2UuRW1pdHRlci5uZXh0KGV2ZW50KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVzdW1lcyB0aGUgc3RyZWFtaW5nXG4gICAqL1xuICByZXN1bWUoKTogdm9pZHtcbiAgICBjb25zb2xlLmxvZyhcIlJUQyBzZXJ2aWNlOiBSZXN1bWluZyBhdWRpb1wiKTtcbiAgICB0cnl7XG4gICAgICB2YXIgbWVzc2FnZSA9IHtcbiAgICAgICAgaWQ6ICdyZXN1bWUnXG4gICAgICB9XG4gICAgICB0aGlzLnNlbmRNZXNzYWdlKG1lc3NhZ2UpO1xuICAgICAgbGV0IGV2ZW50IDogQzNldmVudCA9IHt0eXBlOiBFdmVudFR5cGUuUmVtb3RlUGxheVJlc3VtZWQsIHZhbHVlOiB7fX07XG4gICAgICB0aGlzLmV2ZW50U2VydmljZS5FbWl0dGVyLm5leHQoZXZlbnQpO1xuICAgIH1jYXRjaChlcnJvcil7XG4gICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgcmVzdW1pbmcgdGhlIHN0cmVhbWluZzogJXNcIiwgZXJyb3IpO1xuICAgICAgbGV0IGV2ZW50IDogQzNldmVudCA9IHt0eXBlOiBFdmVudFR5cGUuV2ViU29ja2V0RmFpbGVkLCB2YWx1ZToge3JlYXNvbjplcnJvcn19O1xuICAgICAgdGhpcy5ldmVudFNlcnZpY2UuRW1pdHRlci5uZXh0KGV2ZW50KTtcbiAgICB9XG4gIH1cblxuICBtdXRlKCk6IHZvaWR7XG4gICAgaWYodGhpcy53ZWJSdGNQZWVyKXtcbiAgICAgIHRyeXtcbiAgICAgICAgdGhpcy53ZWJSdGNQZWVyLmdldFJlbW90ZVN0cmVhbSgpLmdldEF1ZGlvVHJhY2tzKCkuZm9yRWFjaCh0cmFjayA9PiB7XG4gICAgICAgICAgdHJhY2suZW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgICAgbGV0IGV2ZW50IDogQzNldmVudCA9IHt0eXBlOiBFdmVudFR5cGUuTG9jYWxBdWRpb0xldmVsLCB2YWx1ZToge2FjdGlvbjpcIm11dGVcIn19O1xuICAgICAgICB0aGlzLmV2ZW50U2VydmljZS5FbWl0dGVyLm5leHQoZXZlbnQpO1xuICAgICAgfWNhdGNoKGVycm9yKXtcbiAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIG11dGluZyBhdWRpbzogJXNcIiwgZXJyb3IpO1xuICAgICAgICBsZXQgZXZlbnQgOiBDM2V2ZW50ID0ge3R5cGU6IEV2ZW50VHlwZS5Mb2NhbEF1ZGlvTGV2ZWxFcnJvciwgdmFsdWU6IHthdDogXCJtdXRlXCIsIHJlYXNvbjplcnJvcn19O1xuICAgICAgICB0aGlzLmV2ZW50U2VydmljZS5FbWl0dGVyLm5leHQoZXZlbnQpO1xuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgbGV0IGV2ZW50IDogQzNldmVudCA9IHt0eXBlOiBFdmVudFR5cGUuTG9jYWxBdWRpb0xldmVsLCB2YWx1ZToge2FjdGlvbjpcIm11dGVcIn19O1xuICAgICAgdGhpcy5ldmVudFNlcnZpY2UuRW1pdHRlci5uZXh0KGV2ZW50KTtcbiAgICB9XG4gIH1cblxuICB1bm11dGUoKTogdm9pZHtcbiAgICBpZih0aGlzLndlYlJ0Y1BlZXIpe1xuICAgICAgdHJ5e1xuICAgICAgICB0aGlzLndlYlJ0Y1BlZXIuZ2V0UmVtb3RlU3RyZWFtKCkuZ2V0QXVkaW9UcmFja3MoKS5mb3JFYWNoKHRyYWNrID0+IHtcbiAgICAgICAgICB0cmFjay5lbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCBldmVudCA6IEMzZXZlbnQgPSB7dHlwZTogRXZlbnRUeXBlLkxvY2FsQXVkaW9MZXZlbCwgdmFsdWU6IHthY3Rpb246XCJ1bm11dGVcIn19O1xuICAgICAgICB0aGlzLmV2ZW50U2VydmljZS5FbWl0dGVyLm5leHQoZXZlbnQpO1xuICAgICAgfWNhdGNoKGVycm9yKXtcbiAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIHVubXV0aW5nIGF1ZGlvOiAlc1wiLCBlcnJvcik7XG4gICAgICAgIGxldCBldmVudCA6IEMzZXZlbnQgPSB7dHlwZTogRXZlbnRUeXBlLkxvY2FsQXVkaW9MZXZlbEVycm9yLCB2YWx1ZToge2F0OiBcInVubXV0ZVwiLCByZWFzb246ZXJyb3J9fTtcbiAgICAgICAgdGhpcy5ldmVudFNlcnZpY2UuRW1pdHRlci5uZXh0KGV2ZW50KTtcbiAgICAgIH1cbiAgICB9ZWxzZXtcbiAgICAgIGxldCBldmVudCA6IEMzZXZlbnQgPSB7dHlwZTogRXZlbnRUeXBlLkxvY2FsQXVkaW9MZXZlbCwgdmFsdWU6IHthY3Rpb246XCJ1bm11dGVcIn19O1xuICAgICAgdGhpcy5ldmVudFNlcnZpY2UuRW1pdHRlci5uZXh0KGV2ZW50KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUHJvY2Vzc2VzIHRoZSBTRFAgYW5zd2VyXG4gICAqIEBwYXJhbSBzZHBBbnN3ZXIgU0RQIGFuc3dlciBhcyBzdHJpbmdcbiAgICogQHBhcmFtIGNhbGxiYWNrIGNhbGxiYWNrXG4gICAqL1xuICBwcm9jZXNzQW5zd2VyKHNkcEFuc3dlcjogc3RyaW5nLCBjYWxsYmFjazogKGVycm9yOiBzdHJpbmcpID0+IHZvaWQpIDp2b2lke1xuICAgIGNvbnNvbGUubG9nKFwiUlRDIHNlcnZpY2U6IFByb2Nlc3NpbmcgU0RQIGFuc3dlcjogJXNcIiwgc2RwQW5zd2VyKTtcbiAgICB0aGlzLndlYlJ0Y1BlZXIucHJvY2Vzc0Fuc3dlcihzZHBBbnN3ZXIsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIElDRSBjYW5kaWRhdGVcbiAgICogQHBhcmFtIGNhbmRpZGF0ZSBjYW5kaWRhdGVcbiAgICogQHBhcmFtIGNhbGxiYWNrIGNhbGxiYWNrXG4gICAqL1xuICBhZGRJY2VDYW5kaWRhdGUoY2FuZGlkYXRlOiBSVENJY2VDYW5kaWRhdGUsIGNhbGxiYWNrOiAoZXJyb3I6IHN0cmluZykgPT4gdm9pZCk6IHZvaWR7XG4gICAgY29uc29sZS5sb2coXCJSVEMgc2VydmljZTogQWRkaW5nIEljZSBDYW5kaWRhdGU6ICVzXCIsIEpTT04uc3RyaW5naWZ5KGNhbmRpZGF0ZSkpO1xuICAgIHRoaXMud2ViUnRjUGVlci5hZGRJY2VDYW5kaWRhdGUoY2FuZGlkYXRlLCBjYWxsYmFjayk7XG4gIH1cblxuICBzZW5kTWVzc2FnZShtZXNzYWdlOiBvYmplY3QpOiB2b2lke1xuICAgIGlmKHRoaXMud3MucmVhZHlTdGF0ZSA9PSAxKXtcbiAgICAgIHRoaXMud3Muc2VuZChKU09OLnN0cmluZ2lmeShtZXNzYWdlKSk7XG4gICAgfWVsc2V7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJXZWJzb2NrZXQgaXMgY2xvc2VkXCIpO1xuICAgIH1cbiAgfVxufVxuIl19