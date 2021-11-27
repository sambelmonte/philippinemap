
let original_x, original_y, original_width, original_height;

let svg, prov, muns, munData, provData, regData;

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
    .on("mouseover", mouseovered)
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

function mouseovered(event) {
  console.log(event.target.parentNode.id)
}

function setLabels(pretitle, title, subtitle) {
  d3.select("#data-pretitle-text").html(pretitle);
  d3.select("#data-title-text").html(title);
  d3.select("#data-subtitle-text").html(subtitle);
}

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
  setLabels("","PHILIPPINES","");
  svg.transition()
    .duration(750)
    .attr("viewBox", [original_x, original_y, original_width, original_height]);
}

function clicked(event) {
  const provId = event.target.parentNode.id
    ? event.target.parentNode.id.substring(0, 3)
    : event.target.parentNode.parentNode.id.substring(0, 3);
  console.log(event)
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
    console.log(provData[provId])
    setLabels(
      provData[provId].region !== 0
        ? regData[provData[provId].region.toString()].name.toUpperCase()
        : "",
      provData[provId].name.toUpperCase(),
      ""
    );
  } else if (event.target.parentNode.classList.contains('municipality') ||
      event.target.parentNode.parentNode.classList.contains('municipality')) {
    const mun = munData[event.target.parentNode.id];
    console.log(mun)
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
        : ""
    );
    d3.select("#"+event.target.parentNode.id).attr("class", "municipality selectedmunicipality").raise();
  }
}