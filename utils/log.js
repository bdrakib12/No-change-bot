const chalk = require("chalk");
function randomColor() {
  var _0x14c572 = '';
  for (var _0x3eae3b = 0; _0x3eae3b < 3; _0x3eae3b++) {
    var _0x24e226 = Math.floor(Math.random() * 256).toString(16);
    _0x14c572 += _0x24e226.length == 1 ? '0' + _0x24e226 : _0x24e226;
  }
  return '#' + _0x14c572;
}
;
module.exports = (_0x19a3ad, _0x3bccfb) => {
  switch (_0x3bccfb) {
    case "warn":
      console.log(chalk.bold.hex("#ff0000").bold("» Log « ") + _0x19a3ad);
      break;
    case "error":
      console.log(chalk.bold.hex("#ff0000").bold("» Log « ") + _0x19a3ad);
      break;
    default:
      console.log(chalk.bold.hex(randomColor()).bold(_0x3bccfb + " » ") + _0x19a3ad);
      break;
  }
};
module.exports.loader = (_0x28162e, _0x13a283) => {
  switch (_0x13a283) {
    case "warn":
      console.log(chalk.bold.hex(randomColor()).bold(" ☢️ 𝐌𝐈𝐑𝐀𝐈 𖣘 𝐁𝐎𝐓 ⚠️ 𝐑𝐀𝐊𝐈𝐁 ") + chalk.bold.hex("#8B8878").bold(_0x28162e) + chalk.bold.hex("FF00DD")(''));
      break;
    case "error":
      console.log(chalk.bold.hex(randomColor()).bold(" ☢️ 𝐌𝐈𝐑𝐀𝐈 𖣘 𝐁𝐎𝐓 ⚠️ 𝐑𝐀𝐊𝐈𝐁 ") + _0x28162e + chalk.bold.hex("5EFF00")(''));
      break;
    default:
      console.log(chalk.bold.hex(randomColor()).bold("RAKIB LOADED∞") + chalk.bold.hex(randomColor()).bold(_0x28162e) + chalk.bold.hex("FFF0000")(''));
      break;
  }
};
