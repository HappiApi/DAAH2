const $ = require('jquery');

var currentDragElement;

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

var grid = $('#grid');
for(var i = 0; i < 9; i++) {
    var row = $('<div class="row">');
    grid.append(row);
    for(var j = 0; j < 9; j++) {
      var column = $('<div class="column"></div>');
      column
        .on("dragover", allowDrop)
        .on("drop", drop);
      row.append(column);
    }
    grid.append('</div>');
}

$('.drag-element').on("dragstart", drag);
