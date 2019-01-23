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
                this.ws.send(JSON.stringify(message));
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
                        this.ws.send(JSON.stringify(message));
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
                this.ws.send(JSON.stringify(message));
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
            this.ws.send(JSON.stringify(message));
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
            this.ws.send(JSON.stringify(message));
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
            this.ws.send(JSON.stringify(message));
            /** @type {?} */
            let event = { type: EventType.RemotePlayResumed, value: {} };
            this.eventService.Emitter.next(event);
        }
        catch (error) {
            console.error("Error resuming the streaming: %s", error);
            /** @type {?} */
            let event = { type: EventType.RemotePlayFailed, value: { at: "resume", reason: error } };
            this.eventService.Emitter.next(event);
        }
    }
    /**
     * @return {?}
     */
    mute() {
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
    /**
     * @return {?}
     */
    unmute() {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia3VyZW50by5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYzMtcGxheWVyLyIsInNvdXJjZXMiOlsic3JjL2FwcC9zZXJ2aWNlcy9rdXJlbnRvLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUluRCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFFdEQsTUFBTSxPQUFPLGNBQWM7Ozs7Ozs7O0lBU3pCLFlBQW9CLEVBQWEsRUFBVSxXQUFtQixFQUFVLEtBQWlCLEVBQVUsWUFBMEI7UUFBekcsT0FBRSxHQUFGLEVBQUUsQ0FBVztRQUFVLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1FBQVUsVUFBSyxHQUFMLEtBQUssQ0FBWTtRQUFVLGlCQUFZLEdBQVosWUFBWSxDQUFjO0lBRTdILENBQUM7Ozs7OztJQUtELEtBQUssQ0FBQyxNQUFjO1FBQ2xCLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0RBQWtELEdBQUMsTUFBTSxDQUFDLENBQUM7O1lBQ25FLG9CQUFvQixHQUFHO1lBQ3pCLEtBQUssRUFBRSxJQUFJO1lBQ1gsS0FBSyxFQUFFLEtBQUs7U0FDYjs7WUFDRyxPQUFPLEdBQUc7WUFDWixXQUFXLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhO1lBQ3JDLGdCQUFnQixFQUFFLG9CQUFvQjtZQUN0QyxjQUFjLEVBQUUsQ0FBQyxTQUFjLEVBQUUsRUFBRTtnQkFDakMsT0FBTyxDQUFDLEdBQUcsQ0FBQywrQkFBK0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7O29CQUNyRSxPQUFPLEdBQUc7b0JBQ1osRUFBRSxFQUFFLGdCQUFnQjtvQkFDcEIsU0FBUyxFQUFFLFNBQVM7aUJBQ3JCO2dCQUNELElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFD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QUFDLG9CQUFvQixFQUFFLEtBQUssRUFBRSxFQUFDLEVBQUUsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFDLEtBQUssRUFBQyxFQUFDO1lBQ2pHLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUN2QztJQUNILENBQUM7Ozs7Ozs7SUFPRCxhQUFhLENBQUMsU0FBaUIsRUFBRSxRQUFpQztRQUNoRSxPQUFPLENBQUMsR0FBRyxDQUFDLHdDQUF3QyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ2pFLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNyRCxDQUFDOzs7Ozs7O0lBT0QsZUFBZSxDQUFDLFNBQTBCLEVBQUUsUUFBaUM7UUFDM0UsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1Q0FBdUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDaEYsSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7Q0FDRjs7Ozs7O0lBbE5DLG9DQUErQjs7Ozs7SUFPbkIsNEJBQXFCOzs7OztJQUFFLHFDQUEyQjs7Ozs7SUFBRSwrQkFBeUI7Ozs7O0lBQUUsc0NBQWtDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgV2ViUnRjUGVlciB9IGZyb20gJ2t1cmVudG8tdXRpbHMtYnJvd3Nlcic7XG5pbXBvcnQgeyBFbGVtZW50UmVmIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBFdmVudFNlcnZpY2UgfSBmcm9tICcuL2V2ZW50LnNlcnZpY2UnO1xuaW1wb3J0IHsgQzNldmVudCB9IGZyb20gJy4uL21vZGVscy9jM2V2ZW50JztcbmltcG9ydCB7IEV2ZW50VHlwZSB9IGZyb20gJy4uL21vZGVscy9ldmVudC10eXBlLmVudW0nO1xuXG5leHBvcnQgY2xhc3MgS3VyZW50b1NlcnZpY2Uge1xuXG4gIHByaXZhdGUgd2ViUnRjUGVlcjogV2ViUnRjUGVlcjtcblxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBLdXJlbnRvIFNlcnZpY2VcbiAgICogQHBhcmFtIHdzIFdFYiBTb2NrZXQgQ29ubmVjdGlvblxuICAgKiBAcGFyYW0gYXVkaW9Tb3VyY2UgQXVkaW8gVVJMXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHdzOiBXZWJTb2NrZXQsIHByaXZhdGUgYXVkaW9Tb3VyY2U6IHN0cmluZywgcHJpdmF0ZSB2aWRlbzogRWxlbWVudFJlZiwgcHJpdmF0ZSBldmVudFNlcnZpY2U6IEV2ZW50U2VydmljZSkge1xuICAgIFxuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0cyBwbGF5aW5nIHRoZSBzdHJlYW1lZCBhdWRpb1xuICAgKi9cbiAgc3RhcnQobWlsbGlzOiBudW1iZXIpOiB2b2lke1xuICAgIGNvbnNvbGUubG9nKFwiUlRDIHNlcnZpY2U6IFBsYXlpbmcgYXVkaW8gYXQgaW5pdGlhbCBwb3NpdGlvbjogXCIrbWlsbGlzKTtcbiAgICBsZXQgdXNlck1lZGlhQ29uc3RyYWludHMgPSB7XG4gICAgICBhdWRpbzogdHJ1ZSxcbiAgICAgIHZpZGVvOiBmYWxzZVxuICAgIH1cbiAgICBsZXQgb3B0aW9ucyA9IHtcbiAgICAgIHJlbW90ZVZpZGVvOiB0aGlzLnZpZGVvLm5hdGl2ZUVsZW1lbnQsXG4gICAgICBtZWRpYUNvbnN0cmFpbnRzOiB1c2VyTWVkaWFDb25zdHJhaW50cyxcbiAgICAgIG9uaWNlY2FuZGlkYXRlOiAoY2FuZGlkYXRlOiBhbnkpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coJ1JUQyBzZXJ2aWNlOiBMb2NhbCBjYW5kaWRhdGUgJyArIEpTT04uc3RyaW5naWZ5KGNhbmRpZGF0ZSkpO1xuICAgICAgICBsZXQgbWVzc2FnZSA9IHtcbiAgICAgICAgICBpZDogJ29uSWNlQ2FuZGlkYXRlJyxcbiAgICAgICAgICBjYW5kaWRhdGU6IGNhbmRpZGF0ZVxuICAgICAgICB9XG4gICAgICAgIHRoaXMud3Muc2VuZChKU09OLnN0cmluZ2lmeShtZXNzYWdlKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMud2ViUnRjUGVlciA9IFdlYlJ0Y1BlZXIuV2ViUnRjUGVlclJlY3Zvbmx5KG9wdGlvbnMsIChlcnJvcjogU3RyaW5nKSA9PiB7XG4gICAgICBpZihlcnJvcil7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBjcmVhdGluZyB0aGUgcGVlciBjb25uZWN0aW9uOiAlc1wiLCBlcnJvcik7XG4gICAgICAgIGxldCBldmVudCA6IEMzZXZlbnQgPSB7dHlwZTogRXZlbnRUeXBlLlJlbW90ZVBsYXlGYWlsZWQsIHZhbHVlOiB7YXQ6XCJzdGFydFwiLCByZWFzb246ZXJyb3J9fTtcbiAgICAgICAgdGhpcy5ldmVudFNlcnZpY2UuRW1pdHRlci5uZXh0KGV2ZW50KTtcbiAgICAgIH1lbHNle1xuICAgICAgICB0aGlzLndlYlJ0Y1BlZXIuZ2VuZXJhdGVPZmZlcigoZXJyb3I6IFN0cmluZywgc2RwOiBTdHJpbmcpID0+IHtcbiAgICAgICAgICBpZihlcnJvcil7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgZ2VuZXJhdGluZyB0aGUgb2ZmZXI6ICVzXCIsIGVycm9yKTtcbiAgICAgICAgICAgIGxldCBldmVudCA6IEMzZXZlbnQgPSB7dHlwZTogRXZlbnRUeXBlLlJlbW90ZVBsYXlGYWlsZWQsIHZhbHVlOiB7YXQ6XCJzdGFydFwiLCByZWFzb246ZXJyb3J9fTtcbiAgICAgICAgICAgIHRoaXMuZXZlbnRTZXJ2aWNlLkVtaXR0ZXIubmV4dChldmVudCk7XG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBsZXQgbWVzc2FnZSA9IHtcbiAgICAgICAgICAgICAgaWQ6ICdzdGFydCcsXG4gICAgICAgICAgICAgIHNkcE9mZmVyOiBzZHAsXG4gICAgICAgICAgICAgIHBvc2l0aW9uOiBtaWxsaXMsXG4gICAgICAgICAgICAgIHZpZGVvdXJsOiB0aGlzLmF1ZGlvU291cmNlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlNlbmRpbmcgc3RhcnQgbWVzc2FnZVwiKTtcbiAgICAgICAgICAgIHRoaXMud3Muc2VuZChKU09OLnN0cmluZ2lmeShtZXNzYWdlKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wcyB0aGUgc3RyZWFtaW5nXG4gICAqL1xuICBzdG9wKCk6IHZvaWR7XG4gICAgY29uc29sZS5sb2coXCJSVEMgc2VydmljZTogU3RvcHBpbmcgYXVkaW9cIik7XG4gICAgaWYgKHRoaXMud2ViUnRjUGVlcikge1xuICAgICAgdHJ5e1xuICAgICAgICB0aGlzLndlYlJ0Y1BlZXIuZGlzcG9zZSgpO1xuICAgICAgICB0aGlzLndlYlJ0Y1BlZXIgPSBudWxsO1xuICAgICAgICB2YXIgbWVzc2FnZSA9IHtcbiAgICAgICAgICAgIGlkOiAnc3RvcCdcbiAgICAgICAgfVxuICAgICAgICB0aGlzLndzLnNlbmQoSlNPTi5zdHJpbmdpZnkobWVzc2FnZSkpO1xuICAgICAgICBsZXQgZXZlbnQgOiBDM2V2ZW50ID0ge3R5cGU6IEV2ZW50VHlwZS5SZW1vdGVQbGF5U3RvcHBlZCwgdmFsdWU6IHt9fTtcbiAgICAgICAgdGhpcy5ldmVudFNlcnZpY2UuRW1pdHRlci5uZXh0KGV2ZW50KTtcbiAgICAgIH1jYXRjaChlcnJvcil7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBzdG9wcGluZyB0aGUgcGxheWVyOiAlc1wiLCBlcnJvcik7XG4gICAgICAgIGxldCBldmVudCA6IEMzZXZlbnQgPSB7dHlwZTogRXZlbnRUeXBlLlJlbW90ZVBsYXlGYWlsZWQsIHZhbHVlOiB7YXQ6XCJzdG9wXCIsIHJlYXNvbjplcnJvcn19O1xuICAgICAgICB0aGlzLmV2ZW50U2VydmljZS5FbWl0dGVyLm5leHQoZXZlbnQpO1xuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIHN0b3BwaW5nIHRoZSBwbGF5ZXI6IHBlZXIgY29ubmVjdGlvbiBpcyBjbG9zZWRcIik7XG4gICAgICBsZXQgZXZlbnQgOiBDM2V2ZW50ID0ge3R5cGU6IEV2ZW50VHlwZS5SZW1vdGVQbGF5RmFpbGVkLCB2YWx1ZToge2F0Olwic3RvcFwiLCByZWFzb246XCJQZWVyIGNvbm5lY3Rpb24gaXMgY2xvc2VkXCJ9fTtcbiAgICAgIHRoaXMuZXZlbnRTZXJ2aWNlLkVtaXR0ZXIubmV4dChldmVudCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0cyB0aGUgUGVlciBjb25uZWN0aW9uXG4gICAqL1xuICByZXNldENvbm5lY3Rpb24oKTogdm9pZHtcbiAgICBjb25zb2xlLmxvZyhcIlJUQyBzZXJ2aWNlOiByZXNldHRpbmcgcGVlciBjb25uZWN0aW9uXCIpO1xuICAgIGlmKHRoaXMud2ViUnRjUGVlcil7XG4gICAgICB0cnl7XG4gICAgICAgIHRoaXMud2ViUnRjUGVlci5kaXNwb3NlKCk7XG4gICAgICAgIHRoaXMud2ViUnRjUGVlciA9IG51bGw7XG4gICAgICAgIGxldCBldmVudCA6IEMzZXZlbnQgPSB7dHlwZTogRXZlbnRUeXBlLlJlbW90ZUNvbm5lY3Rpb25SZXNldCwgdmFsdWU6IHt9fTtcbiAgICAgICAgdGhpcy5ldmVudFNlcnZpY2UuRW1pdHRlci5uZXh0KGV2ZW50KTtcbiAgICAgIH1jYXRjaChlcnJvcil7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciByZXNldHRpbmcgdGhlIHBlZXIgY29ubmVjdGlvbjogJXNcIiwgZXJyb3IpO1xuICAgICAgICBsZXQgZXZlbnQgOiBDM2V2ZW50ID0ge3R5cGU6IEV2ZW50VHlwZS5Mb2NhbENvbm5lY3Rpb25FcnJvciwgdmFsdWU6IHthdDogXCJyZXNldENvbm5lY3Rpb25cIiwgcmVhc29uOmVycm9yfX07XG4gICAgICAgIHRoaXMuZXZlbnRTZXJ2aWNlLkVtaXR0ZXIubmV4dChldmVudCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE1vdmVzIHRvIHRoZSBzcGVjaWZpZWQgbWlsbGlzZWNvbmRcbiAgICogQHBhcmFtIHRpbWU6IHBsYXllZCB0aW1lIGluIG1pbGxpc2Vjb25kc1xuICAgKi9cbiAgZG9TZWVrQXQodGltZTogbnVtYmVyKTogdm9pZHtcbiAgICBjb25zb2xlLmxvZyhcIlJUQyBzZXJ2aWNlOiBkb2luZyBzZWVrIGF0ICVzXCIsIHRpbWUudG9TdHJpbmcoKSk7XG4gICAgdHJ5e1xuICAgICAgdmFyIG1lc3NhZ2UgPSB7XG4gICAgICAgIGlkOiAnZG9TZWVrJyxcbiAgICAgICAgcG9zaXRpb246IHRpbWVcbiAgICAgIH1cbiAgICAgIHRoaXMud3Muc2VuZChKU09OLnN0cmluZ2lmeShtZXNzYWdlKSk7XG4gICAgICBsZXQgZXZlbnQgOiBDM2V2ZW50ID0ge3R5cGU6IEV2ZW50VHlwZS5SZW1vdGVQbGF5U2Vla2VkLCB2YWx1ZToge3NlZWtUaW1lOiB0aW1lfX07XG4gICAgICB0aGlzLmV2ZW50U2VydmljZS5FbWl0dGVyLm5leHQoZXZlbnQpO1xuICAgIH1jYXRjaChlcnJvcil7XG4gICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgZG9pbmcgc2VlazogJXNcIiwgZXJyb3IpO1xuICAgICAgbGV0IGV2ZW50IDogQzNldmVudCA9IHt0eXBlOiBFdmVudFR5cGUuUmVtb3RlU2Vla0ZhaWxlZCwgdmFsdWU6IHthdDogXCJkb1NlZWtcIiwgcmVhc29uOmVycm9yfX07XG4gICAgICB0aGlzLmV2ZW50U2VydmljZS5FbWl0dGVyLm5leHQoZXZlbnQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQYXVzZXMgdGhlIHN0cmVhbWluZ1xuICAgKi9cbiAgcGF1c2UoKTogdm9pZHtcbiAgICBjb25zb2xlLmxvZyhcIlJUQyBzZXJ2aWNlOiBQYXVzaW5nIGF1ZGlvXCIpO1xuICAgIHRyeXtcbiAgICAgIHZhciBtZXNzYWdlID0ge1xuICAgICAgICBpZDogJ3BhdXNlJ1xuICAgICAgfVxuICAgICAgdGhpcy53cy5zZW5kKEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpKTtcbiAgICAgIGxldCBldmVudCA6IEMzZXZlbnQgPSB7dHlwZTogRXZlbnRUeXBlLlJlbW90ZVBsYXlQYXVzZWQsIHZhbHVlOiB7fX07XG4gICAgICB0aGlzLmV2ZW50U2VydmljZS5FbWl0dGVyLm5leHQoZXZlbnQpO1xuICAgIH1jYXRjaChlcnJvcil7XG4gICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgcGF1c2luZyB0aGUgc3RyZWFtaW5nOiAlc1wiLCBlcnJvcik7XG4gICAgICBsZXQgZXZlbnQgOiBDM2V2ZW50ID0ge3R5cGU6IEV2ZW50VHlwZS5SZW1vdGVQbGF5RmFpbGVkLCB2YWx1ZToge2F0OiBcInBhdXNlXCIsIHJlYXNvbjplcnJvcn19O1xuICAgICAgdGhpcy5ldmVudFNlcnZpY2UuRW1pdHRlci5uZXh0KGV2ZW50KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVzdW1lcyB0aGUgc3RyZWFtaW5nXG4gICAqL1xuICByZXN1bWUoKTogdm9pZHtcbiAgICBjb25zb2xlLmxvZyhcIlJUQyBzZXJ2aWNlOiBSZXN1bWluZyBhdWRpb1wiKTtcbiAgICB0cnl7XG4gICAgICB2YXIgbWVzc2FnZSA9IHtcbiAgICAgICAgaWQ6ICdyZXN1bWUnXG4gICAgICB9XG4gICAgICB0aGlzLndzLnNlbmQoSlNPTi5zdHJpbmdpZnkobWVzc2FnZSkpO1xuICAgICAgbGV0IGV2ZW50IDogQzNldmVudCA9IHt0eXBlOiBFdmVudFR5cGUuUmVtb3RlUGxheVJlc3VtZWQsIHZhbHVlOiB7fX07XG4gICAgICB0aGlzLmV2ZW50U2VydmljZS5FbWl0dGVyLm5leHQoZXZlbnQpO1xuICAgIH1jYXRjaChlcnJvcil7XG4gICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgcmVzdW1pbmcgdGhlIHN0cmVhbWluZzogJXNcIiwgZXJyb3IpO1xuICAgICAgbGV0IGV2ZW50IDogQzNldmVudCA9IHt0eXBlOiBFdmVudFR5cGUuUmVtb3RlUGxheUZhaWxlZCwgdmFsdWU6IHthdDogXCJyZXN1bWVcIiwgcmVhc29uOmVycm9yfX07XG4gICAgICB0aGlzLmV2ZW50U2VydmljZS5FbWl0dGVyLm5leHQoZXZlbnQpO1xuICAgIH1cbiAgfVxuXG4gIG11dGUoKTogdm9pZHtcbiAgICB0cnl7XG4gICAgICB0aGlzLndlYlJ0Y1BlZXIuZ2V0UmVtb3RlU3RyZWFtKCkuZ2V0QXVkaW9UcmFja3MoKS5mb3JFYWNoKHRyYWNrID0+IHtcbiAgICAgICAgdHJhY2suZW5hYmxlZCA9IGZhbHNlO1xuICAgICAgfSk7XG4gICAgICBsZXQgZXZlbnQgOiBDM2V2ZW50ID0ge3R5cGU6IEV2ZW50VHlwZS5Mb2NhbEF1ZGlvTGV2ZWwsIHZhbHVlOiB7YWN0aW9uOlwibXV0ZVwifX07XG4gICAgICB0aGlzLmV2ZW50U2VydmljZS5FbWl0dGVyLm5leHQoZXZlbnQpO1xuICAgIH1jYXRjaChlcnJvcil7XG4gICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgbXV0aW5nIGF1ZGlvOiAlc1wiLCBlcnJvcik7XG4gICAgICBsZXQgZXZlbnQgOiBDM2V2ZW50ID0ge3R5cGU6IEV2ZW50VHlwZS5Mb2NhbEF1ZGlvTGV2ZWxFcnJvciwgdmFsdWU6IHthdDogXCJtdXRlXCIsIHJlYXNvbjplcnJvcn19O1xuICAgICAgdGhpcy5ldmVudFNlcnZpY2UuRW1pdHRlci5uZXh0KGV2ZW50KTtcbiAgICB9XG4gIH1cblxuICB1bm11dGUoKTogdm9pZHtcbiAgICB0cnl7XG4gICAgICB0aGlzLndlYlJ0Y1BlZXIuZ2V0UmVtb3RlU3RyZWFtKCkuZ2V0QXVkaW9UcmFja3MoKS5mb3JFYWNoKHRyYWNrID0+IHtcbiAgICAgICAgdHJhY2suZW5hYmxlZCA9IHRydWU7XG4gICAgICB9KTtcbiAgICAgIGxldCBldmVudCA6IEMzZXZlbnQgPSB7dHlwZTogRXZlbnRUeXBlLkxvY2FsQXVkaW9MZXZlbCwgdmFsdWU6IHthY3Rpb246XCJ1bm11dGVcIn19O1xuICAgICAgdGhpcy5ldmVudFNlcnZpY2UuRW1pdHRlci5uZXh0KGV2ZW50KTtcbiAgICB9Y2F0Y2goZXJyb3Ipe1xuICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIHVubXV0aW5nIGF1ZGlvOiAlc1wiLCBlcnJvcik7XG4gICAgICBsZXQgZXZlbnQgOiBDM2V2ZW50ID0ge3R5cGU6IEV2ZW50VHlwZS5Mb2NhbEF1ZGlvTGV2ZWxFcnJvciwgdmFsdWU6IHthdDogXCJ1bm11dGVcIiwgcmVhc29uOmVycm9yfX07XG4gICAgICB0aGlzLmV2ZW50U2VydmljZS5FbWl0dGVyLm5leHQoZXZlbnQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9jZXNzZXMgdGhlIFNEUCBhbnN3ZXJcbiAgICogQHBhcmFtIHNkcEFuc3dlciBTRFAgYW5zd2VyIGFzIHN0cmluZ1xuICAgKiBAcGFyYW0gY2FsbGJhY2sgY2FsbGJhY2tcbiAgICovXG4gIHByb2Nlc3NBbnN3ZXIoc2RwQW5zd2VyOiBzdHJpbmcsIGNhbGxiYWNrOiAoZXJyb3I6IHN0cmluZykgPT4gdm9pZCkgOnZvaWR7XG4gICAgY29uc29sZS5sb2coXCJSVEMgc2VydmljZTogUHJvY2Vzc2luZyBTRFAgYW5zd2VyOiAlc1wiLCBzZHBBbnN3ZXIpO1xuICAgIHRoaXMud2ViUnRjUGVlci5wcm9jZXNzQW5zd2VyKHNkcEFuc3dlciwgY2FsbGJhY2spO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgSUNFIGNhbmRpZGF0ZVxuICAgKiBAcGFyYW0gY2FuZGlkYXRlIGNhbmRpZGF0ZVxuICAgKiBAcGFyYW0gY2FsbGJhY2sgY2FsbGJhY2tcbiAgICovXG4gIGFkZEljZUNhbmRpZGF0ZShjYW5kaWRhdGU6IFJUQ0ljZUNhbmRpZGF0ZSwgY2FsbGJhY2s6IChlcnJvcjogc3RyaW5nKSA9PiB2b2lkKTogdm9pZHtcbiAgICBjb25zb2xlLmxvZyhcIlJUQyBzZXJ2aWNlOiBBZGRpbmcgSWNlIENhbmRpZGF0ZTogJXNcIiwgSlNPTi5zdHJpbmdpZnkoY2FuZGlkYXRlKSk7XG4gICAgdGhpcy53ZWJSdGNQZWVyLmFkZEljZUNhbmRpZGF0ZShjYW5kaWRhdGUsIGNhbGxiYWNrKTtcbiAgfVxufVxuIl19