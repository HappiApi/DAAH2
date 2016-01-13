const $ = require('jquery');
const d3 = require('d3');

var currentDragElement = null;
var selectedElement = null;

// Dropping and Dragging Code
//-----------------------------------------------
function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  currentDragElement = ev.target;
}

function checkTarget(ev) {
  while(!$(ev.target).hasClass("column")) {
    console.log(ev.target);
    ev.target = ev.target.parentElement;
  }
  $(ev.target).empty();
}

function drop(ev) {
  ev.preventDefault();

  var element = currentDragElement;
  checkTarget(ev);

  if(element != null) {
    if($(element).hasClass("drag-element")) {
      var img = $('<img src="' + element.src + '" alt="' + element.alt + '">');
      img.on("dragstart", drag);
      selectedElement = img;
      $(ev.target).append(img);
    }
    else {
      $(element).appendTo($(ev.target));
      selectedElement = element;
    }
    generateRightBar();
  }

  currentDragElement = null;
}

//Setup
//------------------

var grid = $('#grid');
// for(var i = 0; i < 9; i++) {
//   var row = $('<div class="row">');
//   grid.append(row);

//   for(var j = 0; j < 9; j++) {
//     var column = $('<div class="column"></div>');
//     column
//       .on("dragover", allowDrop)
//       .on("drop", drop)
//       .on("click", selectElement);
//     row.append(column);
//   }

//   grid.append('</div>');
// }

$('.drag-element').on("dragstart", drag);


//Right bar Code
//-----------------------------------------------


function getRotationDegrees(obj) {
  var matrix = obj.css("transform");
  var values = matrix.split('(')[1].split(')')[0].split(',');
  var a = values[0];
  var b = values[1];
  var angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
  return (angle < 0) ? angle +=360 : angle;
}

function rotating(ev) {
  if($(ev.target).attr('id') == 'rotate-cw') {
    var rotation = getRotationDegrees($(selectedElement)) + 90;
  }
  else {
    var rotation = getRotationDegrees($(selectedElement)) - 90;
  }
  $(selectedElement).css("transform", "translate(-50%, -50%) rotate(" + rotation + "deg)");
}

function deleteElement(ev) {
  $(selectedElement).remove();
  selectedElement = null;
  generateRightBar();
}

function generateRightBar() {
  var container = $('#component-specific');
  container.empty();
  if(selectedElement != null) {
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


function selectElement(ev) {
  selectedElement = ev.target;
  generateRightBar();
}

//Setup
//------------------

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
}

function dragmove() {
  console.log("dragmove", d3.event);
  var pos = d3.mouse(svg.node());
  draggedElement
    .attr("transform", "translate(" + (pos[0] - 20) + "," + (pos[1] - 20) + ")")
}

function dragend() {
  console.log("dragend", d3.event);
  draggedElement = null;
}


function resize() {
  var bounds = canvasContainer.node().getBoundingClientRect();
  svg.attr("width", bounds.width);
  svg.attr("height", bounds.height);
  console.log(bounds);
}

resize();

drag.on("dragstart", dragstart);
drag.on("drag", dragmove);
drag.on("dragend", dragend);
