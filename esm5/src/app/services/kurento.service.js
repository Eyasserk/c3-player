/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { WebRtcPeer } from 'kurento-utils-browser';
import { EventType } from '../models/event-type.enum';
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
                _this.ws.send(JSON.stringify(message));
            }
        };
        this.webRtcPeer = WebRtcPeer.WebRtcPeerRecvonly(options, function (error) {
            if (error) {
                console.error("Error creating the peer connection: %s", error);
                /** @type {?} */
                var event_1 = { type: EventType.RemotePlayFailed, value: { at: "start", reason: error } };
                _this.eventService.Emitter.next(event_1);
            }
            else {
                _this.webRtcPeer.generateOffer(function (error, sdp) {
                    if (error) {
                        console.error("Error generating the offer: %s", error);
                        /** @type {?} */
                        var event_2 = { type: EventType.RemotePlayFailed, value: { at: "start", reason: error } };
                        _this.eventService.Emitter.next(event_2);
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
                        _this.ws.send(JSON.stringify(message));
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
                this.ws.send(JSON.stringify(message));
                /** @type {?} */
                var event_3 = { type: EventType.RemotePlayStopped, value: {} };
                this.eventService.Emitter.next(event_3);
            }
            catch (error) {
                console.error("Error stopping the player: %s", error);
                /** @type {?} */
                var event_4 = { type: EventType.RemotePlayFailed, value: { at: "stop", reason: error } };
                this.eventService.Emitter.next(event_4);
            }
        }
        else {
            console.error("Error stopping the player: peer connection is closed");
            /** @type {?} */
            var event_5 = { type: EventType.RemotePlayFailed, value: { at: "stop", reason: "Peer connection is closed" } };
            this.eventService.Emitter.next(event_5);
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
                var event_6 = { type: EventType.RemoteConnectionReset, value: {} };
                this.eventService.Emitter.next(event_6);
            }
            catch (error) {
                console.error("Error resetting the peer connection: %s", error);
                /** @type {?} */
                var event_7 = { type: EventType.LocalConnectionError, value: { at: "resetConnection", reason: error } };
                this.eventService.Emitter.next(event_7);
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
            this.ws.send(JSON.stringify(message));
            /** @type {?} */
            var event_8 = { type: EventType.RemotePlaySeeked, value: { seekTime: time } };
            this.eventService.Emitter.next(event_8);
        }
        catch (error) {
            console.error("Error doing seek: %s", error);
            /** @type {?} */
            var event_9 = { type: EventType.RemoteSeekFailed, value: { at: "doSeek", reason: error } };
            this.eventService.Emitter.next(event_9);
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
            this.ws.send(JSON.stringify(message));
            /** @type {?} */
            var event_10 = { type: EventType.RemotePlayPaused, value: {} };
            this.eventService.Emitter.next(event_10);
        }
        catch (error) {
            console.error("Error pausing the streaming: %s", error);
            /** @type {?} */
            var event_11 = { type: EventType.RemotePlayFailed, value: { at: "pause", reason: error } };
            this.eventService.Emitter.next(event_11);
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
            this.ws.send(JSON.stringify(message));
            /** @type {?} */
            var event_12 = { type: EventType.RemotePlayResumed, value: {} };
            this.eventService.Emitter.next(event_12);
        }
        catch (error) {
            console.error("Error resuming the streaming: %s", error);
            /** @type {?} */
            var event_13 = { type: EventType.RemotePlayFailed, value: { at: "resume", reason: error } };
            this.eventService.Emitter.next(event_13);
        }
    };
    /**
     * @return {?}
     */
    KurentoService.prototype.mute = /**
     * @return {?}
     */
    function () {
        try {
            this.webRtcPeer.getRemoteStream().getAudioTracks().forEach(function (track) {
                track.enabled = false;
            });
            /** @type {?} */
            var event_14 = { type: EventType.LocalAudioLevel, value: { action: "mute" } };
            this.eventService.Emitter.next(event_14);
        }
        catch (error) {
            console.error("Error muting audio: %s", error);
            /** @type {?} */
            var event_15 = { type: EventType.LocalAudioLevelError, value: { at: "mute", reason: error } };
            this.eventService.Emitter.next(event_15);
        }
    };
    /**
     * @return {?}
     */
    KurentoService.prototype.unmute = /**
     * @return {?}
     */
    function () {
        try {
            this.webRtcPeer.getRemoteStream().getAudioTracks().forEach(function (track) {
                track.enabled = true;
            });
            /** @type {?} */
            var event_16 = { type: EventType.LocalAudioLevel, value: { action: "unmute" } };
            this.eventService.Emitter.next(event_16);
        }
        catch (error) {
            console.error("Error unmuting audio: %s", error);
            /** @type {?} */
            var event_17 = { type: EventType.LocalAudioLevelError, value: { at: "unmute", reason: error } };
            this.eventService.Emitter.next(event_17);
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
    return KurentoService;
}());
export { KurentoService };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia3VyZW50by5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYzMtcGxheWVyLyIsInNvdXJjZXMiOlsic3JjL2FwcC9zZXJ2aWNlcy9rdXJlbnRvLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUluRCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFFdEQ7SUFJRTs7OztPQUlHO0lBQ0gsd0JBQW9CLEVBQWEsRUFBVSxXQUFtQixFQUFVLEtBQWlCLEVBQVUsWUFBMEI7UUFBekcsT0FBRSxHQUFGLEVBQUUsQ0FBVztRQUFVLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1FBQVUsVUFBSyxHQUFMLEtBQUssQ0FBWTtRQUFVLGlCQUFZLEdBQVosWUFBWSxDQUFjO0lBRTdILENBQUM7SUFFRDs7T0FFRzs7Ozs7O0lBQ0gsOEJBQUs7Ozs7O0lBQUwsVUFBTSxNQUFjO1FBQXBCLGlCQTBDQztRQXpDQyxPQUFPLENBQUMsR0FBRyxDQUFDLGtEQUFrRCxHQUFDLE1BQU0sQ0FBQyxDQUFDOztZQUNuRSxvQkFBb0IsR0FBRztZQUN6QixLQUFLLEVBQUUsSUFBSTtZQUNYLEtBQUssRUFBRSxLQUFLO1NBQ2I7O1lBQ0csT0FBTyxHQUFHO1lBQ1osV0FBVyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYTtZQUNyQyxnQkFBZ0IsRUFBRSxvQkFBb0I7WUFDdEMsY0FBYyxFQUFFLFVBQUMsU0FBYztnQkFDN0IsT0FBTyxDQUFDLEdBQUcsQ0FBQywrQkFBK0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7O29CQUNyRSxPQUFPLEdBQUc7b0JBQ1osRUFBRSxFQUFFLGdCQUFnQjtvQkFDcEIsU0FBUyxFQUFFLFNBQVM7aUJBQ3JCO2dCQUNELEtBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFT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TSxLQUFLLEVBQUM7WUFDWCxPQUFPLENBQUMsS0FBSyxDQUFDLDBCQUEwQixFQUFFLEtBQUssQ0FBQyxDQUFDOztnQkFDN0MsUUFBSyxHQUFhLEVBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxvQkFBb0IsRUFBRSxLQUFLLEVBQUUsRUFBQyxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBQyxLQUFLLEVBQUMsRUFBQztZQUNqRyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBSyxDQUFDLENBQUM7U0FDdkM7SUFDSCxDQUFDO0lBRUQ7Ozs7T0FJRzs7Ozs7OztJQUNILHNDQUFhOzs7Ozs7SUFBYixVQUFjLFNBQWlCLEVBQUUsUUFBaUM7UUFDaEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3Q0FBd0MsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNqRSxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUVEOzs7O09BSUc7Ozs7Ozs7SUFDSCx3Q0FBZTs7Ozs7O0lBQWYsVUFBZ0IsU0FBMEIsRUFBRSxRQUFpQztRQUMzRSxPQUFPLENBQUMsR0FBRyxDQUFDLHVDQUF1QyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUNoRixJQUFJLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUNILHFCQUFDO0FBQUQsQ0FBQyxBQXBORCxJQW9OQzs7Ozs7OztJQWxOQyxvQ0FBK0I7Ozs7O0lBT25CLDRCQUFxQjs7Ozs7SUFBRSxxQ0FBMkI7Ozs7O0lBQUUsK0JBQXlCOzs7OztJQUFFLHNDQUFrQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFdlYlJ0Y1BlZXIgfSBmcm9tICdrdXJlbnRvLXV0aWxzLWJyb3dzZXInO1xuaW1wb3J0IHsgRWxlbWVudFJlZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRXZlbnRTZXJ2aWNlIH0gZnJvbSAnLi9ldmVudC5zZXJ2aWNlJztcbmltcG9ydCB7IEMzZXZlbnQgfSBmcm9tICcuLi9tb2RlbHMvYzNldmVudCc7XG5pbXBvcnQgeyBFdmVudFR5cGUgfSBmcm9tICcuLi9tb2RlbHMvZXZlbnQtdHlwZS5lbnVtJztcblxuZXhwb3J0IGNsYXNzIEt1cmVudG9TZXJ2aWNlIHtcblxuICBwcml2YXRlIHdlYlJ0Y1BlZXI6IFdlYlJ0Y1BlZXI7XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgS3VyZW50byBTZXJ2aWNlXG4gICAqIEBwYXJhbSB3cyBXRWIgU29ja2V0IENvbm5lY3Rpb25cbiAgICogQHBhcmFtIGF1ZGlvU291cmNlIEF1ZGlvIFVSTFxuICAgKi9cbiAgY29uc3RydWN0b3IocHJpdmF0ZSB3czogV2ViU29ja2V0LCBwcml2YXRlIGF1ZGlvU291cmNlOiBzdHJpbmcsIHByaXZhdGUgdmlkZW86IEVsZW1lbnRSZWYsIHByaXZhdGUgZXZlbnRTZXJ2aWNlOiBFdmVudFNlcnZpY2UpIHtcbiAgICBcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydHMgcGxheWluZyB0aGUgc3RyZWFtZWQgYXVkaW9cbiAgICovXG4gIHN0YXJ0KG1pbGxpczogbnVtYmVyKTogdm9pZHtcbiAgICBjb25zb2xlLmxvZyhcIlJUQyBzZXJ2aWNlOiBQbGF5aW5nIGF1ZGlvIGF0IGluaXRpYWwgcG9zaXRpb246IFwiK21pbGxpcyk7XG4gICAgbGV0IHVzZXJNZWRpYUNvbnN0cmFpbnRzID0ge1xuICAgICAgYXVkaW86IHRydWUsXG4gICAgICB2aWRlbzogZmFsc2VcbiAgICB9XG4gICAgbGV0IG9wdGlvbnMgPSB7XG4gICAgICByZW1vdGVWaWRlbzogdGhpcy52aWRlby5uYXRpdmVFbGVtZW50LFxuICAgICAgbWVkaWFDb25zdHJhaW50czogdXNlck1lZGlhQ29uc3RyYWludHMsXG4gICAgICBvbmljZWNhbmRpZGF0ZTogKGNhbmRpZGF0ZTogYW55KSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdSVEMgc2VydmljZTogTG9jYWwgY2FuZGlkYXRlICcgKyBKU09OLnN0cmluZ2lmeShjYW5kaWRhdGUpKTtcbiAgICAgICAgbGV0IG1lc3NhZ2UgPSB7XG4gICAgICAgICAgaWQ6ICdvbkljZUNhbmRpZGF0ZScsXG4gICAgICAgICAgY2FuZGlkYXRlOiBjYW5kaWRhdGVcbiAgICAgICAgfVxuICAgICAgICB0aGlzLndzLnNlbmQoSlNPTi5zdHJpbmdpZnkobWVzc2FnZSkpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLndlYlJ0Y1BlZXIgPSBXZWJSdGNQZWVyLldlYlJ0Y1BlZXJSZWN2b25seShvcHRpb25zLCAoZXJyb3I6IFN0cmluZykgPT4ge1xuICAgICAgaWYoZXJyb3Ipe1xuICAgICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgY3JlYXRpbmcgdGhlIHBlZXIgY29ubmVjdGlvbjogJXNcIiwgZXJyb3IpO1xuICAgICAgICBsZXQgZXZlbnQgOiBDM2V2ZW50ID0ge3R5cGU6IEV2ZW50VHlwZS5SZW1vdGVQbGF5RmFpbGVkLCB2YWx1ZToge2F0Olwic3RhcnRcIiwgcmVhc29uOmVycm9yfX07XG4gICAgICAgIHRoaXMuZXZlbnRTZXJ2aWNlLkVtaXR0ZXIubmV4dChldmVudCk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhpcy53ZWJSdGNQZWVyLmdlbmVyYXRlT2ZmZXIoKGVycm9yOiBTdHJpbmcsIHNkcDogU3RyaW5nKSA9PiB7XG4gICAgICAgICAgaWYoZXJyb3Ipe1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIGdlbmVyYXRpbmcgdGhlIG9mZmVyOiAlc1wiLCBlcnJvcik7XG4gICAgICAgICAgICBsZXQgZXZlbnQgOiBDM2V2ZW50ID0ge3R5cGU6IEV2ZW50VHlwZS5SZW1vdGVQbGF5RmFpbGVkLCB2YWx1ZToge2F0Olwic3RhcnRcIiwgcmVhc29uOmVycm9yfX07XG4gICAgICAgICAgICB0aGlzLmV2ZW50U2VydmljZS5FbWl0dGVyLm5leHQoZXZlbnQpO1xuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgbGV0IG1lc3NhZ2UgPSB7XG4gICAgICAgICAgICAgIGlkOiAnc3RhcnQnLFxuICAgICAgICAgICAgICBzZHBPZmZlcjogc2RwLFxuICAgICAgICAgICAgICBwb3NpdGlvbjogbWlsbGlzLFxuICAgICAgICAgICAgICB2aWRlb3VybDogdGhpcy5hdWRpb1NvdXJjZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJTZW5kaW5nIHN0YXJ0IG1lc3NhZ2VcIik7XG4gICAgICAgICAgICB0aGlzLndzLnNlbmQoSlNPTi5zdHJpbmdpZnkobWVzc2FnZSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogU3RvcHMgdGhlIHN0cmVhbWluZ1xuICAgKi9cbiAgc3RvcCgpOiB2b2lke1xuICAgIGNvbnNvbGUubG9nKFwiUlRDIHNlcnZpY2U6IFN0b3BwaW5nIGF1ZGlvXCIpO1xuICAgIGlmICh0aGlzLndlYlJ0Y1BlZXIpIHtcbiAgICAgIHRyeXtcbiAgICAgICAgdGhpcy53ZWJSdGNQZWVyLmRpc3Bvc2UoKTtcbiAgICAgICAgdGhpcy53ZWJSdGNQZWVyID0gbnVsbDtcbiAgICAgICAgdmFyIG1lc3NhZ2UgPSB7XG4gICAgICAgICAgICBpZDogJ3N0b3AnXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy53cy5zZW5kKEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpKTtcbiAgICAgICAgbGV0IGV2ZW50IDogQzNldmVudCA9IHt0eXBlOiBFdmVudFR5cGUuUmVtb3RlUGxheVN0b3BwZWQsIHZhbHVlOiB7fX07XG4gICAgICAgIHRoaXMuZXZlbnRTZXJ2aWNlLkVtaXR0ZXIubmV4dChldmVudCk7XG4gICAgICB9Y2F0Y2goZXJyb3Ipe1xuICAgICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3Igc3RvcHBpbmcgdGhlIHBsYXllcjogJXNcIiwgZXJyb3IpO1xuICAgICAgICBsZXQgZXZlbnQgOiBDM2V2ZW50ID0ge3R5cGU6IEV2ZW50VHlwZS5SZW1vdGVQbGF5RmFpbGVkLCB2YWx1ZToge2F0Olwic3RvcFwiLCByZWFzb246ZXJyb3J9fTtcbiAgICAgICAgdGhpcy5ldmVudFNlcnZpY2UuRW1pdHRlci5uZXh0KGV2ZW50KTtcbiAgICAgIH1cbiAgICB9ZWxzZXtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBzdG9wcGluZyB0aGUgcGxheWVyOiBwZWVyIGNvbm5lY3Rpb24gaXMgY2xvc2VkXCIpO1xuICAgICAgbGV0IGV2ZW50IDogQzNldmVudCA9IHt0eXBlOiBFdmVudFR5cGUuUmVtb3RlUGxheUZhaWxlZCwgdmFsdWU6IHthdDpcInN0b3BcIiwgcmVhc29uOlwiUGVlciBjb25uZWN0aW9uIGlzIGNsb3NlZFwifX07XG4gICAgICB0aGlzLmV2ZW50U2VydmljZS5FbWl0dGVyLm5leHQoZXZlbnQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldHMgdGhlIFBlZXIgY29ubmVjdGlvblxuICAgKi9cbiAgcmVzZXRDb25uZWN0aW9uKCk6IHZvaWR7XG4gICAgY29uc29sZS5sb2coXCJSVEMgc2VydmljZTogcmVzZXR0aW5nIHBlZXIgY29ubmVjdGlvblwiKTtcbiAgICBpZih0aGlzLndlYlJ0Y1BlZXIpe1xuICAgICAgdHJ5e1xuICAgICAgICB0aGlzLndlYlJ0Y1BlZXIuZGlzcG9zZSgpO1xuICAgICAgICB0aGlzLndlYlJ0Y1BlZXIgPSBudWxsO1xuICAgICAgICBsZXQgZXZlbnQgOiBDM2V2ZW50ID0ge3R5cGU6IEV2ZW50VHlwZS5SZW1vdGVDb25uZWN0aW9uUmVzZXQsIHZhbHVlOiB7fX07XG4gICAgICAgIHRoaXMuZXZlbnRTZXJ2aWNlLkVtaXR0ZXIubmV4dChldmVudCk7XG4gICAgICB9Y2F0Y2goZXJyb3Ipe1xuICAgICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgcmVzZXR0aW5nIHRoZSBwZWVyIGNvbm5lY3Rpb246ICVzXCIsIGVycm9yKTtcbiAgICAgICAgbGV0IGV2ZW50IDogQzNldmVudCA9IHt0eXBlOiBFdmVudFR5cGUuTG9jYWxDb25uZWN0aW9uRXJyb3IsIHZhbHVlOiB7YXQ6IFwicmVzZXRDb25uZWN0aW9uXCIsIHJlYXNvbjplcnJvcn19O1xuICAgICAgICB0aGlzLmV2ZW50U2VydmljZS5FbWl0dGVyLm5leHQoZXZlbnQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBNb3ZlcyB0byB0aGUgc3BlY2lmaWVkIG1pbGxpc2Vjb25kXG4gICAqIEBwYXJhbSB0aW1lOiBwbGF5ZWQgdGltZSBpbiBtaWxsaXNlY29uZHNcbiAgICovXG4gIGRvU2Vla0F0KHRpbWU6IG51bWJlcik6IHZvaWR7XG4gICAgY29uc29sZS5sb2coXCJSVEMgc2VydmljZTogZG9pbmcgc2VlayBhdCAlc1wiLCB0aW1lLnRvU3RyaW5nKCkpO1xuICAgIHRyeXtcbiAgICAgIHZhciBtZXNzYWdlID0ge1xuICAgICAgICBpZDogJ2RvU2VlaycsXG4gICAgICAgIHBvc2l0aW9uOiB0aW1lXG4gICAgICB9XG4gICAgICB0aGlzLndzLnNlbmQoSlNPTi5zdHJpbmdpZnkobWVzc2FnZSkpO1xuICAgICAgbGV0IGV2ZW50IDogQzNldmVudCA9IHt0eXBlOiBFdmVudFR5cGUuUmVtb3RlUGxheVNlZWtlZCwgdmFsdWU6IHtzZWVrVGltZTogdGltZX19O1xuICAgICAgdGhpcy5ldmVudFNlcnZpY2UuRW1pdHRlci5uZXh0KGV2ZW50KTtcbiAgICB9Y2F0Y2goZXJyb3Ipe1xuICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIGRvaW5nIHNlZWs6ICVzXCIsIGVycm9yKTtcbiAgICAgIGxldCBldmVudCA6IEMzZXZlbnQgPSB7dHlwZTogRXZlbnRUeXBlLlJlbW90ZVNlZWtGYWlsZWQsIHZhbHVlOiB7YXQ6IFwiZG9TZWVrXCIsIHJlYXNvbjplcnJvcn19O1xuICAgICAgdGhpcy5ldmVudFNlcnZpY2UuRW1pdHRlci5uZXh0KGV2ZW50KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUGF1c2VzIHRoZSBzdHJlYW1pbmdcbiAgICovXG4gIHBhdXNlKCk6IHZvaWR7XG4gICAgY29uc29sZS5sb2coXCJSVEMgc2VydmljZTogUGF1c2luZyBhdWRpb1wiKTtcbiAgICB0cnl7XG4gICAgICB2YXIgbWVzc2FnZSA9IHtcbiAgICAgICAgaWQ6ICdwYXVzZSdcbiAgICAgIH1cbiAgICAgIHRoaXMud3Muc2VuZChKU09OLnN0cmluZ2lmeShtZXNzYWdlKSk7XG4gICAgICBsZXQgZXZlbnQgOiBDM2V2ZW50ID0ge3R5cGU6IEV2ZW50VHlwZS5SZW1vdGVQbGF5UGF1c2VkLCB2YWx1ZToge319O1xuICAgICAgdGhpcy5ldmVudFNlcnZpY2UuRW1pdHRlci5uZXh0KGV2ZW50KTtcbiAgICB9Y2F0Y2goZXJyb3Ipe1xuICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIHBhdXNpbmcgdGhlIHN0cmVhbWluZzogJXNcIiwgZXJyb3IpO1xuICAgICAgbGV0IGV2ZW50IDogQzNldmVudCA9IHt0eXBlOiBFdmVudFR5cGUuUmVtb3RlUGxheUZhaWxlZCwgdmFsdWU6IHthdDogXCJwYXVzZVwiLCByZWFzb246ZXJyb3J9fTtcbiAgICAgIHRoaXMuZXZlbnRTZXJ2aWNlLkVtaXR0ZXIubmV4dChldmVudCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlc3VtZXMgdGhlIHN0cmVhbWluZ1xuICAgKi9cbiAgcmVzdW1lKCk6IHZvaWR7XG4gICAgY29uc29sZS5sb2coXCJSVEMgc2VydmljZTogUmVzdW1pbmcgYXVkaW9cIik7XG4gICAgdHJ5e1xuICAgICAgdmFyIG1lc3NhZ2UgPSB7XG4gICAgICAgIGlkOiAncmVzdW1lJ1xuICAgICAgfVxuICAgICAgdGhpcy53cy5zZW5kKEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpKTtcbiAgICAgIGxldCBldmVudCA6IEMzZXZlbnQgPSB7dHlwZTogRXZlbnRUeXBlLlJlbW90ZVBsYXlSZXN1bWVkLCB2YWx1ZToge319O1xuICAgICAgdGhpcy5ldmVudFNlcnZpY2UuRW1pdHRlci5uZXh0KGV2ZW50KTtcbiAgICB9Y2F0Y2goZXJyb3Ipe1xuICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIHJlc3VtaW5nIHRoZSBzdHJlYW1pbmc6ICVzXCIsIGVycm9yKTtcbiAgICAgIGxldCBldmVudCA6IEMzZXZlbnQgPSB7dHlwZTogRXZlbnRUeXBlLlJlbW90ZVBsYXlGYWlsZWQsIHZhbHVlOiB7YXQ6IFwicmVzdW1lXCIsIHJlYXNvbjplcnJvcn19O1xuICAgICAgdGhpcy5ldmVudFNlcnZpY2UuRW1pdHRlci5uZXh0KGV2ZW50KTtcbiAgICB9XG4gIH1cblxuICBtdXRlKCk6IHZvaWR7XG4gICAgdHJ5e1xuICAgICAgdGhpcy53ZWJSdGNQZWVyLmdldFJlbW90ZVN0cmVhbSgpLmdldEF1ZGlvVHJhY2tzKCkuZm9yRWFjaCh0cmFjayA9PiB7XG4gICAgICAgIHRyYWNrLmVuYWJsZWQgPSBmYWxzZTtcbiAgICAgIH0pO1xuICAgICAgbGV0IGV2ZW50IDogQzNldmVudCA9IHt0eXBlOiBFdmVudFR5cGUuTG9jYWxBdWRpb0xldmVsLCB2YWx1ZToge2FjdGlvbjpcIm11dGVcIn19O1xuICAgICAgdGhpcy5ldmVudFNlcnZpY2UuRW1pdHRlci5uZXh0KGV2ZW50KTtcbiAgICB9Y2F0Y2goZXJyb3Ipe1xuICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIG11dGluZyBhdWRpbzogJXNcIiwgZXJyb3IpO1xuICAgICAgbGV0IGV2ZW50IDogQzNldmVudCA9IHt0eXBlOiBFdmVudFR5cGUuTG9jYWxBdWRpb0xldmVsRXJyb3IsIHZhbHVlOiB7YXQ6IFwibXV0ZVwiLCByZWFzb246ZXJyb3J9fTtcbiAgICAgIHRoaXMuZXZlbnRTZXJ2aWNlLkVtaXR0ZXIubmV4dChldmVudCk7XG4gICAgfVxuICB9XG5cbiAgdW5tdXRlKCk6IHZvaWR7XG4gICAgdHJ5e1xuICAgICAgdGhpcy53ZWJSdGNQZWVyLmdldFJlbW90ZVN0cmVhbSgpLmdldEF1ZGlvVHJhY2tzKCkuZm9yRWFjaCh0cmFjayA9PiB7XG4gICAgICAgIHRyYWNrLmVuYWJsZWQgPSB0cnVlO1xuICAgICAgfSk7XG4gICAgICBsZXQgZXZlbnQgOiBDM2V2ZW50ID0ge3R5cGU6IEV2ZW50VHlwZS5Mb2NhbEF1ZGlvTGV2ZWwsIHZhbHVlOiB7YWN0aW9uOlwidW5tdXRlXCJ9fTtcbiAgICAgIHRoaXMuZXZlbnRTZXJ2aWNlLkVtaXR0ZXIubmV4dChldmVudCk7XG4gICAgfWNhdGNoKGVycm9yKXtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciB1bm11dGluZyBhdWRpbzogJXNcIiwgZXJyb3IpO1xuICAgICAgbGV0IGV2ZW50IDogQzNldmVudCA9IHt0eXBlOiBFdmVudFR5cGUuTG9jYWxBdWRpb0xldmVsRXJyb3IsIHZhbHVlOiB7YXQ6IFwidW5tdXRlXCIsIHJlYXNvbjplcnJvcn19O1xuICAgICAgdGhpcy5ldmVudFNlcnZpY2UuRW1pdHRlci5uZXh0KGV2ZW50KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUHJvY2Vzc2VzIHRoZSBTRFAgYW5zd2VyXG4gICAqIEBwYXJhbSBzZHBBbnN3ZXIgU0RQIGFuc3dlciBhcyBzdHJpbmdcbiAgICogQHBhcmFtIGNhbGxiYWNrIGNhbGxiYWNrXG4gICAqL1xuICBwcm9jZXNzQW5zd2VyKHNkcEFuc3dlcjogc3RyaW5nLCBjYWxsYmFjazogKGVycm9yOiBzdHJpbmcpID0+IHZvaWQpIDp2b2lke1xuICAgIGNvbnNvbGUubG9nKFwiUlRDIHNlcnZpY2U6IFByb2Nlc3NpbmcgU0RQIGFuc3dlcjogJXNcIiwgc2RwQW5zd2VyKTtcbiAgICB0aGlzLndlYlJ0Y1BlZXIucHJvY2Vzc0Fuc3dlcihzZHBBbnN3ZXIsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIElDRSBjYW5kaWRhdGVcbiAgICogQHBhcmFtIGNhbmRpZGF0ZSBjYW5kaWRhdGVcbiAgICogQHBhcmFtIGNhbGxiYWNrIGNhbGxiYWNrXG4gICAqL1xuICBhZGRJY2VDYW5kaWRhdGUoY2FuZGlkYXRlOiBSVENJY2VDYW5kaWRhdGUsIGNhbGxiYWNrOiAoZXJyb3I6IHN0cmluZykgPT4gdm9pZCk6IHZvaWR7XG4gICAgY29uc29sZS5sb2coXCJSVEMgc2VydmljZTogQWRkaW5nIEljZSBDYW5kaWRhdGU6ICVzXCIsIEpTT04uc3RyaW5naWZ5KGNhbmRpZGF0ZSkpO1xuICAgIHRoaXMud2ViUnRjUGVlci5hZGRJY2VDYW5kaWRhdGUoY2FuZGlkYXRlLCBjYWxsYmFjayk7XG4gIH1cbn1cbiJdfQ==