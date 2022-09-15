# Gw2 PvP Pips Calculator

Desktop App to calculate how many PvP matches should be completed to reach a specific goal by the end of the season.

## Releases

A link to the latest release can be found within github: [releases](https://github.com/voliva/gw2-pvp-pips/releases)

## TODO

- Configure win/lose points (at the moment it assumes 4 points when lose, 11 points when winning)
- Configure win/lose rate (at the moment it assumes 50-50)
- Configure days that the user can't play (at the moment it assumes all days are playable)

## Technical details

Project built using [Tauri](https://tauri.app/), a framework that uses the OS' WebView to render a the front end (in React in this case, but it can be any other JS FE), which is orchestrated by a backend written in Rust.

Currently this project doesn't have any custom code on the BackEnd, all the logic is handled on the FE.

### Run in dev:

```
> npm i
> npm run tauri dev
```

While in dev you can open the webview devtools by using the platform's shortcut (e.g. F12 in windows)

### Compile binaries:

```
npm run tauri build
```

The resulting executable should be in `src-tauri/target/release`, and the installer in `src-tauri/target/release/bundle`

## License

The application uses some of the official assets from ArenaNet, namely the background of the window, and the icons available through their official API (pips, chests). These are trademarked by ArenaNet and NCSoft.

The code of this application is under MIT license:

### MIT License

Copyright (c) 2022 Víctor Oliva

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
