const fs = require('fs');

/**
 * 0 code,
 * 1 name,
 * 2 region,
 * 3 type,
 * 4 capital,
 * 5 population2010,
 * 6 population2015,
 * 7 population2020,
 * 8 population2024,
 * 9 growth2015,
 * 10 growth2020,
 * 11 growth10y,
 * 12 growth2024,
 * 13 area,
 * 14 municipalities,
 * 15 cities,
 * 16 barangays,
 * 17 cong_district,
 * 18 aka
 */
try {
  const data = fs.readFileSync('./lgu_data.csv', 'utf8').split('\r\n');
  let lguList = {};

  for (i=1; i<data.length; i++) {
    const munData = data[i].split(',');
    lguList[munData[0]] = {
      name: munData[1],
      aka: munData[18],
      region: munData[2],
      type: munData[3],
      capital: munData[4],
      population: {
        '2010': munData[5],
        '2015': munData[6],
        '2020': munData[7],
        '2024': munData[8],
      },
      pop_growth: {
        '2015': `${parseInt(munData[9],10).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}%`,
        '2020': `${parseInt(munData[10],10).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}%`,
        '2024': `${parseInt(munData[12],10).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}%`,
      },
      pop_density: (munData[8] / munData[13]).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}),
      area: munData[13],
      municipalities: munData[14],
      cities: munData[15],
      barangays: munData[16],
      cong_district: munData[17]
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