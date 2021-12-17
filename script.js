
let original_x, original_y, original_width, original_height;

let svg, prov, muns, munData, provData, regData, colorSwitches, modeSwitches;

const PHDATA = {
  capital: "Manila",
  area: 298170,
  regions: 17,
  provinces: 81,
  cities: 146,
  municipalities: 1488,
  barangays: 42046,
  population: {
    "2020": 109035343
  },
  pop_density: (109035343/298170).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})
};

const YEAR = "2020";

let colorProvBy = "boundary";
let chosen = null;

// const fileURL = "";
const fileURL = "https://sambelmonte.github.io/philippinemap/";
d3.svg(`${fileURL}PHMap2.svg`).then((svgMap) => {
  d3.select("body").node().prepend(svgMap.documentElement);
  svg = d3.select("#PHMap");
  const {
    x,
    y,
    width,
    height
  } = document.getElementById("PH").getBBox();
  original_x = x;
  original_y = y;
  original_width = width;
  original_height = height;
  svg.on("click", reset);
  prov = d3.selectAll(".lgu")
    // .on("mouseover", mouseovered)
    // .on("mouseout", mouseout)
    .on("click", clicked);
  muns = d3.selectAll(".municipality");
  colorSwitches = d3.selectAll(".map-switch-button")
    .on("click", switched);
  modeSwitches = d3.selectAll(".map-switch-mode")
    .on("click", modeChange);

  // querystring
  const objUrlParams = new URLSearchParams(window.location.search);
  if (objUrlParams.has('code')) {
    const code = objUrlParams.get('code');
    const [provCode, munCode] = code.split('-');
    try {
      if (munCode && munData[code]) {
        chosen = {
          provCode,
          code
        };
      } else if (provData[provCode]) {
        chosen = { provCode };
      }
    } catch (_) {}
  }

  reset();
});

d3.json(`${fileURL}mun_data.json`).then((munDataJson) => {
  munData = munDataJson;
});
d3.json(`${fileURL}prov_data.json`).then((provDataJson) => {
  provData = provDataJson;
});
d3.json(`${fileURL}region_data.json`).then((regDataJson) => {
  regData = regDataJson;
});

// function mouseovered(event) {
//   console.log(event.target.parentNode.id)
// }

function reset(event) {
  prov.classed("selectedlgu", false).classed("lgu", true);
  provColor();
  d3.selectAll(".full-lgu").attr("fill", "auto").classed("selectedlgu", false).raise();
  d3.selectAll(".full-province").attr("display", "none");
  d3.selectAll(".lgu-city").raise();
  d3.selectAll(".text").attr("display", "block").classed("text-not-chosen", false).raise();
  d3.selectAll(".municipality").attr("class", "municipality");
  if (!event && chosen && chosen !== "") {
    show(chosen.provCode, chosen.code);
  } else {
    chosen = null;
    setLabels("","PHILIPPINES","", PHDATA);
    svg.transition()
      .duration(750)
      .attr("viewBox", [original_x, original_y, original_width, original_height]);
  }
}

function clicked(event) {
  event.stopPropagation();
  if (event.target.parentNode.classList.contains('selectedmunicipality') ||
      event.target.parentNode.parentNode.classList.contains('selectedmunicipality')) {
    return;
  }
  const provId = event.target.parentNode.id
    ? event.target.parentNode.id.substring(0, 3)
    : event.target.parentNode.parentNode.id.substring(0, 3);
  if (event.target.parentNode.classList.contains('full-lgu') ||
        event.target.classList.contains('text') ||
        event.target.parentNode.classList.contains('text')) {
    show(provId, null);
  } else if (event.target.parentNode.classList.contains('municipality') ||
      event.target.parentNode.parentNode.classList.contains('municipality')) {
    show(provId, event.target.parentNode.id);
  }
}

function show(provId, munId) {
  const {
    x,
    y,
    width,
    height
  } = document.getElementById(`${provId}-00`).getBBox();
  d3.selectAll(".selectedlgu").classed("selectedlgu", false);
  d3.selectAll(".full-lgu").attr("fill", "auto").raise();
  d3.selectAll(".lgu-city").raise();
  d3.selectAll(".text").attr("display", "block").classed("text-not-chosen", true).raise();
  d3.select("#"+provId).select("text").attr("display", "none");
  d3.select("#"+provId+"-00").attr("fill", "none").classed("selectedlgu", true);
  d3.select("#"+provId).classed("selectedlgu", true).classed("lgu", false).raise();
  d3.selectAll(".municipality").attr("class", "municipality");
  svg.transition().duration(750).attr("viewBox", [x-75, y-75, width+150, height+150]);
  if (munId) {
    chosen = {
      provCode: provId,
      munCode: munId
    };
    const mun = munData[munId];
    setLabels(
      regData[mun.region.toString()].name.toUpperCase(),
      (mun.official_name !== ""
        ? mun.official_name
        : mun.type !== "MUN"
        ? `City of ${mun.name}`
        : mun.name
      ).toUpperCase(),
      mun.region !== 0 && (mun.type === "MUN" || mun.type === "CC")
        ? provData[mun.province].name.toUpperCase()
        : "",
      mun
    );
    d3.select("#"+munId).attr("class", "municipality selectedmunicipality").raise();
  } else {
    chosen = { provCode: provId };
    const province = provData[provId];
    setLabels(
      province.region !== 0
        ? regData[province.region.toString()].name.toUpperCase()
        : "",
      province.name.toUpperCase(),
      "",
      province
    );
  }
}

const detailList = [
  {
    name: 'type',
    type: 'type',
  },
  {
    name: 'old_name',
    label: 'former name',
    type: 'text',
  },
  {
    name: 'capital',
    type: 'text',
  },
  {
    name: 'population',
    label: 'population (2020)',
    type: 'yearcount',
  },
  {
    name: 'pop_growth',
    label: 'pop. growth (2020)',
    type: 'yeartext',
  },
  {
    name: 'area',
    type: 'area',
  },
  {
    name: 'pop_density',
    label: 'pop. density (2020)',
    type: 'density',
  },
  {
    name: 'regions',
    type: 'count',
  },
  {
    name: 'provinces',
    type: 'count',
  },
  {
    name: 'cities',
    type: 'count',
  },
  {
    name: 'municipalities',
    type: 'count',
  },
  {
    name: 'barangays',
    type: 'count',
  },
  {
    name: 'cong_district',
    label: 'cong. district',
    type: 'congdistrict',
  }
]

function setLabels(pretitle, title, subtitle, data={}) {
  d3.select("#data-pretitle-text").html(pretitle);
  d3.select("#data-title-text").html(title);
  d3.select("#data-subtitle-text").html(subtitle);
  d3.selectAll(".data-transition")
    .style("width", "0%")
    .transition()
    .duration(500)
    .style("width", "100%");

  const details = d3.select('#data-details-container-container').html("").style("max-height", "0px");
  detailList.forEach(detail => {
    if (data[detail.name] && data[detail.name] !== "" && data[detail.name] !== "0") {
      const detailDiv = details.insert("div")
        .attr("id", `data-details-${detail.name}`)
        .attr("class", `data-details-${detail.name}`);
      detailDiv.insert("span")
        .attr("id", `data-details-${detail.name}-label`)
        .attr("class", "data-label")
        .html(
          detail.label
          ? detail.label.toUpperCase()
          : detail.name.toUpperCase()
        );
      detailDiv.insert("span")
        .attr("id", `data-details-${detail.name}-text`)
        .attr("class", "data-text")
        .html(
          detail.type === 'text'
          ? data[detail.name].toUpperCase()
          : detail.type === 'type'
          ? typeSwitch(data[detail.name])
          : detail.type === 'yeartext'
          ? data[detail.name][YEAR].toUpperCase()
          : detail.type === 'area'
          ? `${numberWithCommas(data[detail.name])} sq km`
          : detail.type === 'density'
          ? `${numberWithCommas(data[detail.name])}/sq km`
          : detail.type === 'yearcount'
          ? numberWithCommas(data[detail.name][YEAR])
          : detail.type === 'congdistrict'
          ? congDistrict(data)
          : numberWithCommas(data[detail.name])
        );
    }
  });
  details.transition()
    .duration(500)
    .style("max-height", "250px"); 
}

function numberWithCommas(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function typeSwitch(type) {
  switch (type) {
    case 'MUN': return 'MUNICIPALITY';
    case 'CC': return 'COMPONENT CITY';
    case 'ICC': return 'INDEPENDENT COMPONENT CITY';
    case 'HUC': return 'HIGHLY URBANIZED CITY';
    case 'PRV': return 'PROVINCE';
    case 'REG': return 'REGION';
    default: return '';
  }
}

function congDistrict(data) {
  const distr = data.cong_shared && data.cong_shared !== ''
    ? provData[data.cong_shared].name.trim()
    : data.cong_district.indexOf('D') < 0
    ? data.name.trim()
    + (
      data.type === 'HUC' || 
      data.type === 'ICC' ||
      data.type === 'CC'
      ? ' City'
      : ''
    )
    : provData[data.province].name.trim()
  if (data.cong_district.indexOf('D') < 0 
    && data.cong_district.indexOf('L') < 0 
    && data.cong_district.indexOf('S') < 0 ) {
      if (data.cong_district === '1') {
        return '1 district';
      } else {
        return `${data.cong_district} districts`;
      }
  } else if (data.cong_district === '1S') {
    return 'Taguig-Pateros\'s 1st';
  } else if (data.cong_district === '1L1S') {
    return '2 districts';
  } else if (data.cong_district === 'LD') {
    return `${distr}'s at-large`;
  } else if (data.cong_district === '1D') {
    return `${distr}'s 1st`;
  } else if (data.cong_district === '2D') {
    return `${distr}'s 2nd`;
  } else if (data.cong_district === '3D') {
    return `${distr}'s 3rd`;
  } else if (data.cong_district.indexOf('D') > 0) {
    return `${distr}'s ${data.cong_district.charAt(0)}th`;
  } else if (data.cong_district === '1L') {
    return `${distr}'s at-large`;
  } else {
    return `${data.cong_district.charAt(0)} districts`;
  }
}

function modeChange(event) {
  const toggle = !d3.select(`#${event.target.id}`).classed('map-switch-clicked');
  d3.select(`#${event.target.id}`).classed('map-switch-clicked', toggle);
  switch(event.target.id) {
    case 'map-mode-province':
      d3.selectAll('.full-lgu').classed('hide-lgu', toggle);
      if (toggle) {
        d3.select(`#${event.target.id}`).html('Show Provinces');
      } else {
        d3.select(`#${event.target.id}`).html('Hide Provinces');
      }
      break;
    case 'map-mode-names':
      d3.selectAll('.text').classed('hide-text', toggle);
      if (toggle) {
        d3.select(`#${event.target.id}`).html('Show Names');
      } else {
        d3.select(`#${event.target.id}`).html('Hide Names');
      }
      break;
    case 'map-mode-details':
      d3.select('.data-details').classed('hide-data-details', toggle);
      if (toggle) {
        d3.select(`#${event.target.id}`).html('Show Details');
      } else {
        d3.select(`#${event.target.id}`).html('Hide Details');
      }
      break;
    case 'map-mode-guides':
      d3.selectAll('.guide').classed('hide-guide', toggle);
      if (toggle) {
        d3.select(`#${event.target.id}`).html('Show Guides');
      } else {
        d3.select(`#${event.target.id}`).html('Hide Guides');
      }
      break;
    default:
  }
}

function switched(event) {
  colorSwitches.classed('map-switch-clicked', false);
  d3.select(`#${event.target.id}`).classed('map-switch-clicked', true);
  switch(event.target.id) {
    case 'map-switch-reg':
      colorProvBy = 'region';
      break;
    case 'map-switch-pop':
      colorProvBy = 'population';
      break;
    case 'map-switch-area':
      colorProvBy = 'area';
      break;
    case 'map-switch-density':
      colorProvBy = 'density';
      break;
    case 'map-switch-growth':
      colorProvBy = 'popgrowth';
      break;
    case 'map-switch-congress':
      colorProvBy = 'congdistrict';
      break;
    case 'map-switch-type':
      colorProvBy = 'type';
      break;
    default:
      colorProvBy = 'boundary';
  }
  provColor();
}

const colors = {
  region: {
    prov: {
      "0": "#FC7E29",
      "1": "#AF5315",
      "2": "#FC7E29",
      "3": "#C06500",
      "5": "#E57325",
      "6": "#ff7d4d",
      "7": "#CB802C",
      "8": "#B33E00",
      "9": "#ff8500",
      "10": "#D06922",
      "11": "#FC7E29",
      "12": "#AF5315",
      "13": "#E97000",
      "14": "#ff6a33",
      "15": "#E57325",
      "40": "#ff7d4d",
      "41": "#D06922"
    },
    mun: {
      "0": "#F7F6C5",
      "1": "#F2BAC9",
      "2": "#F3FAE1",
      "3": "#A9DEF9",
      "5": "#F3DAD5",
      "6": "#CEECED",
      "7": "#C4E8FA",
      "8": "#F6E0C7",
      "9": "#F3DAD5",
      "10": "#F7F6C5",
      "11": "#F2BAC9",
      "12": "#F3FAE1",
      "13": "#A9DEF9",
      "14": "#F6E7C6",
      "15": "#F5D8C7",
      "40": "#F6E7C6",
      "41": "#F5D8C7"
    }
  },
  type: {
    'REG': '#F7F6C5',
    'PRV': '#F2BAC9',
    'HUC': '#F3FAE1',
    'ICC': '#A9DEF9',
    'CC': '#F6E7C6',
    'MUN': '#AEAEAE'
  },
  district: {
    mun: {
      "LD": "#C4E8FA",
      "1D": "#F7F6C5",
      "2D": "#F2BAC9",
      "3D": "#F3FAE1",
      "4D": "#A9DEF9",
      "5D": "#F6E7C6",
      "6D": "#F5D8C7",
      "7D": "#F3DAD5",
      "8D": "#CEECED",
      "1L": "#FFF",
      "2L": "#E8E8E8",
      "3L": "#E0E0E0",
      "4L": "#D8D8D8",
      "5L": "#D0D0D0",
      "6L": "#C8C8C8",
      "1L1S": "#E8E8E8",
      "1S": "#FFF",
    }
  },
  lgu: {
    prov: ["#FC7E29", "#AF5315", "#E97000", "#C06500", "#E57325", "#C67317", "#CB802C", "#B33E00", "#D08C3F", "#D06922"],
    mun: ["#F7F6C5", "#F2BAC9", "#F3FAE1", "#A9DEF9", "#F6E7C6", "#F5D8C7", "#F3DAD5", "#CEECED", "#C4E8FA", "#F6E0C7", "#F3DAD5", "#FFCDB2", "#FFB4A2", "#FAD4C0"]
  }
}

function provColor(){
  switch(colorProvBy){
    case 'region':
      prov.each((a, b, c) => {
        const pId = c[b].id;
        const pdata = d3.select(`#${pId}`);
        pdata.attr("fill", colors.region.prov[provData[pId].region]);
      });
      muns.each((a, b, c) => {
        const pId = c[b].id;
        const pdata = d3.select(`#${pId}`);
        pdata.attr("fill", colors.region.mun[munData[pId].region]);
      });
      break;
    case 'type':
      prov.each((a, b, c) => {
        const pId = c[b].id;
        const pdata = d3.select(`#${pId}`);
        pdata.attr("fill", colors.type[provData[pId].type]);
      });
      muns.each((a, b, c) => {
        const pId = c[b].id;
        const pdata = d3.select(`#${pId}`);
        pdata.attr("fill", colors.type[munData[pId].type]);
      });
      break;
    case 'population':
      prov.each((a, b, c) => {
        const pId = c[b].id;
        const pdata = d3.select(`#${pId}`);
        pdata.attr("fill", ColorLuminance("#AF5315", Number(provData[pId].population["2020"])/3000000));
      });
      muns.each((a, b, c) => {
        const pId = c[b].id;
        const pdata = d3.select(`#${pId}`);
        pdata.attr("fill", ColorLuminance("#94778B", Number(munData[pId].population["2020"])/250000));
      });
      break;
    case 'area':
      prov.each((a, b, c) => {
        const pId = c[b].id;
        const pdata = d3.select(`#${pId}`);
        pdata.attr("fill", ColorLuminance("#AF5315", Number(provData[pId].area)/10000));
      });
      muns.each((a, b, c) => {
        const pId = c[b].id;
        const pdata = d3.select(`#${pId}`);
        pdata.attr("fill", ColorLuminance("#94778B", Number(munData[pId].area)/1000));
      });
      break;
    case 'density':
      prov.each((a, b, c) => {
        const pId = c[b].id;
        const pdata = d3.select(`#${pId}`);
        pdata.attr("fill", ColorLuminance("#AF5315", Number(provData[pId].pop_density.replace(',',''))/3000));
      });
      muns.each((a, b, c) => {
        const pId = c[b].id;
        const pdata = d3.select(`#${pId}`);
        pdata.attr("fill", ColorLuminance("#94778B", Number(munData[pId].pop_density.replace(',',''))/2500));
      });
      break;
    case 'popgrowth':
      prov.each((a, b, c) => {
        const pId = c[b].id;
        const pdata = d3.select(`#${pId}`);
        pdata.attr("fill", ColorLuminance("#AF5315", Number(provData[pId].pop_growth['2020'].replace('%',''))/2.75));
      });
      muns.each((a, b, c) => {
        const pId = c[b].id;
        const pdata = d3.select(`#${pId}`);
        pdata.attr("fill", ColorLuminance("#94778B", Number(munData[pId].pop_growth['2020'].replace('%',''))/4));
      });
      break;
    case 'congdistrict':
      prov.each((a, b, c) => {
        const pId = c[b].id;
        const pdata = d3.select(`#${pId}`);
        pdata.attr("fill", ColorLuminance("#AF5315", Number(provData[pId].cong_district)/4));
      });
      muns.each((a, b, c) => {
        const pId = c[b].id;
        const pdata = d3.select(`#${pId}`);
        pdata.attr("fill", colors.district.mun[munData[pId].cong_district]);
      });
      break;
    default:
      prov.each((a, b, c) => {
        const pId = c[b].id;
        const pdata = d3.select(`#${pId}`);
        pdata.attr("fill", colors.lgu.prov[b % 10]);
      });
      muns.each((a, b, c) => {
        const pId = c[b].id;
        const pdata = d3.select(`#${pId}`);
        pdata.attr("fill", colors.lgu.mun[b % 10]);
      });
  }
}

function ColorLuminance(hex, lum) {

	// validate hex string
	hex = String(hex).replace(/[^0-9a-f]/gi, '');
	if (hex.length < 6) {
		hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	}
	lum = lum || 0;

	// convert to decimal and change luminosity
	var rgb = "#", c, i;
	for (i = 0; i < 3; i++) {
		c = parseInt(hex.substr(i*2,2), 16);
		c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
		rgb += ("00"+c).substr(c.length);
	}

	return rgb;
}