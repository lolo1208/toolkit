/**
 * 按天写入日志文件，每天对应一个文件
 * Created by LOLO on 2021/12/1.
 */

const path = require('path');
const fs = require('fs-extra');
const dayjs = require('dayjs');


// 当前记录使用的时间
let current, saveDir, curFile;
// 还未写入文件的日志列表
let list = [''];
let handle = null;


/**
 * 添加日志
 * @param args
 */
function append(...args) {
    console.log(args.join('\n'));
    let time = dayjs().format('HH:mm:ss.SSS');
    for (let i = 0; i < args.length; i++)
        list.push(`[${time}] ${args[i]}`);
    if (handle === null)
        handle = setTimeout(writeFile, 5000);
}


/**
 * 将当前累积的日志内容全部写入到文件中
 */
async function writeFile() {
    // 新的一天
    const now = dayjs();
    if (!current || !now.isSame(current, 'day')) {
        current = now;
        curFile = saveDir + current.format('YYYY-MM-DD') + '.log';
    }

    let data = list.join('\n') + '\n';
    list.length = 0;
    handle = null;
    await fs.ensureDir(saveDir);
    await fs.appendFile(curFile, data);
}


/**
 * 设置保存日志文件的目录
 * @param dir
 */
function setSaveDir(dir) {
    dir = path.normalize(dir + '/');
    saveDir = dir;
}

setSaveDir(`${__dirname}/../logs`); // 日志默认保存在上一级 logs 目录


//
module.exports = {
    append,
    setSaveDir,
};