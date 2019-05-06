## What is `downloat`?

Torrent client for downloading video files using command-line interface.

## Installation

```bash
npm i downloat
```

#### To use the command line
```bash
npm i downloat -g
```

## Usage

Import the library in your code:

```js
const downloat = require('downloat');
```

### Download torrent

```js
downloat({source: '3652DB1AFBC5D414DBCAF5920F741FF93B1ED9E5'}).then(params => {
    if (params.downloat && !params.downloat.error) {
        console.log(JSON.stringify(params.downloat, null, 2));
    }
});
//[
//  {
//    "type": "video",
//    "path": ".downloat/My.Puppy.mp4",
//    "size": 90145915,
//    "name": "My.Puppy.mp4",
//    "sha1": "fab0dc1c934218ec446aaf9fcf13d7bc3f05b912"
//  }
//]
```

### Download torrent using CLI

```bash
downloat 3652DB1AFBC5D414DBCAF5920F741FF93B1ED9E5
```

> All files are downloaded to the folder `.downloat`, for change use `path` param.