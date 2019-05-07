const Downloading = require('downloading');
const webtorrent = require('webtorrent');
const metator = require('metator');
const path = require('path');
const fs = require('fs');

const downloat = params => {

    let source = params.source
        ? params.source
        : '';

    let hash = params.hash
        ? params.hash
        : /[a-z0-9]{40}/i.test(params.source)
            ? params.source
            : 'downloat';

    let dir = params.path
        ? params.path
        : path.join('.downloat');
    fs.mkdirSync(dir, {recursive: true});

    let bar = new Downloading(':bar [:title] :percent', {
        width: 50,
        total: 100
    });

    return new Promise(resolve => {

        let percent = 0, previous = 0, load = 0, disable = 0;

        const client = new webtorrent();
        const torrent = client.add(source, {path: dir});

        let st = setTimeout(() => {
            clearInterval(si);
            fs.writeFileSync(path.join(dir, hash + '.json'), JSON.stringify({
                error: 'NO START'
            }, null, 2));
            bar.tick(0, {title: 'NO START'});
            try {
                client.destroy(err => err ? console.error(err) : '');
            } catch (e) {
            }
            return resolve({...params, ...{downloat: {error: 'NO START'}}});
        }, 1000 * 10);

        torrent.on('ready', () => {
            clearTimeout(st);
        });

        let si = setInterval(() => {
            bar.tick(load, {
                title: torrent.name
                    ? torrent.name
                    : 'SEARCH PEERS'
            });
            if (percent !== previous) {
                previous = percent;
                fs.writeFileSync(path.join(dir, hash + '.json'), JSON.stringify({
                    "name": torrent.name,
                    "status": percent
                }, null, 2));
            } else {
                disable++;
                if (disable >= 7200) {
                    clearTimeout(st);
                    clearInterval(si);
                    fs.writeFileSync(path.join(dir, hash + '.json'), JSON.stringify({
                        "error": "NO PEERS"
                    }, null, 2));
                    bar.tick(0, {title: 'NO PEERS'});
                    try {
                        client.destroy(err => err ? console.error(err) : '');
                    } catch (e) {
                    }
                    return resolve({...params, ...{downloat: {error: 'NO PEERS'}}});
                }
            }
            percent = parseInt((client.progress * 100).toFixed(0)) > 0
                ? parseInt((client.progress * 100).toFixed(0))
                : 0;
            load = percent - bar.curr - 0.05 > 0
                ? percent - bar.curr - 0.05
                : 0;
        }, 500);

        torrent.on('done', () => {
            clearInterval(si);
            Promise.all(
                torrent.files.map(file => metator
                    .info(path.join(dir, file.path)))
            ).then(files => {
                bar.tick(bar.total - bar.curr, {title: 'DOWNLOAT'});
                fs.writeFileSync(path.join(dir, hash + '.json'), JSON.stringify(
                    files[0], null, 2));
                try {
                    client.destroy(err => err ? console.error(err) : '');
                } catch (e) {
                }
                return resolve({...params, ...{downloat: files[0]}});
            });
        });

    });

};

module.exports = downloat;