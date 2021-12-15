
let original_x, original_y, original_width, original_height;

let svg, prov, muns, munData, provData, regData, switches;

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

let colorProvBy = "province";
let chosen = null;

const fileURL = "";
// const fileURL = "https://sambelmonte.github.io/philippinemap/";
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
  switches = d3.selectAll(".map-switch-button")
    .on("click", switched);

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
  d3.selectAll(".full-lgu").attr("display", "block").raise();
  d3.selectAll(".full-province").attr("display", "none");
  d3.selectAll(".lgu-city").raise();
  d3.selectAll(".text").attr("display", "block").classed("text-not-chosen", false).raise();
  d3.selectAll(".municipality").classed("class", "municipality");
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
  d3.select(".selectedlgu").classed("selectedlgu", false);
  d3.selectAll(".full-lgu").attr("display", "block").raise();
  d3.selectAll(".lgu-city").raise();
  d3.selectAll(".text").attr("display", "block").classed("text-not-chosen", true).raise();
  d3.select("#"+provId).select("text").attr("display", "none");
  d3.select("#"+provId+"-00").attr("display", "none");
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

function switched(event) {
  switches.classed('map-switch-clicked', false);
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
    default:
      colorProvBy = 'province';
  }
  provColor();
}

function provColor(){
  let colors;
  switch(colorProvBy){
    case 'region':
      colors = {
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
      };
      prov.each((a, b, c) => {
        const pId = c[b].id;
        const pdata = d3.select(`#${pId}`);
        pdata.attr("fill", colors[provData[pId].region]);
      });
      break;
    case 'population':
      prov.each((a, b, c) => {
        const pId = c[b].id;
        const pdata = d3.select(`#${pId}`);
        pdata.attr("fill", ColorLuminance("#AF5315", Number(provData[pId].population["2020"])/3000000));
      });
      break;
    case 'area':
      prov.each((a, b, c) => {
        const pId = c[b].id;
        const pdata = d3.select(`#${pId}`);
        pdata.attr("fill", ColorLuminance("#AF5315", Number(provData[pId].area)/10000));
      });
      break;
    case 'density':
      prov.each((a, b, c) => {
        const pId = c[b].id;
        const pdata = d3.select(`#${pId}`);
        pdata.attr("fill", ColorLuminance("#AF5315", Number(provData[pId].pop_density.replace(',',''))/3000));
      });
      break;
    case 'popgrowth':
      prov.each((a, b, c) => {
        const pId = c[b].id;
        const pdata = d3.select(`#${pId}`);
        pdata.attr("fill", ColorLuminance("#AF5315", Number(provData[pId].pop_growth['2020'].replace('%',''))/2.75));
      });
      break;
    default:
      colors = ["#FC7E29", "#AF5315", "#E97000", "#C06500", "#E57325", "#C67317", "#CB802C", "#B33E00", "#D08C3F", "#D06922"];
      prov.each((a, b, c) => {
        const pId = c[b].id;
        const pdata = d3.select(`#${pId}`);
        pdata.attr("fill", colors[b % 10]);
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