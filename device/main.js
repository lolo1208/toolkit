/**
 * Created by LOLO on 2021/12/1.
 */

const url = require('url');
const crypto = require('crypto');
const {program} = require('commander');
const {WebSocketServer} = require('ws');
const publicIp = require('public-ip');
const logger = require('./daily-logger');


// 解析命令行参数
program
    .version('1.0.0')
    .option('-t, --ticket [value]', '客户端连接时需匹配该验证码。若未指定该参数，该值将会在启动时随机生成。')
    .option('-p, --port [number]', '指定侦听用于客户端访问的端口号。', '1202')
    .option('-i, --ipAddresses [values...]', '指定的客户端 IP 地址才可建立连接。')
    .option('-l, --logDir [values]', '设置日志保存的目录。默认将会保存在当前脚本的上一级目录。')
    .parse(process.argv);

const opts = program.opts();
const PORT = opts.port;
const IPs = opts.ipAddresses;
const TICKET = opts.ticket ? opts.ticket : crypto.randomBytes(16).toString('hex');
if (opts.logDir) logger.setSaveDir(opts.logDir);


// 启动 WebSocketServer
const wss = new WebSocketServer({port: PORT, verifyClient: VerifyClient});
(async () => {
    let ip = await publicIp.v4();
    logger.append(
        '-- startup --',
        'using ticket: ' + TICKET,
        `ws://${ip}:${PORT}`
    );
})();


// 验证客户端
function VerifyClient(info) {
    const ip = info.req.socket.remoteAddress;
    const params = url.parse(info.req.url, true).query;
    const ticket = params.ticket;
    if (ticket !== TICKET) {
        logger.append(`ERROR ticket: ${ticket} ip: ${ip}`);
        return false;
    }
    if (!IPs) return true;// 无需验证 ip 地址
    for (let i = 0; i < IPs.length; i++) {
        if (ip === IPs[i]) return true;
    }
    logger.append(`ERROR ip: ${ticket}`);
    return false;
}

// 与客户端建立连接
wss.on('connection', (ws, req) => {
    const ip = req.socket.remoteAddress;
    logger.append('connected ip: ' + ip);
});