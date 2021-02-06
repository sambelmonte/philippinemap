
const width = 800;
const height = 1000;
const original_width = 4751;
const original_height = 6104.2;

let svg, prov, munData, provData, regData;

const fileURL = "";
// const fileURL = "https://ph-map-v2.vercel.app/";
d3.svg(`${fileURL}PHMap.svg`).then((svgMap) => {
  d3.select("body").node().prepend(svgMap.documentElement);
  svg = d3.select("#PHMap");
  svg.attr("viewBox", [0, 0, original_width, original_height])
    .on("click", reset);
  prov = d3.selectAll(".province").on("click", clicked);
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

function reset() {
  prov.attr("class", "province")
    .each((a, b, c) => {
      const pId = c[b].id;
      const pdata = d3.select(`#${pId}`);
      const colors = ["#FC7E29", "#AF5315", "#E97000", "#C06500", "#E57325", "#C67317", "#CB802C", "#B33E00", "#D08C3F", "#D06922"];
      pdata.attr("fill", colors[b % 10])
    });
  d3.selectAll(".full-province").attr("display", "block").raise();
  d3.selectAll(".province-with-indcities").attr("display", "block");
  d3.selectAll(".municipality").attr("class", "municipality");
  d3.select("#data-pretitle").html("");
  d3.select("#data-title").html("PHILIPPINES");
  svg.transition()
    .duration(750)
    .attr("viewBox", [0, 0, original_width, original_height])
}

function clicked(event) {
  const provId = event.target.parentNode.id.substring(0, 3);
  const {
    x,
    y,
    width,
    height
  } = document.getElementById(provId).getBBox();
  event.stopPropagation();
  prov.attr("class", "province");
  d3.selectAll(".full-province").attr("display", "block").raise();
  d3.selectAll(".province-with-indcities").attr("display", "block");
  d3.select("#"+provId+"-00").attr("display", "none");
  d3.select("#"+provId+"-01").attr("display", "none");
  d3.select("#"+provId).attr("class", "selectedprovince").raise();
  d3.selectAll(".municipality").attr("class", "municipality");
  svg.transition().duration(750).attr("viewBox", [x-75, y-75, width+150, height+150]);
  if (event.target.parentNode.classList.contains('full-province')) {
    console.log(provData[provId])
    d3.select("#data-pretitle").html("");
    d3.select("#data-title").html(provData[provId].name.toUpperCase());
  } else if (event.target.parentNode.classList.contains('municipality')) {
    const mun = munData[event.target.parentNode.id];
    console.log(mun)
    d3.select("#data-pretitle").html(provData[mun.province].name.toUpperCase());
    d3.select("#data-title").html(
      (
        mun.official_name !== ""
        ? mun.official_name
        : mun.type !== "MUN"
        ? `${mun.name} City`
        : mun.name
      ).toUpperCase()
    );
    d3.select("#"+event.target.parentNode.id).attr("class", "municipality selectedmunicipality").raise();
  }
}