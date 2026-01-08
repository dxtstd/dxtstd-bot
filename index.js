"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
var child_process_1 = require("child_process");
var path = require("path");
var fs = require("fs");
var os = require("os");
var CFonts = require("cfonts");
var Utils_1 = {
    logger: console
};
var packageJSON = JSON.parse(String(fs.readFileSync('./package.json')));
CFonts.say('dxtstd-bot', {
    font: 'block',
    align: 'center',
    colors: ['#70ccff', '#AEAEAE']
});
CFonts.say("'".concat(packageJSON.name, "' By @").concat(packageJSON.author.name || packageJSON.author), {
    font: 'console',
    align: 'center',
    colors: ['#70ccff']
});
var AutoRestart = false;
var IsRunning = false;
Utils_1.logger.info({
    OS: os.platform(),
    Arch: os.arch()
}, 'Detected System');
/**
 * Start a ts file
 * @param {string} file `path/to/file`
 */
var start = function (file, opts) {
    IsRunning = true;
    var args = __spreadArray([path.resolve(__dirname, file)], process.argv.slice(2), true);
    var i = 0;
    args.slice(1).forEach(function (v) {
        i++;
        var opts = v.replace(/--/g, '');
        switch (opts) {
            case 'auto-restart':
                Utils_1.logger.info('Enable Auto Restart (main ts-node)');
                AutoRestart = true;
                args.splice(i, 1);
                break;
        }
    });
    Utils_1.logger.info('starting ts-node %s', args[0]);
    var node = (0, child_process_1.spawn)(process.argv[0].split("/").map(v => { if (v == "node") return "ts-"+v; else return v; }).join("/"), args, {
        stdio: ['inherit', 'inherit', 'inherit', 'ipc']
    });
    node.on('exit', function () {
        var exit = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            exit[_i] = arguments[_i];
        }
        IsRunning = false;
        if (exit[0])
            Utils_1.logger.warn('exit code: %s', exit[0]);
        if (exit[1])
            Utils_1.logger.warn('exit signal: %s', exit[1]);
        if (IsRunning)
            return;
        if (AutoRestart)
            Utils_1.logger.info('Restarting...'), start(file);
    });
    node.on('message', function (msg) {
        Utils_1.logger.info('Receive MSG (ts-node): %s', msg);
        switch (msg) {
            case 'shutdown':
                node.kill();
                process.exit();
                break;
            case 'restart':
                node.kill();
                IsRunning = false;
                if (AutoRestart)
                    return;
                Utils_1.logger.info('Restarting...');
                start(file);
                break;
            case 'uptime':
                node.send(process.uptime());
                break;
        }
        ;
    });
};
start('./src/index.ts');
