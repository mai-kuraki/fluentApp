/**
 * Created by zhengliuyang on 2018/4/20.
 */
import {remote} from 'electron';
const low = remote.require('lowdb');
const FileSync = remote.require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter);

export default db;