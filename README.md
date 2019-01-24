# C3Player

Audio Streaming Player Component

## About

This component is an Angular 2 (6.0+) player component for audio streaming against Kurento Streaming Server.
It reproduces an audio with WebRTC streaming

## How to install?

```
npm i c3-player
```

## How to use?

```
<c3-player audio="xxxx" image="xxxx" wsUrl="xxxx" duration="xxxx"></c3-player>
```

| Input Name     | Definition            | Default Value | Example                        |
| :------------- | :-------------------: | :-----------: | -----------------------------: |
| audio          | URL of the audio      | None          | https://example.com/audio1.ogg |
| image          | URL of the wave image | None          | https://example.com/wave1.png  |
| wsUrl          | WS URL                | None          | https://kurento.example.com/ws |
| duration       | Duration in millis    | None          | 60000 (1min)                   |
| width          | Width of the player   | 100%          | 50%                            |
| margin         | Margin of the player  | auto          | 25%                            |
| img-dim        | Relation width/height | 5             | 3                              |
