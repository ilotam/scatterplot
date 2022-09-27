const d3 = require('d3');
const dscc = require('@google/dscc');
const local = require('./localMessage.js');

// change this to 'true' for local development
// change this to 'false' before deploying
export const LOCAL = false;


// parse the style value
const styleVal = (message, styleId) => {
    if (typeof message.style[styleId].defaultValue === "object") {

      return message.style[styleId].value.color !== undefined
        ? message.style[styleId].value.color
        : message.style[styleId].defaultValue.color;
    }
    return message.style[styleId].value !== undefined
      ? message.style[styleId].value
      : message.style[styleId].defaultValue;
};
  

const drawViz = message => {
  
    // set the dimensions and margins of the graph
    let margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 460 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

    if (document.querySelector("svg")) {
        //console.log("hello");
        let oldSvg = document.querySelector("svg");
        oldSvg.parentNode.removeChild(oldSvg);
      }
    // append the svg object to the body of the page
    let svg = d3.select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    let tblList = message.tables.DEFAULT;
    let data = tblList.map(row => {
        return {
            GrLivArea: row["dimension"][0],   
            SalePrice:  row["dimension"][1]
        }  
    });

    // Add X axis
    let x = d3.scaleLinear()
    .domain([0, 3000])
    .range([ 0, width ]);
    svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

    // Add Y axis
    let y = d3.scaleLinear()
    .domain([0, 400000])
    .range([ height, 0]);
    svg.append("g")
    .call(d3.axisLeft(y));

    // Add a tooltip div. Here I define the general feature of the tooltip: stuff that do not depend on the data point.
    // Its opacity is set to 0: we don't see it by default.
    let tooltip = d3.select("body")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px")

    // A function that change this tooltip when the user hover a point.
    // Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
    let mouseover = function(d) {
    tooltip
    .style("opacity", 1)
    }

    let mousemove = function(d) {
    tooltip
    .data(data)
    .html("The exact value of<br>the area is: " + event.path[0].__data__.GrLivArea)
    .style("left", (d3.pointer(event)[0]+90) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
    .style("top", (d3.pointer(event)[1]) + "px")
    }

    // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
    let mouseleave = function(d) {
    tooltip
    .transition()
    .duration(200)
    .style("opacity", 0)
    }

    // Add dots
    svg.append('g')
    .selectAll("dot")
    .data(data) 
    .enter()
    .append("circle")
    .attr("cx", function (d) { return x(d.GrLivArea); } )
    .attr("cy", function (d) { return y(d.SalePrice); } )
    .attr("r", 7)
    .style("fill", "#69b3a2")
    .style("opacity", 0.3)
    .style("stroke", "white")
    .on("mouseover", mouseover )
    .on("mousemove", mousemove )
    .on("mouseleave", mouseleave )

};
// renders locally
if (LOCAL) {
  drawViz(local.message);
} else {
  dscc.subscribeToData(drawViz, {transform: dscc.objectTransform});
}