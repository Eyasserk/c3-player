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
        this.webRtcPeer = WebRtcPeer.WebRtcPeerRecvonly(options, function (error) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia3VyZW50by5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYzMtcGxheWVyLyIsInNvdXJjZXMiOlsic3JjL2FwcC9zZXJ2aWNlcy9rdXJlbnRvLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUluRCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFFdEQ7SUFJRTs7OztPQUlHO0lBQ0gsd0JBQW9CLEVBQWEsRUFBVSxXQUFtQixFQUFVLEtBQWlCLEVBQVUsWUFBMEI7UUFBekcsT0FBRSxHQUFGLEVBQUUsQ0FBVztRQUFVLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1FBQVUsVUFBSyxHQUFMLEtBQUssQ0FBWTtRQUFVLGlCQUFZLEdBQVosWUFBWSxDQUFjO0lBRTdILENBQUM7SUFFRDs7T0FFRzs7Ozs7O0lBQ0gsOEJBQUs7Ozs7O0lBQUwsVUFBTSxNQUFjO1FBQXBCLGlCQW9EQztRQW5EQyxPQUFPLENBQUMsR0FBRyxDQUFDLGtEQUFrRCxHQUFDLE1BQU0sQ0FBQyxDQUFDOztZQUNuRSxvQkFBb0IsR0FBRztZQUN6QixLQUFLLEVBQUUsSUFBSTtZQUNYLEtBQUssRUFBRSxLQUFLO1NBQ2I7O1lBQ0csT0FBTyxHQUFHO1lBQ1osV0FBVyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYTtZQUNyQyxnQkFBZ0IsRUFBRSxvQkFBb0I7WUFDdEMsY0FBYyxFQUFFLFVBQUMsU0FBYztnQkFDN0IsT0FBTyxDQUFDLEdBQUcsQ0FBQywrQkFBK0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7O29CQUNyRSxPQUFPLEdBQUc7b0JBQ1osRUFBRSxFQUFFLGdCQUFnQjtvQkFDcEIsU0FBUyxFQUFFLFNBQVM7aUJBQ3JCO2dCQUNELElBQUc7b0JBQ0QsS0FBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FB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T0FBTyxDQUFDLEdBQUcsQ0FBQyx3Q0FBd0MsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNqRSxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUVEOzs7O09BSUc7Ozs7Ozs7SUFDSCx3Q0FBZTs7Ozs7O0lBQWYsVUFBZ0IsU0FBMEIsRUFBRSxRQUFpQztRQUMzRSxPQUFPLENBQUMsR0FBRyxDQUFDLHVDQUF1QyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUNoRixJQUFJLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDdkQsQ0FBQzs7Ozs7SUFFRCxvQ0FBVzs7OztJQUFYLFVBQVksT0FBZTtRQUN6QixJQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxJQUFJLENBQUMsRUFBQztZQUN6QixJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7U0FDdkM7YUFBSTtZQUNILE1BQU0sSUFBSSxLQUFLLENBQUMscUJBQXFCLENBQUMsQ0FBQztTQUN4QztJQUNILENBQUM7SUFDSCxxQkFBQztBQUFELENBQUMsQUFoUEQsSUFnUEM7Ozs7Ozs7SUE5T0Msb0NBQStCOzs7OztJQU9uQiw0QkFBcUI7Ozs7O0lBQUUscUNBQTJCOzs7OztJQUFFLCtCQUF5Qjs7Ozs7SUFBRSxzQ0FBa0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBXZWJSdGNQZWVyIH0gZnJvbSAna3VyZW50by11dGlscy1icm93c2VyJztcbmltcG9ydCB7IEVsZW1lbnRSZWYgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEV2ZW50U2VydmljZSB9IGZyb20gJy4vZXZlbnQuc2VydmljZSc7XG5pbXBvcnQgeyBDM2V2ZW50IH0gZnJvbSAnLi4vbW9kZWxzL2MzZXZlbnQnO1xuaW1wb3J0IHsgRXZlbnRUeXBlIH0gZnJvbSAnLi4vbW9kZWxzL2V2ZW50LXR5cGUuZW51bSc7XG5cbmV4cG9ydCBjbGFzcyBLdXJlbnRvU2VydmljZSB7XG5cbiAgcHJpdmF0ZSB3ZWJSdGNQZWVyOiBXZWJSdGNQZWVyO1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IEt1cmVudG8gU2VydmljZVxuICAgKiBAcGFyYW0gd3MgV0ViIFNvY2tldCBDb25uZWN0aW9uXG4gICAqIEBwYXJhbSBhdWRpb1NvdXJjZSBBdWRpbyBVUkxcbiAgICovXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgd3M6IFdlYlNvY2tldCwgcHJpdmF0ZSBhdWRpb1NvdXJjZTogc3RyaW5nLCBwcml2YXRlIHZpZGVvOiBFbGVtZW50UmVmLCBwcml2YXRlIGV2ZW50U2VydmljZTogRXZlbnRTZXJ2aWNlKSB7XG4gICAgXG4gIH1cblxuICAvKipcbiAgICogU3RhcnRzIHBsYXlpbmcgdGhlIHN0cmVhbWVkIGF1ZGlvXG4gICAqL1xuICBzdGFydChtaWxsaXM6IG51bWJlcik6IHZvaWR7XG4gICAgY29uc29sZS5sb2coXCJSVEMgc2VydmljZTogUGxheWluZyBhdWRpbyBhdCBpbml0aWFsIHBvc2l0aW9uOiBcIittaWxsaXMpO1xuICAgIGxldCB1c2VyTWVkaWFDb25zdHJhaW50cyA9IHtcbiAgICAgIGF1ZGlvOiB0cnVlLFxuICAgICAgdmlkZW86IGZhbHNlXG4gICAgfVxuICAgIGxldCBvcHRpb25zID0ge1xuICAgICAgcmVtb3RlVmlkZW86IHRoaXMudmlkZW8ubmF0aXZlRWxlbWVudCxcbiAgICAgIG1lZGlhQ29uc3RyYWludHM6IHVzZXJNZWRpYUNvbnN0cmFpbnRzLFxuICAgICAgb25pY2VjYW5kaWRhdGU6IChjYW5kaWRhdGU6IGFueSkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnUlRDIHNlcnZpY2U6IExvY2FsIGNhbmRpZGF0ZSAnICsgSlNPTi5zdHJpbmdpZnkoY2FuZGlkYXRlKSk7XG4gICAgICAgIGxldCBtZXNzYWdlID0ge1xuICAgICAgICAgIGlkOiAnb25JY2VDYW5kaWRhdGUnLFxuICAgICAgICAgIGNhbmRpZGF0ZTogY2FuZGlkYXRlXG4gICAgICAgIH1cbiAgICAgICAgdHJ5e1xuICAgICAgICAgIHRoaXMuc2VuZE1lc3NhZ2UobWVzc2FnZSk7XG4gICAgICAgIH1jYXRjaChlcnJvcil7XG4gICAgICAgICAgbGV0IGV2ZW50IDogQzNldmVudCA9IHt0eXBlOiBFdmVudFR5cGUuV2ViU29ja2V0RmFpbGVkLCB2YWx1ZToge3JlYXNvbjplcnJvcn19O1xuICAgICAgICAgIHRoaXMuZXZlbnRTZXJ2aWNlLkVtaXR0ZXIubmV4dChldmVudCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy53ZWJSdGNQZWVyID0gV2ViUnRjUGVlci5XZWJSdGNQZWVyUmVjdm9ubHkob3B0aW9ucywgKGVycm9yOiBTdHJpbmcpID0+IHtcbiAgICAgIGlmKGVycm9yKXtcbiAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIGNyZWF0aW5nIHRoZSBwZWVyIGNvbm5lY3Rpb246ICVzXCIsIGVycm9yKTtcbiAgICAgICAgbGV0IGV2ZW50IDogQzNldmVudCA9IHt0eXBlOiBFdmVudFR5cGUuUmVtb3RlUGxheUZhaWxlZCwgdmFsdWU6IHthdDpcInN0YXJ0XCIsIHJlYXNvbjplcnJvcn19O1xuICAgICAgICB0aGlzLmV2ZW50U2VydmljZS5FbWl0dGVyLm5leHQoZXZlbnQpO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHRoaXMud2ViUnRjUGVlci5nZW5lcmF0ZU9mZmVyKChlcnJvcjogU3RyaW5nLCBzZHA6IFN0cmluZykgPT4ge1xuICAgICAgICAgIGlmKGVycm9yKXtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBnZW5lcmF0aW5nIHRoZSBvZmZlcjogJXNcIiwgZXJyb3IpO1xuICAgICAgICAgICAgbGV0IGV2ZW50IDogQzNldmVudCA9IHt0eXBlOiBFdmVudFR5cGUuUmVtb3RlUGxheUZhaWxlZCwgdmFsdWU6IHthdDpcInN0YXJ0XCIsIHJlYXNvbjplcnJvcn19O1xuICAgICAgICAgICAgdGhpcy5ldmVudFNlcnZpY2UuRW1pdHRlci5uZXh0KGV2ZW50KTtcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGxldCBtZXNzYWdlID0ge1xuICAgICAgICAgICAgICBpZDogJ3N0YXJ0JyxcbiAgICAgICAgICAgICAgc2RwT2ZmZXI6IHNkcCxcbiAgICAgICAgICAgICAgcG9zaXRpb246IG1pbGxpcyxcbiAgICAgICAgICAgICAgdmlkZW91cmw6IHRoaXMuYXVkaW9Tb3VyY2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiU2VuZGluZyBzdGFydCBtZXNzYWdlXCIpO1xuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICB0aGlzLnNlbmRNZXNzYWdlKG1lc3NhZ2UpO1xuICAgICAgICAgICAgfWNhdGNoKGVycm9yKXtcbiAgICAgICAgICAgICAgbGV0IGV2ZW50IDogQzNldmVudCA9IHt0eXBlOiBFdmVudFR5cGUuV2ViU29ja2V0RmFpbGVkLCB2YWx1ZToge3JlYXNvbjplcnJvcn19O1xuICAgICAgICAgICAgICB0aGlzLmV2ZW50U2VydmljZS5FbWl0dGVyLm5leHQoZXZlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogU3RvcHMgdGhlIHN0cmVhbWluZ1xuICAgKi9cbiAgc3RvcCgpOiB2b2lke1xuICAgIGNvbnNvbGUubG9nKFwiUlRDIHNlcnZpY2U6IFN0b3BwaW5nIGF1ZGlvXCIpO1xuICAgIGlmICh0aGlzLndlYlJ0Y1BlZXIpIHtcbiAgICAgIHRyeXtcbiAgICAgICAgdGhpcy53ZWJSdGNQZWVyLmRpc3Bvc2UoKTtcbiAgICAgICAgdGhpcy53ZWJSdGNQZWVyID0gbnVsbDtcbiAgICAgICAgdmFyIG1lc3NhZ2UgPSB7XG4gICAgICAgICAgICBpZDogJ3N0b3AnXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZW5kTWVzc2FnZShtZXNzYWdlKTtcbiAgICAgICAgbGV0IGV2ZW50IDogQzNldmVudCA9IHt0eXBlOiBFdmVudFR5cGUuUmVtb3RlUGxheVN0b3BwZWQsIHZhbHVlOiB7fX07XG4gICAgICAgIHRoaXMuZXZlbnRTZXJ2aWNlLkVtaXR0ZXIubmV4dChldmVudCk7XG4gICAgICB9Y2F0Y2goZXJyb3Ipe1xuICAgICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3Igc3RvcHBpbmcgdGhlIHBsYXllcjogJXNcIiwgZXJyb3IpO1xuICAgICAgICBsZXQgZXZlbnQgOiBDM2V2ZW50ID0ge3R5cGU6IEV2ZW50VHlwZS5SZW1vdGVQbGF5RmFpbGVkLCB2YWx1ZToge2F0Olwic3RvcFwiLCByZWFzb246ZXJyb3J9fTtcbiAgICAgICAgdGhpcy5ldmVudFNlcnZpY2UuRW1pdHRlci5uZXh0KGV2ZW50KTtcbiAgICAgIH1cbiAgICB9ZWxzZXtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBzdG9wcGluZyB0aGUgcGxheWVyOiBwZWVyIGNvbm5lY3Rpb24gaXMgY2xvc2VkXCIpO1xuICAgICAgbGV0IGV2ZW50IDogQzNldmVudCA9IHt0eXBlOiBFdmVudFR5cGUuUmVtb3RlUGxheUZhaWxlZCwgdmFsdWU6IHthdDpcInN0b3BcIiwgcmVhc29uOlwiUGVlciBjb25uZWN0aW9uIGlzIGNsb3NlZFwifX07XG4gICAgICB0aGlzLmV2ZW50U2VydmljZS5FbWl0dGVyLm5leHQoZXZlbnQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldHMgdGhlIFBlZXIgY29ubmVjdGlvblxuICAgKi9cbiAgcmVzZXRDb25uZWN0aW9uKCk6IHZvaWR7XG4gICAgY29uc29sZS5sb2coXCJSVEMgc2VydmljZTogcmVzZXR0aW5nIHBlZXIgY29ubmVjdGlvblwiKTtcbiAgICBpZih0aGlzLndlYlJ0Y1BlZXIpe1xuICAgICAgdHJ5e1xuICAgICAgICB0aGlzLndlYlJ0Y1BlZXIuZGlzcG9zZSgpO1xuICAgICAgICB0aGlzLndlYlJ0Y1BlZXIgPSBudWxsO1xuICAgICAgICBsZXQgZXZlbnQgOiBDM2V2ZW50ID0ge3R5cGU6IEV2ZW50VHlwZS5SZW1vdGVDb25uZWN0aW9uUmVzZXQsIHZhbHVlOiB7fX07XG4gICAgICAgIHRoaXMuZXZlbnRTZXJ2aWNlLkVtaXR0ZXIubmV4dChldmVudCk7XG4gICAgICB9Y2F0Y2goZXJyb3Ipe1xuICAgICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgcmVzZXR0aW5nIHRoZSBwZWVyIGNvbm5lY3Rpb246ICVzXCIsIGVycm9yKTtcbiAgICAgICAgbGV0IGV2ZW50IDogQzNldmVudCA9IHt0eXBlOiBFdmVudFR5cGUuTG9jYWxDb25uZWN0aW9uRXJyb3IsIHZhbHVlOiB7YXQ6IFwicmVzZXRDb25uZWN0aW9uXCIsIHJlYXNvbjplcnJvcn19O1xuICAgICAgICB0aGlzLmV2ZW50U2VydmljZS5FbWl0dGVyLm5leHQoZXZlbnQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBNb3ZlcyB0byB0aGUgc3BlY2lmaWVkIG1pbGxpc2Vjb25kXG4gICAqIEBwYXJhbSB0aW1lOiBwbGF5ZWQgdGltZSBpbiBtaWxsaXNlY29uZHNcbiAgICovXG4gIGRvU2Vla0F0KHRpbWU6IG51bWJlcik6IHZvaWR7XG4gICAgY29uc29sZS5sb2coXCJSVEMgc2VydmljZTogZG9pbmcgc2VlayBhdCAlc1wiLCB0aW1lLnRvU3RyaW5nKCkpO1xuICAgIHRyeXtcbiAgICAgIHZhciBtZXNzYWdlID0ge1xuICAgICAgICBpZDogJ2RvU2VlaycsXG4gICAgICAgIHBvc2l0aW9uOiB0aW1lXG4gICAgICB9XG4gICAgICB0aGlzLnNlbmRNZXNzYWdlKG1lc3NhZ2UpO1xuICAgICAgbGV0IGV2ZW50IDogQzNldmVudCA9IHt0eXBlOiBFdmVudFR5cGUuUmVtb3RlUGxheVNlZWtlZCwgdmFsdWU6IHtzZWVrVGltZTogdGltZX19O1xuICAgICAgdGhpcy5ldmVudFNlcnZpY2UuRW1pdHRlci5uZXh0KGV2ZW50KTtcbiAgICB9Y2F0Y2goZXJyb3Ipe1xuICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIGRvaW5nIHNlZWs6ICVzXCIsIGVycm9yKTtcbiAgICAgIGxldCBldmVudCA6IEMzZXZlbnQgPSB7dHlwZTogRXZlbnRUeXBlLlJlbW90ZVNlZWtGYWlsZWQsIHZhbHVlOiB7YXQ6IFwiZG9TZWVrXCIsIHJlYXNvbjplcnJvcn19O1xuICAgICAgdGhpcy5ldmVudFNlcnZpY2UuRW1pdHRlci5uZXh0KGV2ZW50KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUGF1c2VzIHRoZSBzdHJlYW1pbmdcbiAgICovXG4gIHBhdXNlKCk6IHZvaWR7XG4gICAgY29uc29sZS5sb2coXCJSVEMgc2VydmljZTogUGF1c2luZyBhdWRpb1wiKTtcbiAgICB0cnl7XG4gICAgICB2YXIgbWVzc2FnZSA9IHtcbiAgICAgICAgaWQ6ICdwYXVzZSdcbiAgICAgIH1cbiAgICAgIHRoaXMuc2VuZE1lc3NhZ2UobWVzc2FnZSk7XG4gICAgICBsZXQgZXZlbnQgOiBDM2V2ZW50ID0ge3R5cGU6IEV2ZW50VHlwZS5SZW1vdGVQbGF5UGF1c2VkLCB2YWx1ZToge319O1xuICAgICAgdGhpcy5ldmVudFNlcnZpY2UuRW1pdHRlci5uZXh0KGV2ZW50KTtcbiAgICB9Y2F0Y2goZXJyb3Ipe1xuICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIHBhdXNpbmcgdGhlIHN0cmVhbWluZzogJXNcIiwgZXJyb3IpO1xuICAgICAgbGV0IGV2ZW50IDogQzNldmVudCA9IHt0eXBlOiBFdmVudFR5cGUuUmVtb3RlUGxheUZhaWxlZCwgdmFsdWU6IHthdDogXCJwYXVzZVwiLCByZWFzb246ZXJyb3J9fTtcbiAgICAgIHRoaXMuZXZlbnRTZXJ2aWNlLkVtaXR0ZXIubmV4dChldmVudCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlc3VtZXMgdGhlIHN0cmVhbWluZ1xuICAgKi9cbiAgcmVzdW1lKCk6IHZvaWR7XG4gICAgY29uc29sZS5sb2coXCJSVEMgc2VydmljZTogUmVzdW1pbmcgYXVkaW9cIik7XG4gICAgdHJ5e1xuICAgICAgdmFyIG1lc3NhZ2UgPSB7XG4gICAgICAgIGlkOiAncmVzdW1lJ1xuICAgICAgfVxuICAgICAgdGhpcy5zZW5kTWVzc2FnZShtZXNzYWdlKTtcbiAgICAgIGxldCBldmVudCA6IEMzZXZlbnQgPSB7dHlwZTogRXZlbnRUeXBlLlJlbW90ZVBsYXlSZXN1bWVkLCB2YWx1ZToge319O1xuICAgICAgdGhpcy5ldmVudFNlcnZpY2UuRW1pdHRlci5uZXh0KGV2ZW50KTtcbiAgICB9Y2F0Y2goZXJyb3Ipe1xuICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIHJlc3VtaW5nIHRoZSBzdHJlYW1pbmc6ICVzXCIsIGVycm9yKTtcbiAgICAgIGxldCBldmVudCA6IEMzZXZlbnQgPSB7dHlwZTogRXZlbnRUeXBlLldlYlNvY2tldEZhaWxlZCwgdmFsdWU6IHtyZWFzb246ZXJyb3J9fTtcbiAgICAgIHRoaXMuZXZlbnRTZXJ2aWNlLkVtaXR0ZXIubmV4dChldmVudCk7XG4gICAgfVxuICB9XG5cbiAgbXV0ZSgpOiB2b2lke1xuICAgIGlmKHRoaXMud2ViUnRjUGVlcil7XG4gICAgICB0cnl7XG4gICAgICAgIHRoaXMud2ViUnRjUGVlci5nZXRSZW1vdGVTdHJlYW0oKS5nZXRBdWRpb1RyYWNrcygpLmZvckVhY2godHJhY2sgPT4ge1xuICAgICAgICAgIHRyYWNrLmVuYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCBldmVudCA6IEMzZXZlbnQgPSB7dHlwZTogRXZlbnRUeXBlLkxvY2FsQXVkaW9MZXZlbCwgdmFsdWU6IHthY3Rpb246XCJtdXRlXCJ9fTtcbiAgICAgICAgdGhpcy5ldmVudFNlcnZpY2UuRW1pdHRlci5uZXh0KGV2ZW50KTtcbiAgICAgIH1jYXRjaChlcnJvcil7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBtdXRpbmcgYXVkaW86ICVzXCIsIGVycm9yKTtcbiAgICAgICAgbGV0IGV2ZW50IDogQzNldmVudCA9IHt0eXBlOiBFdmVudFR5cGUuTG9jYWxBdWRpb0xldmVsRXJyb3IsIHZhbHVlOiB7YXQ6IFwibXV0ZVwiLCByZWFzb246ZXJyb3J9fTtcbiAgICAgICAgdGhpcy5ldmVudFNlcnZpY2UuRW1pdHRlci5uZXh0KGV2ZW50KTtcbiAgICAgIH1cbiAgICB9ZWxzZXtcbiAgICAgIGxldCBldmVudCA6IEMzZXZlbnQgPSB7dHlwZTogRXZlbnRUeXBlLkxvY2FsQXVkaW9MZXZlbCwgdmFsdWU6IHthY3Rpb246XCJtdXRlXCJ9fTtcbiAgICAgIHRoaXMuZXZlbnRTZXJ2aWNlLkVtaXR0ZXIubmV4dChldmVudCk7XG4gICAgfVxuICB9XG5cbiAgdW5tdXRlKCk6IHZvaWR7XG4gICAgaWYodGhpcy53ZWJSdGNQZWVyKXtcbiAgICAgIHRyeXtcbiAgICAgICAgdGhpcy53ZWJSdGNQZWVyLmdldFJlbW90ZVN0cmVhbSgpLmdldEF1ZGlvVHJhY2tzKCkuZm9yRWFjaCh0cmFjayA9PiB7XG4gICAgICAgICAgdHJhY2suZW5hYmxlZCA9IHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgZXZlbnQgOiBDM2V2ZW50ID0ge3R5cGU6IEV2ZW50VHlwZS5Mb2NhbEF1ZGlvTGV2ZWwsIHZhbHVlOiB7YWN0aW9uOlwidW5tdXRlXCJ9fTtcbiAgICAgICAgdGhpcy5ldmVudFNlcnZpY2UuRW1pdHRlci5uZXh0KGV2ZW50KTtcbiAgICAgIH1jYXRjaChlcnJvcil7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciB1bm11dGluZyBhdWRpbzogJXNcIiwgZXJyb3IpO1xuICAgICAgICBsZXQgZXZlbnQgOiBDM2V2ZW50ID0ge3R5cGU6IEV2ZW50VHlwZS5Mb2NhbEF1ZGlvTGV2ZWxFcnJvciwgdmFsdWU6IHthdDogXCJ1bm11dGVcIiwgcmVhc29uOmVycm9yfX07XG4gICAgICAgIHRoaXMuZXZlbnRTZXJ2aWNlLkVtaXR0ZXIubmV4dChldmVudCk7XG4gICAgICB9XG4gICAgfWVsc2V7XG4gICAgICBsZXQgZXZlbnQgOiBDM2V2ZW50ID0ge3R5cGU6IEV2ZW50VHlwZS5Mb2NhbEF1ZGlvTGV2ZWwsIHZhbHVlOiB7YWN0aW9uOlwidW5tdXRlXCJ9fTtcbiAgICAgIHRoaXMuZXZlbnRTZXJ2aWNlLkVtaXR0ZXIubmV4dChldmVudCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFByb2Nlc3NlcyB0aGUgU0RQIGFuc3dlclxuICAgKiBAcGFyYW0gc2RwQW5zd2VyIFNEUCBhbnN3ZXIgYXMgc3RyaW5nXG4gICAqIEBwYXJhbSBjYWxsYmFjayBjYWxsYmFja1xuICAgKi9cbiAgcHJvY2Vzc0Fuc3dlcihzZHBBbnN3ZXI6IHN0cmluZywgY2FsbGJhY2s6IChlcnJvcjogc3RyaW5nKSA9PiB2b2lkKSA6dm9pZHtcbiAgICBjb25zb2xlLmxvZyhcIlJUQyBzZXJ2aWNlOiBQcm9jZXNzaW5nIFNEUCBhbnN3ZXI6ICVzXCIsIHNkcEFuc3dlcik7XG4gICAgdGhpcy53ZWJSdGNQZWVyLnByb2Nlc3NBbnN3ZXIoc2RwQW5zd2VyLCBjYWxsYmFjayk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBJQ0UgY2FuZGlkYXRlXG4gICAqIEBwYXJhbSBjYW5kaWRhdGUgY2FuZGlkYXRlXG4gICAqIEBwYXJhbSBjYWxsYmFjayBjYWxsYmFja1xuICAgKi9cbiAgYWRkSWNlQ2FuZGlkYXRlKGNhbmRpZGF0ZTogUlRDSWNlQ2FuZGlkYXRlLCBjYWxsYmFjazogKGVycm9yOiBzdHJpbmcpID0+IHZvaWQpOiB2b2lke1xuICAgIGNvbnNvbGUubG9nKFwiUlRDIHNlcnZpY2U6IEFkZGluZyBJY2UgQ2FuZGlkYXRlOiAlc1wiLCBKU09OLnN0cmluZ2lmeShjYW5kaWRhdGUpKTtcbiAgICB0aGlzLndlYlJ0Y1BlZXIuYWRkSWNlQ2FuZGlkYXRlKGNhbmRpZGF0ZSwgY2FsbGJhY2spO1xuICB9XG5cbiAgc2VuZE1lc3NhZ2UobWVzc2FnZTogb2JqZWN0KTogdm9pZHtcbiAgICBpZih0aGlzLndzLnJlYWR5U3RhdGUgPT0gMSl7XG4gICAgICB0aGlzLndzLnNlbmQoSlNPTi5zdHJpbmdpZnkobWVzc2FnZSkpO1xuICAgIH1lbHNle1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiV2Vic29ja2V0IGlzIGNsb3NlZFwiKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==