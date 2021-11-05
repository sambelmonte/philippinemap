const fs = require('fs');

try {
  const data = fs.readFileSync('./mun_data.csv', 'utf8').split('\r\n');
  let munList = {};

  for (i=1; i<data.length; i++) {
    const munData = data[i].split(',');
    munList[munData[0]] = {
      code: munData[1],
      PSGC: munData[2],
      name: munData[3],
      official_name: munData[4],
      type: munData[6],
      sub_district: munData[7],
      cong_district: munData[8],
      population: {
        '2010': munData[9],
        '2015': munData[10],
        '2020': munData[11],
      },
      area: munData[12],
      barangays: munData[13],
      region: munData[14],
      province: munData[15]
    };
  }

  const roar = JSON.stringify(munList);
  // console.log('munlist', munList);
  console.log('roar', roar);
  fs.writeFileSync('../mun_data.json', roar);
} catch (err) {
  console.error('error', err);
}

 
// const file = '../mun_data.json'
// const obj = { name: 'JP' }
 
// jsonfile.writeFile(file, obj, function (err) {
//   if (err) console.error(err)
// })