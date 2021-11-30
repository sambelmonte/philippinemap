
let original_x, original_y, original_width, original_height;

let svg, prov, muns, munData, provData, regData;

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
  }
};

const YEAR = "2020";

const fileURL = "";
// const fileURL = "https://philippinemap.vercel.app/";
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

function reset() {
  prov.classed("selectedlgu", false).classed("lgu", true)
    .each((a, b, c) => {
      const pId = c[b].id;
      const pdata = d3.select(`#${pId}`);
      const colors = ["#FC7E29", "#AF5315", "#E97000", "#C06500", "#E57325", "#C67317", "#CB802C", "#B33E00", "#D08C3F", "#D06922"];
      pdata.attr("fill", colors[b % 10])
    });
  d3.selectAll(".full-lgu").attr("display", "block").raise();
  d3.selectAll(".full-province").attr("display", "none");
  d3.selectAll(".lgu-city").raise();
  d3.selectAll(".text").attr("display", "block").classed("text-not-chosen", false).raise();
  d3.selectAll(".municipality").classed("class", "municipality");
  setLabels("","PHILIPPINES","", PHDATA);
  svg.transition()
    .duration(750)
    .attr("viewBox", [original_x, original_y, original_width, original_height]);
}

function clicked(event) {
  if (event.target.parentNode.classList.contains('selectedmunicipality') ||
      event.target.parentNode.parentNode.classList.contains('selectedmunicipality')) {
    return;
  }
  const provId = event.target.parentNode.id
    ? event.target.parentNode.id.substring(0, 3)
    : event.target.parentNode.parentNode.id.substring(0, 3);
  const {
    x,
    y,
    width,
    height
  } = document.getElementById(`${provId}-00`).getBBox();
  event.stopPropagation();
  d3.select(".selectedlgu").classed("selectedlgu", false);
  d3.selectAll(".full-lgu").attr("display", "block").raise();
  d3.selectAll(".lgu-city").raise();
  d3.selectAll(".text").attr("display", "block").classed("text-not-chosen", true).raise();
  d3.select("#"+provId).select("text").attr("display", "none");
  d3.select("#"+provId+"-00").attr("display", "none");
  d3.select("#"+provId).classed("selectedlgu", true).classed("lgu", false).raise();
  d3.selectAll(".municipality").attr("class", "municipality");
  svg.transition().duration(750).attr("viewBox", [x-75, y-75, width+150, height+150]);
  if (event.target.parentNode.classList.contains('full-lgu') ||
        event.target.classList.contains('text') ||
        event.target.parentNode.classList.contains('text')) {
    setLabels(
      provData[provId].region !== 0
        ? regData[provData[provId].region.toString()].name.toUpperCase()
        : "",
      provData[provId].name.toUpperCase(),
      "",
      provData[provId]
    );
  } else if (event.target.parentNode.classList.contains('municipality') ||
      event.target.parentNode.parentNode.classList.contains('municipality')) {
    const mun = munData[event.target.parentNode.id];
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
    d3.select("#"+event.target.parentNode.id).attr("class", "municipality selectedmunicipality").raise();
  }
}

const detailList = [
  {
    name: 'type',
    type: 'type',
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
    if (data[detail.name] && data[detail.name] !== "") {
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