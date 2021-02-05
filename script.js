
const width = 800;
const height = 1000;
const original_width = 4751;
const original_height = 6104.2;

let svg, prov;

const svgURL = "PHMap.svg";
// const svgURL = "https://ph-map-v2.vercel.app/PHMap.svg";
d3.svg(svgURL).then((svgMap) => {
  d3.select("body").node().prepend(svgMap.documentElement);
  svg = d3.select("#PHMap");
  svg.attr("viewBox", [0, 0, original_width, original_height])
    .on("click", reset);
  prov = d3.selectAll(".province").on("click", clicked);
  reset();
});


function reset() {
  prov.attr("class", "province")
    .each((a, b, c) => {
      const pId = c[b].id;
      const pdata = d3.select(`#${pId}`);
      const colors = ["#FC7E29", "#AF5315", "#E97000", "#C06500", "#E57325", "#C67317", "#CB802C", "#B33E00", "#D08C3F", "#D06922"];
      pdata.attr("fill", colors[b % 10])
    });
  d3.selectAll(".full-province").attr("display", "block");
  d3.selectAll(".province-with-indcities").attr("display", "block");
  svg.transition()
    .duration(750)
    .attr("viewBox", [0, 0, original_width, original_height])
}

function clicked(event) {
  console.log(event.target.parentNode.id)
  const provId = event.target.parentNode.id.substring(0, 3);
  const {
    x,
    y,
    width,
    height
  } = document.getElementById(provId).getBBox();
  event.stopPropagation();
  prov.attr("class", "province");
  d3.selectAll(".full-province").attr("display", "block");
  d3.selectAll(".province-with-indcities").attr("display", "block");
  d3.select("#"+provId+"-00").attr("display", "none");
  d3.select("#"+provId+"-01").attr("display", "none");
  d3.select("#"+provId).attr("class", "selectedprovince").raise();
  svg.transition().duration(750).attr("viewBox", [x-75, y-75, width+150, height+150]);
}

reset();