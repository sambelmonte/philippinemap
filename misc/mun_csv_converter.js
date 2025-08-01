const fs = require('fs');

/**
 * 0 mcode,
 * 1 code,
 * 2 PSGC,
 * 3 name,
 * 4 old_name,
 * 5 official_name,
 * 6 type,
 * 7 sub_district,
 * 8 cong_district,
 * 9 population_2010,
 * 10 population_2015,
 * 11 population_2020,
 * 12 population_2024,
 * 13 growth_2015,
 * 14 growth_2020,
 * 15 growth_decade,
 * 16 growth_2024,
 * 17 area,
 * 18 barangays,
 * 19 region,
 * 20 province,
 * 21 cong_shared
 */

try {
  const data = fs.readFileSync('./mun_data.csv', 'utf8').split('\r\n');
  let munList = {};

  for (i=1; i<data.length; i++) {
    const munData = data[i].split(',');
    munList[munData[0]] = {
      code: munData[1],
      PSGC: munData[2],
      name: munData[3],
      old_name: munData[4],
      official_name: munData[5],
      type: munData[6],
      sub_district: munData[7],
      cong_district: munData[8],
      population: {
        '2010': munData[9],
        '2015': munData[10],
        '2020': munData[11],
        '2024': munData[12]
      },
      pop_growth: {
        '2015': `${parseFloat(munData[13],10).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}%`,
        '2020': `${parseFloat(munData[14],10).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}%`,
        '2024': `${parseFloat(munData[16],10).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}%`,
      },
      pop_density: (munData[12] / munData[17]).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}),
      area: munData[17],
      barangays: munData[18],
      region: munData[19],
      province: munData[20],
      cong_shared: munData[21]
    };
  }

  const roar = JSON.stringify(munList);
  // console.log('munlist', munList);
  // console.log('roar', roar);
  fs.writeFileSync('../mun_data.json', roar);
} catch (err) {
  console.error('error', err);
}

 
// const file = '../mun_data.json'
// const obj = { name: 'JP' }
 
// jsonfile.writeFile(file, obj, function (err) {
//   if (err) console.error(err)
// })