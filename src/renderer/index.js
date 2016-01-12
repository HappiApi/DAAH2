const $ = require('jquery');

var currentDragElement;

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    currentDragElement = ev.target;
}

function drop(ev) {
    ev.preventDefault();

    var element = currentDragElement;

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
      row.append('<div class="column"></div>')
        .on("dragover", allowDrop)
        .on("drop", drop)
    }
    grid.append('</div>');
}

$('.drag-element').on("dragstart", drag);
