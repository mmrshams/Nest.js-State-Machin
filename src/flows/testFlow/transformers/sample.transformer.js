'use strict';
exports.__esModule = true;
exports.kafka = exports.name = void 0;
function name(message) {
  const _a = message.payload.payload,
    title = _a.title,
    artist = _a.artist;
  return {
    body: title + ' ' + artist,
    username: 'test_username',
    songId: 31231,
  };
}
exports.name = name;
function kafka(message) {
  const payload = message.payload;
  return [
    {
      value: JSON.stringify(payload),
      headers: {
        header1: 'h1',
      },
    },
  ];
}
exports.kafka = kafka;
