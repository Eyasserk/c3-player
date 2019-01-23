# C3Player

Audio Streaming Player Component

## About

This component is an Angular 2 (6.0+) player component for audio streaming against Kurento Streaming Server.
It reproduces an audio with WebRTC streaming

## How to use?

```
<c3-player audioSource="xxxx" imageSource="xxxx" wsUrl="xxxx" totalDuration="xxxx"></c3-player>
```

| Input Name     | Definition            | Example                        |
| :------------- | :-------------------: | -----------------------------: |
| audioSource    | URL of the audio      | https://example.com/audio1.ogg |
| imageSource    | URL of the wave image | https://example.com/wave1.png  |
| wsUrl          | WS URL                | https://kurento.example.com/ws |
| totalDuration  | Duration in millis    | 60000 (1min)                   |

## Credits

[Yasser Kantour](https://github.com/yasskant)
