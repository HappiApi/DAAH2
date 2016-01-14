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
var draggedElementWireId = null; // Used for wires to see if it was connected to in/out
var draggedWire = null;
var selectedWire = null;

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
    parameter: 0
  };
}

function Wire(id1, id2) {
  return {
    connects: [id1, id2]
  };
}

// Gets component object from d3 object
function getComponentObject(d3Object) {
  for(var i = 0; i < Project.components.length; i++) {
    if(Project.components[i] != null &&
      Project.components[i].id == d3Object.attr("id")) {
      return Project.components[i];
    }
  }
  return null;
}

function getComponentById(id) {
  for(var i = 0; i < Project.components.length; i++) {
    if(Project.components[i].id == id) {
      return Project.components[i];
    }
  }
  return null;
}

function getWireObject(d3Object) {
  for(var i = 0; i < Project.wires.length; i++) {
    if(Project.wires[i].id == d3Object.attr("id")) {
      return Projects.wires[i];
    }
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
  if(x > bounds.width) { x = bounds.width - 20; }
  if(y > bounds.height) { y = bounds.height - 20; }

  obj
    .attr("transform", "translate(" + (x - 20) + "," + (y - 20) + ")" + " rotate("
     + angle + ", " + 20 + "," + 20 +")");
}

function transformAngle(obj, angle) {
  // Find current X and Y
  var translate = d3.transform(obj.attr("transform"))['translate'];

  obj.attr("transform", "translate(" + translate[0] + "," + translate[1] + ") rotate("
   + angle + ", " + 0 + "," + 0 +")");

   //Move all wires connect to obj when rotating
   var inOutCoor = getInOutCoor(draggedElement);
   var connectedWires = findConnectedWires();
   moveConnectedWires(connectedWires, inOutCoor);
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
  if(obj != null) {
    var translate = d3.transform(obj.attr("transform"));
    var angle = translate['rotate'];
    return (angle < 0) ? angle +=360 : angle;
  }
}


function rotating(ev) {
  if($(ev.target).attr('id') == 'rotate-cw') {
    var rotation = ((getRotationAngle(draggedElement) + 90) % 360);
  }
  else {
    var rotation = ((getRotationAngle(draggedElement) - 90) % 360);
  }
  transformAngle(draggedElement, rotation);
  //Sets orientation of Component Object ONE LINER BITCHES
  getComponentObject(draggedElement).orientation = (rotation/90);
}

function deleteElement(ev) {
  if(selectedWire != null) {
    for(var i = 0; i < Project.wires.length; i++) {
      var id = Project.wires[i]['connects'][0] + '-' + Project.wires[i]['connects'][1];
      if(id == selectedWire.attr("id")) {
        Project.components.splice(i, 1);
      }
    }
    selectedWire.remove();
    selectedWire = null;
  }
  else {
    deleteConnectedWires();
    Project.components.forEach(function(e,i,a) {
      if(e.id == draggedElement.attr("id")) {
        Project.components.splice(i, 1);
      }
    });
    $(draggedElement.node()).remove();
    draggedElement = null;
  }
  generateRightBar();
}

function displayWire() {
  draggedElement = null;
  selectedWire = d3.select(this);
  generateRightBar();
}

function generateRightBar() {
  var container = $('#component-specific');
  container.empty();
  if(draggedElement != null) {
    var component = getComponentObject(draggedElement);
    if(component != null) {
      container.append('<h1>' + component['type'] + '</h1>');

      if(component['type'] == 'resistor') {
        var form = $('<form action="">Resistance:<input id="setParam" type="number" value="' + component['parameter'] +
         '" name="resistance">kΩ');
        container.append(form);
        form.on("input", setParam)

      }
      else if(component['type'] == 'cell') {
        var form = $('<form action="">Volts:<input id="setParam" type="number" value="' + component['parameter'] +
        '" name="resistance">V');
        container.append(form)
        form.on("input", setParam)

      }
      else if(component['type'] == 'switch') {
        var button = $('<button>Close</button>');
        container.append(button);
      }
      else if(component['type'] == 'ammeter') {
        var result = 10;
        var measurement = $('<div><b>Result:</b></div><div id="measurement-result">' + component['parameter']
         + ' kΩ</div>');
        container.append(measurement);
      }
      else if(component['type'] == 'voltmeter') {
        var result = 10;
        var measurement = $('<div><b>Result:</b></div><div id="measurement-result">' + component['parameter']
         + ' V</div>');
        container.append(measurement);
      }
    }
  }
  else if(selectedWire != null) {
    container.append('<h1>Wire</h1>');
  }
}

function setParam(){
  getComponentObject(draggedElement).parameter = parseInt($(this).children("#setParam").val())
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

// D3 Wire Drawing Code
// -----------------------------------------------

//Takes x,y draws line
function createWire(coor) {
  draggedWire = canvas.append("line")
    .attr("x1", coor[0])
    .attr("y1", coor[1])
    .attr("x2", coor[0])
    .attr("y2", coor[1])
    .attr("stroke", "black")
    .attr("stroke-width", "2")
    .attr("class", "wire")
    .on("click", displayWire);
}

// Gets the coordinates of in/out of d3 objects
function getInOutCoor(obj) {
  var orientation = getRotationAngle(obj)/90;
  var centerCoor = d3.transform(obj.attr("transform"))['translate'];
  centerCoor[0] += 20; centerCoor[1] += 20;

  if(orientation == 0) {
    var inCoor = [centerCoor[0] - 17, centerCoor[1]];
    var outCoor = [centerCoor[0] + 17, centerCoor[1]];
  }
  else if(orientation == 1) {
    var inCoor = [centerCoor[0] - 40, centerCoor[1] + 17];
    var outCoor = [centerCoor[0] - 40, centerCoor[1] - 17];
  }
  else if(orientation == 2) {
    var inCoor = [centerCoor[0] - 40 + 17, centerCoor[1] - 40];
    var outCoor = [centerCoor[0] - 40 - 17, centerCoor[1] - 40];
  }
  else {
    var inCoor = [centerCoor[0], centerCoor[1] - 40 - 17];
    var outCoor = [centerCoor[0], centerCoor[1] - 40 + 17];
  }

  return [inCoor, outCoor];
}

// Checks if the current mouse position is close to a connector/terminal
// return either null for no or object contain terminal info
function checkIfConnector(obj, radius) {
  var inOutCoor = getInOutCoor(obj);
  var inCoor = inOutCoor[0];
  var outCoor = inOutCoor[1];

  var pos = d3.mouse(svg.node());
  var inDist = Math.sqrt(Math.pow(pos[0] - inCoor[0], 2) + Math.pow(pos[1] - inCoor[1], 2));
  var outDist = Math.sqrt(Math.pow(pos[0] - outCoor[0], 2) + Math.pow(pos[1] - outCoor[1], 2));

  // Wire from input of component
  if(inDist < radius) {
    return {type: "in", coordinates: inCoor, dist: inDist};
  }
  // Wire from output of component
  if(outDist < radius) {
    return {type: "out", coordinates: outCoor, dist: outDist};
  }
  return null;
}

// Moves the connected wires in the UI
function moveConnectedWires(connectedWires, inOutCoor) {
  //If the first part of the wire (x1, y1) is connected
  for(var j = 0; j < connectedWires[0].length; j++) {
    if(connectedWires[0][j]['connects'][0].split('-')[1] == 'in') {
      var position = inOutCoor[0];
    }
    else {
      var position = inOutCoor[1];
    }
    d3.select('#' + connectedWires[0][j]['connects'][0] + '-' + connectedWires[0][j]['connects'][1])
      .attr('x1', position[0])
      .attr('y1', position[1]);
  }
  //If the second part of the wire (x2, y2) is connected
  for(var j = 0; j < connectedWires[1].length; j++) {
    if(connectedWires[1][j]['connects'][1].split('-')[1] == 'in') {
      var position = inOutCoor[0];
    }
    else {
      var position = inOutCoor[1];
    }
    d3.select('#' + connectedWires[1][j]['connects'][0] + '-' + connectedWires[1][j]['connects'][1])
      .attr('x2', position[0])
      .attr('y2', position[1]);
  }
}

// Finds all of the wires connected to draggedElement
function findConnectedWires() {
  var component = getComponentObject(draggedElement);

  var connectedWires = [[], []];
  for(var i = 0; i < Project.wires.length; i++) {
    if(Project.wires[i]['connects'][0].split('-')[0] == component['id']) {
      connectedWires[0].push(Project.wires[i]);
    }
    else if(Project.wires[i]['connects'][1].split('-')[0] == component['id']) {
      connectedWires[1].push(Project.wires[i]);
    }
  }
  return connectedWires
}

// Deletes the wire object
function deleteWire(id) {
  Project.wires.forEach(function(e,i,a) {
    if(e['connects'][0] + '-' + e['connects'][1] == id) {
      Project.wires.splice(i, 1);
    }
  });
}

// DELETE ALL THE WIRES GIF
function deleteConnectedWires() {
  var connectedWires = findConnectedWires();
  for(var i = 0; i < connectedWires.length; i++) {
    for(var j = 0; j < connectedWires[i].length; j++) {
      var id = connectedWires[i][j]['connects'][0] + '-' + connectedWires[i][j]['connects'][1];
      d3.select('#' + id).remove();
      deleteWire(id);
    }
  }
}

function checkIfWireExists(components) {
  for(var i = 0; i < Project.wires.length; i++) {
    if(Project.wires[i]['connects'][0].split('-')[0] == components[0]['id']
      && Project.wires[i]['connects'][1].split('-')[0] == components[1]['id']) {
        return false;
    }
    else if(Project.wires[i]['connects'][0].split('-')[0] == components[1]['id']
      && Project.wires[i]['connects'][1].split('-')[0] == components[0]['id']) {
      return false;
    }
  }
  return true;
}

// Checks if it is a valid wire by checking if the wire already
// exists within the data of the wire connects the same component
function checkIfValidWire(closestComponent) {
  var components = [getComponentObject(draggedElement),
    getComponentObject(d3.select(closestComponent))];
    if(components[0]['id'] == components[1]['id']) {
      return false;
    }
    return checkIfWireExists(components);
}

// Checks surroundings for components, then snaps to closest component
function wiredragend() {
  var minDist = 1000;
  var closestConnector = null;
  var closestComponent = null;

  d3.selectAll('.component').each(function(d) {
    var connector = checkIfConnector(d3.select(this), 20);
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
    if(checkIfValidWire(closestComponent)) {
      addWire(closestComponent, closestConnector);
      draggedWire
        .attr('x2', closestConnector['coordinates'][0])
        .attr('y2', closestConnector['coordinates'][1]);
    }
    else {
      draggedWire.remove();
    }

  }
  draggedWire = null;
}

// Adds The wire to data
function addWire(closestComponent, closestConnector) {
  var components = [getComponentObject(draggedElement),
    getComponentObject(d3.select(closestComponent))];
    var wire = Wire(components[0]['id'] + "-" + draggedElementWireId, components[1]['id'] + "-" + closestConnector['type']);
    Project.wires.push(wire);

    draggedWire.attr('id', wire['connects'][0] + '-' + wire['connects'][1]);
}


// D3 Dragging Code
// -----------------------------------------------

function dragstart() {
  var current = d3.select(this);
  if (current.attr("class") == "component") {
    var connector = checkIfConnector(current, 6);
    if(connector != null) {
      createWire(connector['coordinates']);
      draggedElementWireId = connector['type'];
    }
    draggedElement = current;
  }
  // First time it is dragged, so create new object for component
  else {
    // Create new Component and save it in Project
    var newComponent = new Component(current.node().alt)
    Project.components.push(newComponent)
    componentCount++
    draggedElement = canvas.append("g")
      .attr("class", "component")
      .attr("id", newComponent.id)
      .attr("transform", "translate(" + -40 + "," + -40 + ")")
      .call(drag);
    draggedElement.append("image")
      .attr("width", 40)
      .attr("height", 40)
      .attr("xlink:href", current.node().src);
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
  // Make sure that a wire is not selected
  else {
    transformCoor(draggedElement, pos[0], pos[1]);
    var inOutCoor = getInOutCoor(draggedElement);
    var connectedWires = findConnectedWires();
    moveConnectedWires(connectedWires, inOutCoor);
  }
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

// Rendering project from data code
// -----------------------------------------------

function emptyProject() {
  svg.selectAll('*').remove();
  canvas = svg.append("g")
        .attr("class", "canvas");
}

function renderComponents(components) {
  let componentLength = components.length;
  for(var i = 0; i < componentLength; i++) {
    var element = canvas.append("g")
      .attr("class", "component")
      .attr("id", components[i]['id'])
      .call(drag);

    transform(element, components[i]['x'], components[i]['y'], components[i]['orientation'] * 90);

    element.append("image")
      .attr("width", 40)
      .attr("height", 40)
      .attr("xlink:href", "../static/images/" + components[i]['type'] + ".png");
  }
}

function getWireCoordinates(wire) {
  var ids = [wire['connects'][0].split('-')[0], wire['connects'][1].split('-')[0]];
  var componentObjects = [d3.select('#' + ids[0]), d3.select('#' + ids[1])];
  var inOutCoor = [getInOutCoor(componentObjects[0]), getInOutCoor(componentObjects[1])];
  return [(wire['connects'][0].split('-')[1] == 'in') ? inOutCoor[0][0] : inOutCoor[0][1],
    (wire['connects'][1].split('-')[1] == 'in') ? inOutCoor[1][0] : inOutCoor[1][1]]
}

function renderWires(wires) {
  let wiresLength = wires.length;
  for(var i = 0; i < wiresLength; i++) {
    var coor = getWireCoordinates(wires[i]);
    var wire = canvas.append("line")
      .attr("x1", coor[0][0])
      .attr("y1", coor[0][1])
      .attr("x2", coor[1][0])
      .attr("y2", coor[1][1])
      .attr("stroke", "black")
      .attr("stroke-width", "2")
      .attr("class", "wire")
      .on("click", displayWire);
  }
}

function renderProject(Project) {
  emptyProject();
  renderComponents(Project.components);
  renderWires(Project.wires);
}

// Scales the g element such that it can fit in the header
function scaleSVG(canvas) {
    canvas.attr("transform", "scale(0.3)");
}
