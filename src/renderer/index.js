const $ = require('jquery');

var currentDragElement;


var gridData = []
//Initialise gridData
for(i=0; i<9; i++){
  gridData[i] = [null,null,null,null,null,null,null,null,null]
}

function createComponent(name){
  return {type:name, orientation:1, parameter:null} 
}

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

    gridData[currentDragElement.id[0]][currentDragElement.id[1]] = createComponent(currentDragElement.alt)
    currentDragElement = null;
}

var grid = $('#grid');
for(var i = 0; i < 9; i++) {
    var row = $('<div class="row">');
    grid.append(row);
    for(var j = 0; j < 9; j++) {
      var column = $('<div class="column"></div>');
      column
        .attr("id", String(i)+String(j))
        .on("dragover", allowDrop)
        .on("drop", drop);
      row.append(column);
    }
    grid.append('</div>');
}

$('.drag-element').on("dragstart", drag);

//Debug
$('.right-bar').on("click", gridTraverse);
$('.left-bar').on("click", function(){
  console.log(gridData)
});

//Parse HTML method
function gridTraverse(){
  var gridData = []
  $('#grid').children('.row').each(function(){
    var rowData = []
    $(this).children('.column').each(function(){
      var componentType = $(this).children('img').attr('alt')
      switch(componentType){
        case "resistor":
          rowData.push({type:"resistor",orientation:1})
          break
        case "cell":
          rowData.push({type:"cell",orientation:1})
          break
        case "diode":
          rowData.push({type:"diode",orientation:1})
          break
        case "switch":
          rowData.push({type:"switch",orientation:1})
          break
        case "straight":
          rowData.push({type:"straight",orientation:1})
          break
        case "bend":
          rowData.push({type:"bend",orientation:1})
          break
        case "split":
          rowData.push({type:"split",orientation:1})
          break
        case "ammeter":
          rowData.push({type:"ammeter",orientation:1})
          break
        case "voltmeter":
          rowData.push({type:"voltmeter",orientation:1})
          break
        default:
          rowData.push({})
          break
      }
    })
    gridData.push(rowData)
  })

  console.log(gridData)
}
