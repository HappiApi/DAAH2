const $ = require('jquery');
const d3 = require('d3');

var selectedElement = null;
var components = [];

//Right bar Code
//-----------------------------------------------

function getRotationDegrees(obj) {
  var translate = d3.transform(obj.attr("transform"));
  var angle = translate['rotate'];
  return angle;
}

function rotating(ev) {
  if($(ev.target).attr('id') == 'rotate-cw') {
    var rotation = ((getRotationDegrees(draggedElement) + 90) % 360);
  }
  else {
    var rotation = ((getRotationDegrees(draggedElement) - 90) % 360);
  }
  var translate = d3.transform(draggedElement.attr("transform"))['translate'];

  draggedElement.attr("transform", "translate(" + translate[0] + "," + translate[1] + ") rotate("
   + rotation + ", " + 0 + "," + 0 +")");
}

function deleteElement(ev) {
  $(draggedElement.node()).remove();
  draggedElement = null;
  generateRightBar();
}

function generateRightBar() {
  var container = $('#component-specific');
  container.empty();
  if(draggedElement != null) {
    container.append('<h1>' + 'Name' + '</h1>');

    //if(component.name == 'resistor') {
      //var form = $('<form action="">Resistance:<input type="number" name="resistance">kΩ');
      //container.append(form);
    //}
    //else if(component.name == 'cell') {
      //var form = $('<form action="">Volts:<input type="number" name="resistance">V');
      //container.append(form);
    //}
    //else if(container.name == 'gate') {
      //var button = $('<button>Close</button>');
      //container.append(button);
    //}
    //else if(container.name == 'ammeter') {
      //var result = 10;
      //var measurement = $('<div><b>Result:</b></div><div id="measurement-result">' + result + ' kΩ</div>');
      //container.append(measurement);
    //}
    //else if(container.name == 'voltmeter') {
      //var result = 10;
      //var measurement = $('<div><b>Result:</b></div><div id="measurement-result">' + result + ' V</div>');
      //container.append(measurement);
    //}
  }
}

$('#rotate-acw').on('click', rotating);
$('#rotate-cw').on('click', rotating);
$('#delete-button').on('click', deleteElement)

// D3 SVG Code
var canvasContainer = d3.select(".main");
var svg = canvasContainer.select("svg");
var canvas = svg.append("g")
    .attr("class", "canvas");

var draggedElement = null;

var drag = d3.behavior.drag();

var components = d3.selectAll(".drag-element")
    .call(drag);

function dragstart() {
  console.log("dragstart", d3.event);
  var current = d3.select(this);
  if (current.attr("class") == "component") {
    draggedElement = current;
  } else {
    draggedElement = canvas.append("g")
      .attr("class", "component")
      .attr("transform", "translate(" + -40 + "," + -40 + ")")
      .call(drag);
    draggedElement.append("image")
      .attr("width", 40)
      .attr("height", 40)
      .attr("xlink:href", current.node().src)
  }
  generateRightBar();
}

function dragmove() {
  //console.log("dragmove", d3.event);
  var pos = d3.mouse(svg.node());
  draggedElement
    .attr("transform", "translate(" + (pos[0] - 20) + "," + (pos[1] - 20) + ")" + "rotate("
     + getRotationDegrees(draggedElement) + ", " + 20 + "," + 20 +")")
}

function dragend() {
  //console.log("dragend", d3.event);
  //draggedElement = null;
}


function resize() {
  var bounds = canvasContainer.node().getBoundingClientRect();
  svg.attr("width", bounds.width);
  svg.attr("height", bounds.height);
  console.log(bounds);
}

resize();

$(window).resize(resize);
drag.on("dragstart", dragstart);
drag.on("drag", dragmove);
drag.on("dragend", dragend);
