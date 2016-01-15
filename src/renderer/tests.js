"use strict";

// FUNCTIONS TO TEST

var componentCount = 0;

class ProjectFactory {
  constructor(name, components, wires){
    this.name = name;
    this.components = components;
    this.wires = wires;
  }

  getComponentById(id) {
    for(var i = 0; i < this.components.length; i++) {
      if(this.components[i].id == id) {
        return this.components[i];
      }
    }
    return null;
  }
}

// TESTS

describe('Project Creation', function() {
  var project = new ProjectFactory("TestName", [], []);
  it("Project Name Test", function() {
    expect(project.name).toBe("TestName");
  });

  it("Project Component Length", function() {
    expect(project.components.length).toBe(0);
  });

  it("Project Wire Length", function() {
    expect(project.wires.length).toBe(0);
  });

  it("Project Component Adding", function() {
    project.components.push("temp");
    expect(project.components.length).toBe(1);
  });

  it("Project Wire Adding", function() {
    project.wires.push("temp");
    expect(project.wires.length).toBe(1);
  });
});

class Component{
  constructor(name, parameter) {
    this.id = name[0] + String(componentCount);
    this.type = name;
    this.orientation = 0;
    this.x = 0;
    this.y = 0;
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

describe('Resistor Creation', function() {
  var component = new Component("resistor", 0); // Creating a resistor

  it("Get id", function() {
    expect(component.id).toBe('r0');
  });

  it("Get type", function() {
    expect(component.type).toBe('resistor');
  });

  it("Get orientation", function() {
    expect(component.orientation).toBe(0);
  });

  it("Get x", function() {
    expect(component.x).toBe(0);
  });

  it("Get y", function() {
    expect(component.y).toBe(0);
  });

  it("Get parameter resistor", function() {
    expect(component.parameter).toBe(1);
  });
});

describe('Cell Creation', function() {
  var component = new Component("cell", 0); // Creating a resistor

  it("Get id", function() {
    expect(component.id).toBe('c0');
  });

  it("Get type", function() {
    expect(component.type).toBe('cell');
  });

  it("Get orientation", function() {
    expect(component.orientation).toBe(0);
  });

  it("Get x", function() {
    expect(component.x).toBe(0);
  });

  it("Get y", function() {
    expect(component.y).toBe(0);
  });

  it("Get parameter resistor", function() {
    expect(component.parameter).toBe(9);
  });
});

describe('Voltmeter Creation', function() {
  var component = new Component("voltmeter", 0); // Creating a resistor

  it("Get id", function() {
    expect(component.id).toBe('v0');
  });

  it("Get type", function() {
    expect(component.type).toBe('voltmeter');
  });

  it("Get orientation", function() {
    expect(component.orientation).toBe(0);
  });

  it("Get x", function() {
    expect(component.x).toBe(0);
  });

  it("Get y", function() {
    expect(component.y).toBe(0);
  });

  it("Get parameter resistor", function() {
    expect(component.parameter).toBe(0);
  });
});

describe('Component Getting By Id', function() {
  var component = new Component("resistor", 0); // Creating a resistor
  var project = new ProjectFactory("TestName", [component], []);

  //it("Get component by id", function() {
  //  expect(project.getComponentById).toBe(component);
  //});

});
