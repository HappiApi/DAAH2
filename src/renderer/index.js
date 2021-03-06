// All Them Dependencies
const $ = require('jquery');
const d3 = require('d3');

import solve from "./solver";

class ProjectFactory {
  constructor(name=generateRandom(), components=[], wires=[]){
    this.name = name;
    this.components = components;
    this.wires = wires;
  }

  renderComponents() {
  let componentLength = this.components.length;
    for(var i = 0; i < componentLength; i++) {
      var element = canvas.append("g")
        .attr("class", "component")
        .attr("id", this.components[i]['id'])
        .call(drag);

      transform(element, this.components[i]['x'], this.components[i]['y'], this.components[i]['orientation'] * 90);

      element.append("image")
        .attr("width", 40)
        .attr("height", 40)
        .attr("xlink:href", "../static/images/" + this.components[i]['type'] + ".png");
    }
  }

  // Not working yet
  renderWires() {
    let wiresLength = this.wires.length;
    for(var i = 0; i < wiresLength; i++) {
      var coor = getWireCoordinates(this.wires[i]);
      var wire = canvas.append("line")
        .attr("x1", coor[0][0])
        .attr("y1", coor[0][1])
        .attr("x2", coor[1][0])
        .attr("y2", coor[1][1])
        .attr("stroke", "black")
        .attr("stroke-width", "2")
        .attr("class", "wire")
        .attr("id", this.wires[i]['connects'][0] + '-' + this.wires[i]['connects'][1])
        .on("click", displayWire);
    }
  }

  getComponentObject(d3Object) {
    for(var i = 0; i < this.components.length; i++) {
      if(this.components[i] != null &&
        this.components[i].id == d3Object.attr("id")) {
        return this.components[i];
      }
    }
    return null;
  }

  getComponentById(id) {
    for(var i = 0; i < this.components.length; i++) {
      if(this.components[i].id == id) {
        return this.components[i];
      }
    }
    return null;
  }

  getWireObject(d3Object) {
    for(var i = 0; i < this.wires.length; i++) {
      if(this.wires[i].id == d3Object.attr("id")) {
        return this.wires[i];
      }
    }
  }

}

class Component{
  constructor(name, parameter=0) {
    this.id = name[0] + String(componentCount);
    this.type = name;
    this.orientation = 0;
    this.x = 0;
    this.y = 0;
    this.resistance = 0;
    this.current = 0;
    if(name == "resistor") {
      this.parameter = 1;
    }
    else if(name == "cell") {
      this.parameter = 9;
    }
    else {
    this.parameter = parameter;
    }
  }
}

class Wire{
  constructor(idOne, idTwo) {
    this.connects = [idOne, idTwo];
  }
}

// GLOBAL WARMING
var Project = new ProjectFactory()
var storage = localStorage
var projectID = null;
var componentCount = 0
var draggedElement = null;
var draggedElementWireId = null; // Used for wires to see if it was connected to in/out
var draggedWire = null;
var selectedWire = null;

// Gets component object from d3 object
// function getComponentObject(d3Object) {
//   for(var i = 0; i < Project.components.length; i++) {
//     if(Project.components[i] != null &&
//       Project.components[i].id == d3Object.attr("id")) {
//       return Project.components[i];
//     }
//   }
//   return null;
// }

// function getComponentById(id) {
//   for(var i = 0; i < Project.components.length; i++) {
//     if(Project.components[i].id == id) {
//       return Project.components[i];
//     }
//   }
//   return null;
// }

// function getWireObject(d3Object) {
//   for(var i = 0; i < Project.wires.length; i++) {
//     if(Project.wires[i].id == d3Object.attr("id")) {
//       return Projects.wires[i];
//     }
//   }
// }

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
  //Sets orientation of Component Object
  Project.getComponentObject(draggedElement).orientation = (rotation/90);
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
    var component = Project.getComponentObject(draggedElement);
    if(component != null) {

      if(component['type'] == 'resistor') {
      container.append('<h1>' + component['type'] + '</h1>');
        var form = $('<form action="">Resistance:<input id="setParam" type="number" value="' + component['parameter'] +
         '" name="resistance">kΩ');
        container.append(form);
        form.on("input", setParam)

      }
      else if(component['type'] == 'cell') {
        container.append('<h1>' + component['type'] + '</h1>');
        var form = $('<form action="">Volts:<input id="setParam" type="number" value="' + component['parameter'] +
        '" name="resistance">V');
        container.append(form)
        form.on("input", setParam)

      }
      else if(component['type'] == 'switch') {
        container.append('<h1>' + component['type'] + '</h1>');
        var button = $('<button>Close</button>');
        container.append(button);
      }
      else if(component['type'] == 'ammeter') {
        container.append('<h1>' + component['type'] + '</h1>');
        var result = 10;
        var measurement = $('<div><b>Result:</b></div><div id="measurement-result">' + component['parameter']
         + ' kΩ</div>');
        container.append(measurement);
      }
      else if(component['type'] == 'voltmeter') {
        container.append('<h1>' + 'Unimeter' + '</h1>');
        var result = 10;
        var measurement = $('<div><b>Voltage:</b></div><div id="measurement-result">' + component['parameter']
         + ' V</div>');
        var measurement2 = $('<div><b>Resistance:</b></div><div id="measurement-result2">' + component['resistance']
          + ' Ω</div>');
        var measurement3 = $('<div><b>Current:</b></div><div id="measurement-result3">' + component['current']
           + ' amps</div>');
        container.append(measurement).append(measurement2).append(measurement3);
      }
    }
  }
  else if(selectedWire != null) {
    container.append('<h1>Wire</h1>');
  }
}

function setParam(){
  Project.getComponentObject(draggedElement).parameter = parseInt($(this).children("#setParam").val());
  updateMeters();
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
  var component = Project.getComponentObject(draggedElement);

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

// NOT WORKING, NO TIME
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
  var components = [Project.getComponentObject(draggedElement),
    Project.getComponentObject(d3.select(closestComponent))];
    if(components[0]['id'] == components[1]['id']) {
      return false;
    }
    //return checkIfWireExists(components);
    return true;
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
  var components = [Project.getComponentObject(draggedElement),
    Project.getComponentObject(d3.select(closestComponent))];
    var wire = new Wire(components[0]['id'] + "-" + draggedElementWireId, components[1]['id'] + "-" + closestConnector['type']);
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
  updateMeters();
}

function updateMeters() {
  let meters = solve(Project);
  if (meters != null) {
    meters.forEach(({ id, voltage, current, resistance }) => {
      if (!isNaN(voltage)) {
        let voltmeter = Project.getComponentById(id);
        voltmeter.parameter = voltage;
        voltmeter.current = current;
        voltmeter.resistance = resistance;
      }
    $(".circuit-status").hide()
    });
  } else {
    $(".circuit-status").show()
  }

  generateRightBar();
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

// function renderComponents(components) {
//   let componentLength = components.length;
//   for(var i = 0; i < componentLength; i++) {
//     var element = canvas.append("g")
//       .attr("class", "component")
//       .attr("id", components[i]['id'])
//       .call(drag);

//     transform(element, components[i]['x'], components[i]['y'], components[i]['orientation'] * 90);

//     element.append("image")
//       .attr("width", 40)
//       .attr("height", 40)
//       .attr("xlink:href", "../static/images/" + components[i]['type'] + ".png");
//   }
// }

function getWireCoordinates(wire) {
  var ids = [wire['connects'][0].split('-')[0], wire['connects'][1].split('-')[0]];
  var componentObjects = [d3.select('#' + ids[0]), d3.select('#' + ids[1])];
  var inOutCoor = [getInOutCoor(componentObjects[0]), getInOutCoor(componentObjects[1])];
  return [(wire['connects'][0].split('-')[1] == 'in') ? inOutCoor[0][0] : inOutCoor[0][1],
    (wire['connects'][1].split('-')[1] == 'in') ? inOutCoor[1][0] : inOutCoor[1][1]]
}

// function renderWires(wires) {
//   let wiresLength = wires.length;
//   for(var i = 0; i < wiresLength; i++) {
//     var coor = getWireCoordinates(wires[i]);
//     var wire = canvas.append("line")
//       .attr("x1", coor[0][0])
//       .attr("y1", coor[0][1])
//       .attr("x2", coor[1][0])
//       .attr("y2", coor[1][1])
//       .attr("stroke", "black")
//       .attr("stroke-width", "2")
//       .attr("class", "wire")
//       .attr("id", wires[i]['connects'][0] + '-' + wires[i]['connects'][1])
//       .on("click", displayWire);
//   }
// }

function renderProject(Project) {
  emptyProject();
  Project.renderComponents();
  Project.renderWires();
}


// Render Small grid functions
// -----------------------------------------------

function emptySmallProject(canvas) {
  canvas.selectAll('*').remove();
}

function renderSmallComponents(components, canvas) {
  let componentLength = components.length;
  let topLeftCoor = [1000, 1000];
  for(var i = 0; i < componentLength; i++) {
    var element = canvas.append("g")
      .attr("class", "small-component")
      .attr("id", Project.id + components[i]['id']);

    transform(element, components[i]['x'], components[i]['y'], components[i]['orientation'] * 90);

    element.append("image")
      .attr("width", 40)
      .attr("height", 40)
      .attr("xlink:href", "../static/images/" + components[i]['type'] + ".png");

    if(components[i]['x'] < topLeftCoor[0]) { topLeftCoor[0] = components[i]['x']; }
    if(components[i]['y'] < topLeftCoor[1]) { topLeftCoor[1] = components[i]['y']; }
  }
  return topLeftCoor;
}

function getSmallWireCoordinates(wire) {
  var ids = [wire['connects'][0].split('-')[0], wire['connects'][1].split('-')[0]];
  var componentObjects = [d3.select('#' + Project.id + ids[0]), d3.select('#' + Project.id + ids[1])];
  var inOutCoor = [getInOutCoor(componentObjects[0]), getInOutCoor(componentObjects[1])];
  return [(wire['connects'][0].split('-')[1] == 'in') ? inOutCoor[0][0] : inOutCoor[0][1],
    (wire['connects'][1].split('-')[1] == 'in') ? inOutCoor[1][0] : inOutCoor[1][1]]
}

function renderSmallWires(wires, canvas) {
  let wiresLength = wires.length;
  for(var i = 0; i < wiresLength; i++) {
    var coor = getSmallWireCoordinates(wires[i]);
    var wire = canvas.append("line")
      .attr("x1", coor[0][0])
      .attr("y1", coor[0][1])
      .attr("x2", coor[1][0])
      .attr("y2", coor[1][1])
      .attr("stroke", "black")
      .attr("stroke-width", "2")
      .attr("class", "small-wire");
  }
}

function renderSmallSVG(Project, canvas) {
  emptySmallProject(canvas);
  var topLeftCoor = renderSmallComponents(Project.components, canvas);
  renderSmallWires(Project.wires, canvas);
  return topLeftCoor;
}

// Storage Visuals
// -----------------------------------------------

function drawingSmallSVG(smallCanvas) {
  var topLeftCoor = renderSmallSVG(Project, smallCanvas);
  var bounds = canvas.node().getBoundingClientRect();
  var minimum = 150.0 / bounds.width;
  var heightBound = 100.0 / bounds.height;

  if(heightBound < minimum) { minimum = heightBound; }
  if(minimum == Infinity) { minimum = 0.5; }

  smallCanvas
    .attr("transform",  "scale(" + minimum + ")" + "translate(" + (0) + ", " +
    (0) + ")");

  var clientRect = [smallCanvas.node().getBoundingClientRect(),
    $(smallCanvas.node()).parent()[0].getBoundingClientRect()];
  var bounds = [-(Math.abs(clientRect[0].left - clientRect[1].left)),
    -(Math.abs(clientRect[0].top - clientRect[1].top))];


  smallCanvas
    .attr("transform",  "scale(" + 0.5 + ")" + "translate(" + (bounds[0]) + ", " +
    (bounds[1]) + ")");
}

function createNewProjectHead(projectID) {
  var html = $("<div/>")
    .addClass("project")
    .attr("id", projectID)

  $('#projects').append(html);

  var smallSvg = d3.select(html[0])
    .append("svg")
    .attr("width", 150)
    .attr("height", 100);

  return smallSvg.append("g")
    .attr('class', 'small-canvas');
}

// Storage
// -----------------------------------------------

// function new ProjectFactory() {
//   return  {
//             name: generateRandom(),
//             components: [],
//             wires: []
//           };
// }

function loadProject(projectID){
  // Get project JSON Object from storage
  var project = JSON.parse(storage.getItem(projectID));
  // Make Project Class
  Project = new ProjectFactory(project.name, project.components, project.wires);
  renderProject(Project);
}

function saveProject(projectID){
  if(storage.getItem(projectID) == null) {
    var smallCanvas = createNewProjectHead(projectID);
  }
  else {
    var smallCanvas = d3.select(document.getElementById(projectID))
      .select('svg')
      .select('.small-canvas');
  }
  drawingSmallSVG(smallCanvas);
  storage.setItem(projectID, JSON.stringify(Project));
}

function createProject(){
  Project = new ProjectFactory();
  emptyProject();
  saveProject(Project.name);
}

function deleteProject(projectID){
  $("#"+projectID).remove();
  storage.removeItem(projectID);

  // Remove visual elements
  emptyProject();
  Project = new ProjectFactory();
}

function generateRandom(){
  //src : http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = crypto.getRandomValues(new Uint8Array(1))[0]%16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
          });
}

function populateProjects(){
  for(var i=0; i<storage.length; i++){
    var project = JSON.parse(storage.getItem(storage.key(i)));
    Project = project;
    if(Project.components == null) { continue; }
    var smallCanvas = createNewProjectHead(storage.key(i));
    drawingSmallSVG(smallCanvas);
    storage.setItem(projectID, JSON.stringify(storage.key(i)));
  }
  Project = new ProjectFactory();
}

$("#save-project").on("click", function(){
  saveProject(Project.name);
});

$("#delete-project").on("click", function(){
  deleteProject(Project.name);
});

$(".add_project").on("click", function(){
  createProject()
})
$("#projects").on("click", ".project", function(){
  loadProject(this.id)
})

window.onload = populateProjects
window.Project = function(){return Project};
updateMeters();
