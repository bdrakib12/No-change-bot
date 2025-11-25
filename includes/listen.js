module.exports = function ({
  api: _0x432ea1,
  models: _0x291e1d
}) {
  const _0x24dfbe = require('fs');
  const _0x33b434 = require("./controllers/users")({
    'models': _0x291e1d,
    'api': _0x432ea1
  });
  const _0xbb77a6 = require("./controllers/threads")({
    'models': _0x291e1d,
    'api': _0x432ea1
  });
  const _0x32a540 = require("./controllers/currencies")({
    'models': _0x291e1d
  });
  const _0x5cbfc5 = require("../utils/log.js");
  const _0x41e070 = require("moment-timezone");
  const _0x4a3b54 = require("axios");
  var _0xc56746 = _0x41e070.tz("Asia/Kolkata").day();
  const _0x1c40fe = __dirname + "/../Script/commands/checktuongtac/";
  setInterval(async () => {
    const _0xbd7461 = _0x41e070.tz("Asia/Kolkata").day();
    const _0x14eb9f = [...global.config.NDH, ...global.config.ADMINBOT];
    try {
      if (_0xc56746 != _0xbd7461) {
        _0xc56746 = _0xbd7461;
        const _0x557d61 = _0x24dfbe.readdirSync(_0x1c40fe).filter(_0xa49c26 => {
          const _0x49b1cc = _0xa49c26.replace(".json", '');
          return _0x14eb9f.includes(_0x49b1cc) || global.data.allThreadID.includes(_0x49b1cc);
        });
        console.log("RAKIB HASAN");
        await new Promise(async _0x4639b9 => {
          for (const _0x39ea33 of _0x557d61) {
            const _0x1110c4 = JSON.parse(_0x24dfbe.readFileSync(_0x1c40fe + _0x39ea33));
            let _0x25ccf7 = [];
            let _0x3edc60 = 1;
            for (const _0x406b57 of _0x1110c4.day) {
              const _0x37bee5 = (await _0x33b434.getNameUser(_0x406b57.id)) || "RAKIB HASAN";
              _0x406b57.name = _0x37bee5;
              _0x25ccf7.push(_0x406b57);
            }
            ;
            _0x25ccf7.sort((_0x2e7580, _0x44cf77) => {
              if (_0x2e7580.count > _0x44cf77.count) {
                return -1;
              } else {
                return _0x2e7580.count < _0x44cf77.count ? 1 : _0x2e7580.name.localeCompare(_0x44cf77.name);
              }
            });
            let _0x133d0a = "==MIRAI BOT RAKIB==\n\n";
            _0x133d0a += _0x25ccf7.slice(0, 10).map(_0x41bd66 => {
              return _0x3edc60++ + ". " + _0x41bd66.name + " with " + _0x41bd66.count + " message";
            }).join("\n");
            _0x432ea1.sendMessage(_0x133d0a, _0x39ea33.replace(".json", ''), _0x58f775 => _0x58f775 ? console.log(_0x58f775) : '');
            _0x1110c4.day.forEach(_0x18abaf => {
              _0x18abaf.count = 0;
            });
            _0x1110c4.time = _0xbd7461;
            _0x24dfbe.writeFileSync(_0x1c40fe + _0x39ea33, JSON.stringify(_0x1110c4, null, 4));
          }
          _0x4639b9();
        });
        await new Promise(async _0x1e8aaa => {
          if (_0xbd7461 == 1) {
            console.log("Priyansh Rajput");
            for (const _0x5a3363 of _0x557d61) {
              const _0x7ee9c6 = JSON.parse(_0x24dfbe.readFileSync(_0x1c40fe + _0x5a3363));
              let _0x146a95 = [];
              let _0x196a74 = 1;
              for (const _0x597a64 of _0x7ee9c6.week) {
                const _0x3f60a7 = (await _0x33b434.getNameUser(_0x597a64.id)) || "Rakib Hun Yar";
                _0x597a64.name = _0x3f60a7;
                _0x146a95.push(_0x597a64);
              }
              ;
              _0x146a95.sort((_0x5f3a09, _0x2a8181) => {
                if (_0x5f3a09.count > _0x2a8181.count) {
                  return -1;
                } else {
                  return _0x5f3a09.count < _0x2a8181.count ? 1 : _0x5f3a09.name.localeCompare(_0x2a8181.name);
                }
              });
              let _0x7ae436 = "==MIRAI BOT RAKIB==\n\n";
              _0x7ae436 += _0x146a95.slice(0, 10).map(_0x2bed96 => {
                return _0x196a74++ + ". " + _0x2bed96.name + " with " + _0x2bed96.count + " message";
              }).join("\n");
              _0x432ea1.sendMessage(_0x7ae436, _0x5a3363.replace(".json", ''), _0x287d31 => _0x287d31 ? console.log(_0x287d31) : '');
              _0x7ee9c6.week.forEach(_0x15f3b5 => {
                _0x15f3b5.count = 0;
              });
              _0x24dfbe.writeFileSync(_0x1c40fe + _0x5a3363, JSON.stringify(_0x7ee9c6, null, 4));
            }
          }
          _0x1e8aaa();
        });
        global.client.sending_top = false;
      }
    } catch (_0x4e74c2) {
      console.error(_0x4e74c2);
    }
  }, 10000);
  (async function () {
    try {
      _0x5cbfc5(global.getText("listen", "startLoadEnvironment"), "[ RAKIB HASAN ]");
      let _0x2cefb5 = await _0xbb77a6.getAll();
      let _0xae5421 = await _0x33b434.getAll(["userID", "name", "data"]);
      let _0x16bbb3 = await _0x32a540.getAll(["userID"]);
      for (const _0xc75ca1 of _0x2cefb5) {
        const _0x244677 = String(_0xc75ca1.threadID);
        global.data.allThreadID.push(_0x244677);
        global.data.threadData.set(_0x244677, _0xc75ca1.data || {});
        global.data.threadInfo.set(_0x244677, _0xc75ca1.threadInfo || {});
        if (_0xc75ca1.data && _0xc75ca1.data.banned == true) {
          global.data.threadBanned.set(_0x244677, {
            'reason': _0xc75ca1.data.reason || '',
            'dateAdded': _0xc75ca1.data.dateAdded || ''
          });
        }
        if (_0xc75ca1.data && _0xc75ca1.data.commandBanned && _0xc75ca1.data.commandBanned.length != 0) {
          global.data.commandBanned.set(_0x244677, _0xc75ca1.data.commandBanned);
        }
        if (_0xc75ca1.data && _0xc75ca1.data.NSFW) {
          global.data.threadAllowNSFW.push(_0x244677);
        }
      }
      _0x5cbfc5.loader(global.getText("listen", "loadedEnvironmentThread"));
      for (const _0xf35771 of _0xae5421) {
        const _0x5f359a = String(_0xf35771.userID);
        global.data.allUserID.push(_0x5f359a);
        if (_0xf35771.name && _0xf35771.name.length != 0) {
          global.data.userName.set(_0x5f359a, _0xf35771.name);
        }
        if (_0xf35771.data && _0xf35771.data.banned == 1) {
          global.data.userBanned.set(_0x5f359a, {
            'reason': _0xf35771.data.reason || '',
            'dateAdded': _0xf35771.data.dateAdded || ''
          });
        }
        if (_0xf35771.data && _0xf35771.data.commandBanned && _0xf35771.data.commandBanned.length != 0) {
          global.data.commandBanned.set(_0x5f359a, _0xf35771.data.commandBanned);
        }
      }
      for (const _0x1dfa33 of _0x16bbb3) global.data.allCurrenciesID.push(String(_0x1dfa33.userID));
      _0x5cbfc5.loader(global.getText("listen", "loadedEnvironmentUser"));
      _0x5cbfc5(global.getText("listen", "successLoadEnvironment"), "[ hoon ]");
    } catch (_0x1e847f) {
      return _0x5cbfc5.loader(global.getText("listen", "failLoadEnvironment", _0x1e847f), "error");
    }
  })();
  _0x5cbfc5("[ " + global.config.PREFIX + " ] • " + (!global.config.BOTNAME ? '' : global.config.BOTNAME), "[ RAKIB HASAN ]");
  const _0x46d8d5 = require("./handle/handleCommand")({
    'api': _0x432ea1,
    'models': _0x291e1d,
    'Users': _0x33b434,
    'Threads': _0xbb77a6,
    'Currencies': _0x32a540
  });
  const _0x41623d = require("./handle/handleCommandEvent")({
    'api': _0x432ea1,
    'models': _0x291e1d,
    'Users': _0x33b434,
    'Threads': _0xbb77a6,
    'Currencies': _0x32a540
  });
  const _0x45ea6d = require("./handle/handleReply")({
    'api': _0x432ea1,
    'models': _0x291e1d,
    'Users': _0x33b434,
    'Threads': _0xbb77a6,
    'Currencies': _0x32a540
  });
  const _0x4ac411 = require("./handle/handleReaction")({
    'api': _0x432ea1,
    'models': _0x291e1d,
    'Users': _0x33b434,
    'Threads': _0xbb77a6,
    'Currencies': _0x32a540
  });
  const _0x4302d9 = require("./handle/handleEvent")({
    'api': _0x432ea1,
    'models': _0x291e1d,
    'Users': _0x33b434,
    'Threads': _0xbb77a6,
    'Currencies': _0x32a540
  });
  const _0x47d0da = require("./handle/handleCreateDatabase")({
    'api': _0x432ea1,
    'Threads': _0xbb77a6,
    'Users': _0x33b434,
    'Currencies': _0x32a540,
    'models': _0x291e1d
  });
  const _0x53ef31 = __dirname + "/../Script/commands/cache/datlich.json";
  const _0x4e9f79 = {
    0x1: 2678400000,
    0x2: 2419200000,
    0x3: 2678400000,
    0x4: 2592000000,
    0x5: 2678400000,
    0x6: 2592000000,
    0x7: 2678400000,
    0x8: 2678400000,
    0x9: 2592000000,
    0xa: 2678400000,
    0xb: 2592000000,
    0xc: 2678400000
  };
  const _0x11ee72 = _0xe891e2 => new Promise(_0x3a5eed => {
    _0xe891e2.forEach((_0x3cf92b, _0x27003d) => _0xe891e2[_0x27003d] = parseInt(String(_0x3cf92b).trim()));
    if (_0xe891e2[1] > 12 || _0xe891e2[1] < 1) {
      _0x3a5eed("Your month seems invalid");
    }
    if (_0xe891e2[0] > (_0xe891e2[1] == 0 ? 0 : _0xe891e2[1] == 2 ? _0xe891e2[2] % 4 == 0 ? 29 : 28 : [1, 3, 5, 7, 8, 10, 12].includes(_0xe891e2[1]) ? 31 : 30) || _0xe891e2[0] < 1) {
      _0x3a5eed("Your date seems invalid");
    }
    if (_0xe891e2[2] < 2022) {
      _0x3a5eed("What era do you live in?");
    }
    if (_0xe891e2[3] > 23 || _0xe891e2[3] < 0) {
      _0x3a5eed("Your time seems to be invalid");
    }
    if (_0xe891e2[4] > 59 || _0xe891e2[3] < 0) {
      _0x3a5eed("Your minute seems invalid");
    }
    if (_0xe891e2[5] > 59 || _0xe891e2[3] < 0) {
      _0x3a5eed("Your seconds seem invalid");
    }
    yr = _0xe891e2[2] - 1970;
    yearToMS = yr * 365 * 24 * 60 * 60 * 1000;
    yearToMS += ((yr - 2) / 4).toFixed(0) * 24 * 60 * 60 * 1000;
    monthToMS = 0;
    for (let _0x2b5c87 = 1; _0x2b5c87 < _0xe891e2[1]; _0x2b5c87++) {
      monthToMS += _0x4e9f79[_0x2b5c87];
    }
    if (_0xe891e2[2] % 4 == 0) {
      monthToMS += 86400000;
    }
    dayToMS = _0xe891e2[0] * 24 * 60 * 60 * 1000;
    hourToMS = _0xe891e2[3] * 60 * 60 * 1000;
    minuteToMS = _0xe891e2[4] * 60 * 1000;
    secondToMS = _0xe891e2[5] * 1000;
    oneDayToMS = 86400000;
    timeMs = yearToMS + monthToMS + dayToMS + hourToMS + minuteToMS + secondToMS - oneDayToMS;
    _0x3a5eed(timeMs);
  });
  const _0xca2f12 = async () => {
    if (!_0x24dfbe.existsSync(_0x53ef31)) {
      _0x24dfbe.writeFileSync(_0x53ef31, JSON.stringify({}, null, 4));
    }
    var _0x1133b6 = JSON.parse(_0x24dfbe.readFileSync(_0x53ef31));
    var _0x74fe7b = _0x41e070().tz("Asia/Kolkata").format("DD/MM/YYYY_HH:mm:ss");
    _0x74fe7b = _0x74fe7b.split('_');
    _0x74fe7b = [..._0x74fe7b[0].split('/'), ..._0x74fe7b[1].split(':')];
    let _0x1174fd = [];
    let _0xedb11 = await _0x11ee72(_0x74fe7b);
    const _0x3b924e = _0x1eea3c => new Promise(async _0x4f471e => {
      let _0x49c9ee = await _0x11ee72(_0x1eea3c.split('_'));
      if (_0x49c9ee < _0xedb11) {
        if (_0xedb11 - _0x49c9ee < 600000) {
          _0x1133b6[boxID][_0x1eea3c].TID = boxID;
          _0x1174fd.push(_0x1133b6[boxID][_0x1eea3c]);
          delete _0x1133b6[boxID][_0x1eea3c];
        } else {
          delete _0x1133b6[boxID][_0x1eea3c];
        }
        _0x24dfbe.writeFileSync(_0x53ef31, JSON.stringify(_0x1133b6, null, 4));
      }
      ;
      _0x4f471e();
    });
    await new Promise(async _0x29e66c => {
      for (boxID in _0x1133b6) {
        for (e of Object.keys(_0x1133b6[boxID])) await _0x3b924e(e);
      }
      _0x29e66c();
    });
    for (el of _0x1174fd) {
      try {
        var _0x3e4480 = (await _0xbb77a6.getInfo(el.TID)).participantIDs;
        _0x3e4480.splice(_0x3e4480.indexOf(_0x432ea1.getCurrentUserID()), 1);
        var _0x4a6190 = el.REASON || "🥰🥰🥰";
        var _0x676276 = [];
        for (let _0x442522 = 0; _0x442522 < _0x3e4480.length; _0x442522++) {
          if (_0x442522 == _0x4a6190.length) {
            _0x4a6190 += " ‍ ";
          }
          _0x676276.push({
            'tag': _0x4a6190[_0x442522],
            'id': _0x3e4480[_0x442522],
            'fromIndex': _0x442522 - 1
          });
        }
      } catch (_0x4af072) {
        return console.log(_0x4af072);
      }
      var _0x2ed0bf = {
        'body': _0x4a6190,
        'mentions': _0x676276
      };
      if ("ATTACHMENT" in el) {
        _0x2ed0bf.attachment = [];
        for (a of el.ATTACHMENT) {
          let _0x252bee = (await _0x4a3b54.get(encodeURI(a.url), {
            'responseType': "arraybuffer"
          })).data;
          _0x24dfbe.writeFileSync(__dirname + ("/../Script/commands/cache/" + a.fileName), Buffer.from(_0x252bee, "utf-8"));
          _0x2ed0bf.attachment.push(_0x24dfbe.createReadStream(__dirname + ("/../Script/commands/cache/" + a.fileName)));
        }
      }
      console.log(_0x2ed0bf);
      if ("BOX" in el) {
        await _0x432ea1.setTitle(el.BOX, el.TID);
      }
      _0x432ea1.sendMessage(_0x2ed0bf, el.TID, () => "ATTACHMENT" in el ? el.ATTACHMENT.forEach(_0x19f267 => _0x24dfbe.unlinkSync(__dirname + ("/../Script/commands/cache/" + _0x19f267.fileName))) : '');
    }
  };
  setInterval(_0xca2f12, 60000);
  return _0x480752 => {
    switch (_0x480752.type) {
      case "message":
      case "message_reply":
      case "message_unsend":
        _0x47d0da({
          'event': _0x480752
        });
        _0x46d8d5({
          'event': _0x480752
        });
        _0x45ea6d({
          'event': _0x480752
        });
        _0x41623d({
          'event': _0x480752
        });
        break;
      case "event":
        _0x4302d9({
          'event': _0x480752
        });
        break;
      case "message_reaction":
        9;
        _0x4ac411({
          'event': _0x480752
        });
        break;
      default:
        break;
    }
  };
};
