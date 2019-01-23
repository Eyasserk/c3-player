import { OnInit, OnDestroy, ElementRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MathService } from '../../services/math.service';
import { EventService } from '../../services/event.service';
export declare class C3playerComponent implements OnInit, OnDestroy {
    private mathService;
    private eventService;
    private ws;
    private kurentoService;
    private _timer;
    private offset;
    playing: BehaviorSubject<boolean>;
    private wsConnected;
    private playedTime;
    tooltipDisplay: ElementRef;
    private wantedTime;
    player: ElementRef;
    video: ElementRef;
    imageSource: string;
    audioSource: string;
    wsUrl: string;
    totalDuration: number;
    spinnerDisplay: string;
    muted: BehaviorSubject<boolean>;
    private firstTime;
    constructor(mathService: MathService, eventService: EventService);
    ngOnInit(): void;
    ngOnDestroy(): void;
    getPlayedHours(): String;
    getPlayedMinutes(): String;
    getPlayedSeconds(): String;
    getTotalHours(): String;
    getTotalMinutes(): String;
    getTotalSeconds(): String;
    getWantedHours(): String;
    getWantedMinutes(): String;
    getWantedSeconds(): String;
    getSeekPosition(): number;
    /**
     * TODO implementar metodos
     */
    play(): void;
    stop(): void;
    seekClicked(event: any): void;
    seekReleased(event: MouseEvent): void;
    seekDragged(): void;
    onDragStart(event: any): void;
    onDragEnd(event: any): void;
    onMouseOverSeek(event: MouseEvent): void;
    onMouseExitSeek(event: MouseEvent): void;
    onMouseMoveSeek(event: MouseEvent): void;
    displayErrorMessage(error: string): void;
    switchSound(): void;
}
