const $ = require('jquery');
const d3 = require('d3');
const componentMap = require('../static.json');


//BAD BAD GLOBALS
var Project = {
  name: "TESTI",
  components: [],
  wires: []
};

var componentCount = 0

//Debug
window.componentMap = componentMap
window.Project = Project
window.draggedElement = draggedElement

//Component Creation
function Component(name){
  return {
    id: name[0] + String(componentCount),
    type: name,
    orientation: 0,
    x: 0,
    y: 0,
    parameter: null
  }
}


// var selectedElement = null;
// var components = [];

//Right bar Code
//-----------------------------------------------

function getRotationDegrees(obj) {
  var translate = d3.transform(obj.attr("transform"));
  var angle = translate['rotate'];
  return (angle < 0) ? angle +=360 : angle;
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
  Project.components.forEach(function(e,i,a){
    if(e.id == draggedElement.attr("id")){
      delete Project.components[i]
    }
  })
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

function checkIfConnector(current) {
  var orientation = getRotationDegrees(current)/90;
  var centerCoor = d3.transform(draggedElement.attr("transform"))['translate'];

  if(orientation == 0) {
    var inCoor = [centerCoor[0] - 17, centerCoor[1]];
    var outCoor = [centerCoor[0] + 17, centerCoor[1]];
  }
  else if(orientation == 1) {
    var inCoor = [centerCoor[0], centerCoor[1] + 17];
    var outCoor = [centerCoor[0], centerCoor[1] - 17];
  }
  else if(orientation == 2) {
    var inCoor = [centerCoor[0] + 17, centerCoor[1]];
    var outCoor = [centerCoor[0] - 17, centerCoor[1]];
  }
  else {
    var inCoor = [centerCoor[0], centerCoor[1] - 17];
    var outCoor = [centerCoor[0], centerCoor[1] + 17];
  }
  var pos = d3.mouse(svg.node());

  if((Math.abs(pos[0] - 20 - inCoor[0]) < 6) && (Math.abs(pos[1] - 20 - inCoor[1]) < 6)) {
    console.log("Close in");
  }
  if((Math.abs(pos[0] - 20 - outCoor[0]) < 6) && (Math.abs(pos[1] - 20 - outCoor[1]) < 6)) {
    console.log("Close out");
  }

}

function dragstart() {
  console.log("dragstart", d3.event);
  var current = d3.select(this);
  if (current.attr("class") == "component") {
    checkIfConnector(current);
    draggedElement = current;
  } 
  // First time it is dragged, so create new object for component
  else {

    //Create new Component and save it in Project
    var newComponent = new Component(current.node().alt)
    Project.components.push(newComponent)

    //Increase Component Count
    componentCount++

    // Create new g element with image element inside
    draggedElement = canvas.append("g")
      .attr("class", "component")
      .attr("id", newComponent.id)
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
  console.log("dragmove", d3.event);

  // Get position relative to SVG 
  var pos = d3.mouse(svg.node());
  // Move element
  draggedElement
    .attr("transform", "translate(" + (pos[0] - 20) + "," + (pos[1] - 20) + ")" + "rotate("
     + getRotationDegrees(draggedElement) + ", " + 20 + "," + 20 +")")
}

function dragend() {
  console.log("dragend", d3.event);

  // Get position relative to SVG 
  var pos = d3.mouse(svg.node());
  // Update element position
  Project.components.forEach(function (e,i,a){
    if(e.id == draggedElement.attr("id")){
      e.x = pos[0] - 20
      e.y = pos[1] - 20
    }
  })
  //Dereference, can't for rotation
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
