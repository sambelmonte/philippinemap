const fs = require('fs');

try {
  const data = fs.readFileSync('./PHMap-orig.svg', 'utf8').split('\r\n');
  let svg = [];

  for(i=0; i<data.length; i++) {
    const text = data[i];
    if (text.search('<rect ') > 0) {
      continue;
    } else if (text.search('<g id=\\\"PH-0\\\"') > 0) {
      svg.push(text.replace('PH-0"', 'PH" class="country"'));
    } else if (text.search('<g id') === 2) {
      svg.push(text.replace('>', ' class="lgu">'));
    } else if (text.search('-99\\\">') > 0) {
      console.log(text)
      svg.push(text.replace('-99">', '-99" class="full-province">'));
    } else if (text.search('-00\\\">') > 0) {
      svg.push(text.replace('-00">', '-00" class="full-lgu">'));
    } else if (text.search('<g id') > 0) {
      svg.push(text.replace('>', ' class="municipality">'));
    } else if (text.search('<text')){
      svg.push(text.replace('text', 'text class="text-province"')
        .replace('class="st4 st6"', 'class="text-city"'));
    } else {
      svg.push(text);
    }
  };

  fs.writeFileSync('./PHMap.svg', svg.join('\r\n'));
} catch (err) {
  console.error('error', err);
}