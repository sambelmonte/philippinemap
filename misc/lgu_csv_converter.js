const fs = require('fs');

try {
  const data = fs.readFileSync('./lgu_data.csv', 'utf8').split('\r\n');
  let lguList = {};

  for (i=1; i<data.length; i++) {
    const munData = data[i].split(',');
    lguList[munData[0]] = {
      name: munData[1],
      region: munData[2],
      type: munData[3],
      capital: munData[4],
      population: {
        '2010': munData[5],
        '2015': munData[6],
        '2020': munData[7],
      },
      pop_growth: {
        '2015': ((munData[6] - munData[5])/ munData[6] / 5 * 100).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) + "%",
        '2020': ((munData[7] - munData[6])/ munData[7] / 5 * 100).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) + "%"
      },
      pop_density: (munData[7] / munData[8]).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}),
      area: munData[8],
      municipalities: munData[9],
      cities: munData[10],
      barangays: munData[11],
      cong_district: munData[12]
    };
  }

  const roar = JSON.stringify(lguList);
  // console.log('roar', roar);
  fs.writeFileSync('../prov_data.json', roar);
} catch (err) {
  console.error('error', err);
}

 
// const file = '../mun_data.json'
// const obj = { name: 'JP' }
 
// jsonfile.writeFile(file, obj, function (err) {
//   if (err) console.error(err)
// })