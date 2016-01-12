const $ = require('jquery');

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
      $(ev.target).append($('<img src="' + element.src + '" alt="' + element.alt + '">').on("dragstart", drag));
    }
    else {
      $(element).appendTo($(ev.target));
    }
  }

  currentDragElement = null;
}

//Setup
//------------------

var grid = $('#grid');
for(var i = 0; i < 9; i++) {
  var row = $('<div class="row">');
  grid.append(row);

  for(var j = 0; j < 9; j++) {
    var column = $('<div class="column"></div>');
    column
      .on("dragover", allowDrop)
      .on("drop", drop)
      .on("click", selectElement);
    row.append(column);
  }

  grid.append('</div>');
}

$('.drag-element').on("dragstart", drag);


//Right bar Code
//-----------------------------------------------
var resistorHTML = "<div>Resistance</div><"

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
}

function selectElement(ev) {
  selectedElement = ev.target;
  //generateRightBar();
}

//Setup
//------------------

$('#rotate-acw').on('click', rotating);
$('#rotate-cw').on('click', rotating);
$('#delete-button').on('click', deleteElement)
