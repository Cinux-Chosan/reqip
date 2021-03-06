#!/usr/bin/env node
import * as os from 'os';
import * as http from 'http';
import * as requestIp from 'request-ip';
import * as qrcode from 'qrcode-terminal';
import publicIp = require( 'public-ip');
import ora = require('ora');
import Table =require('cli-table');
import yargs = require('yargs/yargs');

let listenUrl = "";

const argv = yargs(process.argv.slice(2))
    .options({
        p: {
            alias: 'port',
            demandOption: true,
            default: '8888',
            describe: 'server listen port',
            type: 'number'
        },
        i: {
            alias: 'public',
            demandOption: false,
            default: false,
            describe: 'display public ip',
            type: 'boolean'
        },
        f: {
            alias: "full",
            default: false,
            describe: 'full net interface description',
            type: 'boolean'
        },
        h: {
            alias:'help'
        }
    })
    .argv;

const { port } = argv;

(async () => {

    const niList = os.networkInterfaces()
    const propCollector = {}
    const niNames :string[]= [];

    loopObj(niList, (niName, niInfos) => { 
        niNames.push(niName);
        loopObj(niInfos, (k, info) => Object.assign(propCollector, info))
    })

    const propList = argv.full ? Object.keys(propCollector) : ['address'];

    const head = ['net interface',... propList];

    const table = new Table({ head })

    niNames.sort().forEach(niName => {
        const ni = niList[niName];
        ni.forEach(info => {
            const { family, internal, address } = info;
            const row = [niName, ...propList.map(prop => info[prop] || '') ];
            if (family === 'IPv4' && !internal) {
                listenUrl = `http://${address}:${port}`;
            }
            table.push(row);
        })
    })


    console.log(table.toString());

    if (argv.public) {
        const spinner = ora('fetching public ip...').start();
        console.log(`public IP: ${await publicIp.v4()}(v4)\t${await publicIp.v6()}(v6)`);
        spinner.stop();
    }

    const server = http.createServer((req, res) => {
        const { socket, url = '' } = req;
        const { remoteAddress, remotePort, localAddress, localPort } = socket;
        const ip = requestIp.getClientIp(req);
        const localUri = `${localAddress}:${localPort}`
        const remoteUri = `${ip || remoteAddress}:${ip === remoteAddress ? remotePort : ''}`
        const tip  = `????????? ${localUri} ???????????? ${remoteUri} ???????????????????????????${url}`;
        console.log(tip);
        res.end(remoteUri);
    });

    server.on('clientError', (err, socket) => {
        socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    });

    server.listen(port, () => {
        console.log(`listen on port ${port}`);
        if (listenUrl) {
            qrcode.generate(listenUrl);
            console.log(`scan qrcode to visit ${listenUrl}`)
        }
    });

    function loopObj(o: any, callback: (k:string, v:any) => void) {
        for (const [ k, v ] of Object.entries(o)) {
            if (Object.prototype.hasOwnProperty.call(o, k)) {
            callback(k, v);
            }
        }
    }
})()