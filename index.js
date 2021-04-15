#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var os = require("os");
var http = require("http");
var requestIp = require("request-ip");
var qrcode = require("qrcode-terminal");
var publicIp = require("public-ip");
var ora = require("ora");
var Table = require("cli-table");
var yargs = require("yargs/yargs");
var listenUrl = "";
var argv = yargs(process.argv.slice(2))
    .options({
    p: {
        alias: 'port',
        demandOption: true,
        "default": '8888',
        describe: 'server listen port',
        type: 'number'
    },
    i: {
        alias: 'public',
        demandOption: false,
        "default": false,
        describe: 'display public ip',
        type: 'boolean'
    },
    f: {
        alias: "full",
        "default": false,
        describe: 'full net interface description',
        type: 'boolean'
    },
    h: {
        alias: 'help'
    }
})
    .argv;
var port = argv.port;
(function () { return __awaiter(void 0, void 0, void 0, function () {
    function loopObj(o, callback) {
        for (var _i = 0, _a = Object.entries(o); _i < _a.length; _i++) {
            var _b = _a[_i], k = _b[0], v = _b[1];
            if (Object.prototype.hasOwnProperty.call(o, k)) {
                callback(k, v);
            }
        }
    }
    var niList, propCollector, niNames, propList, head, table, spinner, _a, _b, _c, _d, server;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                niList = os.networkInterfaces();
                propCollector = {};
                niNames = [];
                loopObj(niList, function (niName, niInfos) {
                    niNames.push(niName);
                    loopObj(niInfos, function (k, info) { return Object.assign(propCollector, info); });
                });
                propList = argv.full ? Object.keys(propCollector) : ['address'];
                head = __spreadArrays(['net interface'], propList);
                table = new Table({ head: head });
                niNames.sort().forEach(function (niName) {
                    var ni = niList[niName];
                    ni.forEach(function (info) {
                        var family = info.family, internal = info.internal, address = info.address;
                        var row = __spreadArrays([niName], propList.map(function (prop) { return info[prop] || ''; }));
                        if (family === 'IPv4' && !internal) {
                            listenUrl = "http://" + address + ":" + port;
                        }
                        table.push(row);
                    });
                });
                console.log(table.toString());
                if (!argv.public) return [3 /*break*/, 3];
                spinner = ora('fetching public ip...').start();
                _b = (_a = console).log;
                _c = "public IP: ";
                return [4 /*yield*/, publicIp.v4()];
            case 1:
                _d = _c + (_e.sent()) + "(v4)\t";
                return [4 /*yield*/, publicIp.v6()];
            case 2:
                _b.apply(_a, [_d + (_e.sent()) + "(v6)"]);
                spinner.stop();
                _e.label = 3;
            case 3:
                server = http.createServer(function (req, res) {
                    var socket = req.socket, _a = req.url, url = _a === void 0 ? '' : _a;
                    var remoteAddress = socket.remoteAddress, remotePort = socket.remotePort, localAddress = socket.localAddress, localPort = socket.localPort;
                    var ip = requestIp.getClientIp(req);
                    var localUri = localAddress + ":" + localPort;
                    var remoteUri = (ip || remoteAddress) + ":" + (ip === remoteAddress ? remotePort : '');
                    var tip = "\u4ECE\u672C\u5730 " + localUri + " \u6536\u5230\u6765\u81EA " + remoteUri + " \u7684\u8BF7\u6C42\uFF0C\u8BF7\u6C42\u8DEF\u5F84\uFF1A" + url;
                    console.log(tip);
                    res.end(remoteUri);
                });
                server.on('clientError', function (err, socket) {
                    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
                });
                server.listen(port, function () {
                    console.log("listen on port " + port);
                    if (listenUrl) {
                        qrcode.generate(listenUrl);
                        console.log("scan qrcode to visit " + listenUrl);
                    }
                });
                return [2 /*return*/];
        }
    });
}); })();
