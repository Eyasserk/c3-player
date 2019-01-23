import { ElementRef } from '@angular/core';
import { EventService } from './event.service';
export declare class KurentoService {
    private ws;
    private audioSource;
    private video;
    private eventService;
    private webRtcPeer;
    /**
     * Creates a new Kurento Service
     * @param ws WEb Socket Connection
     * @param audioSource Audio URL
     */
    constructor(ws: WebSocket, audioSource: string, video: ElementRef, eventService: EventService);
    /**
     * Starts playing the streamed audio
     */
    start(millis: number): void;
    /**
     * Stops the streaming
     */
    stop(): void;
    /**
     * Resets the Peer connection
     */
    resetConnection(): void;
    /**
     * Moves to the specified millisecond
     * @param time: played time in milliseconds
     */
    doSeekAt(time: number): void;
    /**
     * Pauses the streaming
     */
    pause(): void;
    /**
     * Resumes the streaming
     */
    resume(): void;
    mute(): void;
    unmute(): void;
    /**
     * Processes the SDP answer
     * @param sdpAnswer SDP answer as string
     * @param callback callback
     */
    processAnswer(sdpAnswer: string, callback: (error: string) => void): void;
    /**
     * Adds ICE candidate
     * @param candidate candidate
     * @param callback callback
     */
    addIceCandidate(candidate: RTCIceCandidate, callback: (error: string) => void): void;
}
