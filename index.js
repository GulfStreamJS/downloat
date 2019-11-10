const Downloading = require('downloading');
const webtorrent = require('webtorrent');
const metator = require('metator');
const path = require('path');
const fs = require('fs');

const index = (params = {}) => {
    if (params.downloat)
        return Promise.resolve(params);
    if (!params.source)
        return Promise.reject({message: 'The parameters is required!', value: 'source'});

    let name = params.source
        .replace(/[^a-z0-9]/ig, '_').toUpperCase() + '.json';

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
        const torrent = client.add(params.source, {path: dir});

        let st = setTimeout(() => {
            if (si) clearInterval(si);
            fs.writeFileSync(path.join(dir, name), JSON.stringify({
                error: 'NO START'
            }, null, 2));
            bar.tick(0, {title: 'NO START'});
            try {
                client.destroy(err => err ? console.error(err) : '');
            } catch (e) {
                console.error(e);
            }
            return resolve({...params, ...{downloat: {error: 'NO START'}}});
        }, 1000 * 10);

        torrent.on('ready', () => {
            if (st) clearTimeout(st);
        });

        let si = setInterval(() => {
            bar.tick(load, {
                title: torrent.name
                    ? torrent.name
                    : 'SEARCH PEERS'
            });
            if (percent !== previous) {
                previous = percent;
                fs.writeFileSync(path.join(dir, name), JSON.stringify({
                    name: torrent.name
                        ? torrent.name
                        : 'SEARCH PEERS',
                    percent: percent
                }, null, 2));
            } else {
                disable++;
                if (disable >= 7200) {
                    if (st) clearTimeout(st);
                    if (si) clearInterval(si);
                    fs.writeFileSync(path.join(dir, name), JSON.stringify({
                        error: "NO PEERS"
                    }, null, 2));
                    bar.tick(0, {title: 'NO PEERS'});
                    try {
                        client.destroy(err => err ? console.error(err) : '');
                    } catch (e) {
                        console.error(e);
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
            if (si) clearInterval(si);
            Promise.all(
                torrent.files.map(file => metator
                    .info(path.join(dir, file.path)))
            ).then(files => {
                let downloat = [];
                files.forEach(file => {
                    if (file && file.length) {
                        file[0].hash = torrent.infoHash;
                        downloat.push(file[0]);
                    }
                });
                downloat = downloat.filter(file => {
                    if (params.season && params.episode) {
                        if (typeof file.season === 'undefined' ||
                            typeof file.episode === 'undefined') return false;
                        let s = typeof file.season === 'number'
                            ? file.season.toString()
                            : file.season;
                        let e = typeof file.episode === 'number'
                            ? file.episode.toString()
                            : file.episode;
                        if (typeof params.season === 'number') {
                            params.season = params.season.toString();
                        } else if (typeof params.season === 'object') {
                            params.season = params.season.map(season => season
                                .toString()
                                .replace(/[^0-9]/, ''));
                        }
                        if (typeof params.episode === 'number') {
                            params.episode = params.episode.toString();
                        } else if (typeof params.episode === 'object') {
                            params.episode = params.episode.map(episode => episode
                                .toString()
                                .replace(/[^0-9]/, ''));
                        }
                        return ((
                            typeof params.season === 'string' &&
                            params.season === s
                        ) || (
                            typeof params.season === 'object' &&
                            params.season.indexOf(s) + 1
                        )) && ((
                            typeof params.episode === 'string' &&
                            params.episode === e
                        ) || (
                            typeof params.episode === 'object' &&
                            params.episode.indexOf(e) + 1
                        ));
                    }
                    return true;
                });
                bar.tick(bar.total - bar.curr, {title: '☑ DOWNLOAT'});
                fs.writeFileSync(path.join(dir, name), JSON.stringify(
                    downloat, null, 2));
                try {
                    client.destroy(err => err ? console.error(err) : '');
                } catch (e) {
                    console.error(e);
                }
                return resolve({...params, ...{downloat}});
            });
        });

    });

};

module.exports = index;