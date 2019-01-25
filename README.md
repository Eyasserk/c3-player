# C3Player

Audio Streaming Player Component

## About

This component is an Angular 2 (6.0+) WebRTC-based player component for audio streaming against [Kurento Streaming Server](http://www.kurento.org/).
It uses **WebRTC** and **WebSocket** to play audio not keeping any data in memory.

## Compatibility

Chrome (58+), Firefox (63+)

## How to install?

```
npm i c3-player
```

## How to use?

### Import the module

```javascript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { C3playerModule } from 'c3-player';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    C3playerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

### Use it in view

```html
<c3-player audio="xxxx" image="xxxx" wsUrl="xxxx" duration="xxxx"></c3-player>
```

Where:

| Input Name  |  Required           | Definition            | Default Value | Example                        |
| :---------- | :-----------------: | :-------------------: | :-----------: | -----------------------------: |
| audio       | :white_check_mark:  | URL of the audio      | None          | https://example.com/audio1.ogg |
| image       | :white_check_mark:  | URL of the wave image | None          | https://example.com/wave1.png  |
| wsUrl       | :white_check_mark:  | WS URL                | None          | https://kurento.example.com/ws |
| duration    | :white_check_mark:  | Duration in millis    | None          | 60000 (1min)                   |
| width       | :x:                 | Width of the player   | 100%          | 50%                            |
| margin      | :x:                 | Margin of the player  | auto          | 25%                            |
| img-dim     | :x:                 | Relation width/height | 5             | 3                              |


### Credits

[Yasser Kantour](https://github.com/yasskant)
