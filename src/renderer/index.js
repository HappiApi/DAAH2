const $ = require('jquery');
const d3 = require('d3');
//const componentMap = require('../static.json');


// BAD BAD GLOBALS
var Project = {
  name: "TESTI",
  components: [],
  wires: []
};

var componentCount = 0
var draggedElement = null;
var draggedWire = null;

// Debug
// window.componentMap = componentMap
window.Project = Project
window.draggedElement = draggedElement

// Component Creation
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

// Transform functions
// -----------------------------------------------

function transformCoor(obj, x, y) {
  var angle = getRotationAngle(obj);
  if(angle == null) {
    angle = 0;
  }

  var bounds = canvasContainer.node().getBoundingClientRect();
  if(x < 0) { x = 20; }
  if(y < 0) { y = 20; }
  if(x > bounds.width) { x = bounds.width - 30; }
  if(y > bounds.height) { y = bounds.height - 20; }

  obj
    .attr("transform", "translate(" + (x - 20) + "," + (y - 20) + ")" + " rotate("
     + angle + ", " + 20 + "," + 20 +")");
}

function transformAngle(obj, angle) {
  angle = angle % 360;
  var translate = d3.transform(obj.attr("transform"))['translate'];
  obj.attr("transform", "translate(" + translate[0] + "," + translate[1] + ") rotate("
   + angle + ", " + 0 + "," + 0 +")");
}

function transform(obj, x, y, angle) {
  var bounds = canvasContainer.node().getBoundingClientRect();
  if(x < 0) { x = 20; }
  if(y < 0) { y = 20; }
  if(x > bounds.width) { x = bounds.width - 30; }
  if(y > bounds.height) { y = bounds.height - 20; }

  angle = angle % 360;
  obj
    .attr("transform", "translate(" + (x - 20) + "," + (y - 20) + ")" + " rotate("
     + angle + ", " + 20 + "," + 20 +")");
}


// Right bar Code
// -----------------------------------------------

function getRotationAngle(obj) {
  var translate = d3.transform(obj.attr("transform"));
  var angle = translate['rotate'];
  return (angle < 0) ? angle +=360 : angle;
}


function rotating(ev) {
  if($(ev.target).attr('id') == 'rotate-cw') {
    var rotation = ((getRotationAngle(draggedElement) + 90) % 360);
  }
  else {
    var rotation = ((getRotationAngle(draggedElement) - 90) % 360);
  }
  transformAngle(draggedElement, rotation);
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
// -----------------------------------------------
var canvasContainer = d3.select(".main");
var svg = canvasContainer.select("svg");
var canvas = svg.append("g")
    .attr("class", "canvas");

var drag = d3.behavior.drag();

var components = d3.selectAll(".drag-element")
    .call(drag);

function createWire(coor) {
  draggedWire = canvas.append("line")
    .attr("x1", coor[0])
    .attr("y1", coor[1])
    .attr("x2", coor[0])
    .attr("y2", coor[1])
    .attr("stroke", "black")
    .attr("stroke-width", "2");
}

function checkIfConnector(current, radius) {
  var orientation = getRotationAngle(current)/90;
  var centerCoor = d3.transform(current.attr("transform"))['translate'];
  centerCoor[0] += 20; centerCoor[1] += 20;

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
  var inDist = Math.sqrt(Math.pow(pos[0] - inCoor[0], 2) + Math.pow(pos[1] - inCoor[1], 2));
  var outDist = Math.sqrt(Math.pow(pos[0] - outCoor[0], 2) + Math.pow(pos[1] - outCoor[1], 2));

  // Wire from input of component
  if(inDist < radius) {
    return {type: "in", coordinates: inCoor, dist: inDist};
  }
  // Wire from output of component
  if(outDist < radius) {
    return {type: "in", coordinates: outCoor, dist: outDist};
  }
  return null;
}

function dragstart() {
  var current = d3.select(this);
  if (current.attr("class") == "component") {
    var connector = checkIfConnector(current, 6);
    if(connector != null) {
      createWire(connector['coordinates']);
    }
    draggedElement = current;
  }
  // First time it is dragged, so create new object for component
  else {

    // Create new Component and save it in Project
    var newComponent = new Component(current.node().alt)
    Project.components.push(newComponent)

    // Increase Component Count
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
  // Get position relative to SVG
  var pos = d3.mouse(svg.node());
  if(draggedWire) {
    draggedWire
      .attr("x2", pos[0])
      .attr("y2", pos[1]);
  }
  else {
    transformCoor(draggedElement, pos[0], pos[1]);
  }
}

function wiredragend() {
  var minDist = 1000;
  var closestConnector = null;
  var closestComponent = null;

  d3.selectAll('.component').each(function(d) {
    connector = checkIfConnector(d3.select(this), 20);
    if(connector != null && connector['dist'] < minDist) {
      minDist = connector.dist;
      closestConnector = connector;
      closestComponent = this;
    }
  });
  if(closestConnector == null) {
    draggedWire.remove();
  }
  else {
    draggedWire
      .attr('x2', closestConnector['coordinates'][0])
      .attr('y2', closestConnector['coordinates'][1]);
  }
  draggedWire = null;
}

function dragend() {
  // Get position relative to SVG
  var pos = d3.mouse(svg.node());
  // Update element position
  if(draggedWire != null) {
    wiredragend();
  }
  else {
    Project.components.forEach(function (e,i,a) {
      if(e.id == draggedElement.attr("id")){
        e.x = pos[0] - 20
        e.y = pos[1] - 20
      }
    });
  }
}


function resize() {
  var bounds = canvasContainer.node().getBoundingClientRect();
  svg.attr("width", bounds.width);
  svg.attr("height", bounds.height);
}

resize();

$(window).resize(resize);
drag.on("dragstart", dragstart);
drag.on("drag", dragmove);
drag.on("dragend", dragend);
