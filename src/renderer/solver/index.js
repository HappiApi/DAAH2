import _ from "lodash";

const componentAttrs = {
  cell: {
    type: "cell",
    connectors: {
      in: null,
      out: null
    }
  },
  resistor: {
    type: "resistor",
    connectors: {
      in: null,
      out: null
    }
  },
  voltmeter: {
    type: "voltmeter",
    connectors: {
      in: null,
      out: null
    }
  }
}

// =============================================================================
// FOR TESTING

const project = {
  components: [
    { id: "V1", type: "cell",     parameter: 10 },
    { id: "R1", type: "resistor", parameter: 1 },
    { id: "R2", type: "resistor", parameter: 2 },
    { id: "R3", type: "resistor", parameter: 1 },
    { id: "R4", type: "resistor", parameter: 2 },
    { id: "R5", type: "resistor", parameter: 5 },
    { id: "VMETER", type: "voltmeter" }
  ],
  wires: [
    { connects: ["V1-in", "R5-out"] },
    { connects: ["R5-in", "R1-out"] },
    { connects: ["R2-out", "R1-in"] },
    { connects: ["R2-in", "R3-out"] },
    { connects: ["R2-in", "R4-out"] },
    { connects: ["V1-out", "R3-in"] },
    { connects: ["V1-out", "R4-in"] },
    { connects: ["R2-in", "VMETER-in"] },
    { connects: ["R2-out", "VMETER-out"] }
  ]
}

const graph = {
  components: [
    { id: "V1", type: "cell", parameter: 10, connectors: { in: null, out: null } }
  ]
}

// =============================================================================
// BEWARE! Actual code follows.

function extractComponent({ id, type, parameter }) {
  let connectors = componentAttrs[type].connectors;
  // Set all values to null. We will use them to store junctions instead of coordinates.
  connectors = _.mapValues(connectors, () => null);
  return { id, type, parameter, connectors };
}

function findWiresConnectingTo(wires, connectorLabel) {
  return wires.filter(wire => wire.connects.includes(connectorLabel));
}

// It finds all the connectorLabels connected to the same junction, given *all*
// the wires in the circuit and a *single* connectorLabel that is connected to
// the junction.
function findAllConnectors(wires, connectorLabel, found=[]) {

  // Find all wires containing the given connectorLabel, but excluding any of
  // the connectorLabels in `found`. The goal is to avoid wires we've already
  // traversed and return only undiscovered wires.
  let connectingWires = findWiresConnectingTo(wires, connectorLabel).filter(wire => {
    return wire.connects.every(label => !found.includes(label));
  });

  // Get an array of arrays containing newly discovered connectorLabels that are
  // connected to the passed connectorLabel.
  let newConnectorLabels = connectingWires.map(wire => {
    return _.without(wire.connects, connectorLabel);
  });

  // Finally flatten the array of arrays and remove any duplicates.
  newConnectorLabels = _.uniq(_.flatten(newConnectorLabels));

  found = found.concat(connectorLabel);

  // Run this same algorithm for every newly found label and merge results.
  let allFound = _.flatten(newConnectorLabels.map(label => {
    return findAllConnectors(wires, label, found);
  }));

  return allFound.concat(connectorLabel);
}

// console.log(findAllConnectors(project.wires, "V1 in"));

// Marks all connectorLabels with the given junctionId.
function setJunction(components, connectorLabels, junctionId) {
  // For each of the passed connectorLabels
  connectorLabels.forEach(connectorLabel => {
    // Extract the componentId and connectorLabel
    let [componentId, label] = connectorLabel.split("-");
    // Find the component the connectorLabel belongs to
    let component = _.find(components, { id: componentId });
    // Mark the connectorLabel of the component with the given junctionId
    component.connectors[label] = junctionId;
  });
  return components;
}

// Builds a "graph" representation, used for simulation/calculation.
function buildGraph(project) {

  // Extract all components in a "graph" format
  let components = project.components.map(extractComponent);
  let wires = project.wires;

  components.forEach(({ id, connectors }) => {
    for (let label in connectors) {
      if (connectors[label] == null) {
        let connectorLabels = findAllConnectors(wires, `${id}-${label}`);
        setJunction(components, connectorLabels, _.uniqueId());
      }
    }
  });

  return components;
}

// Checks whether the given connector belongs to a resistor.
function isResistorConnector(components, connector) {
  let id = connector.split("-")[0];
  let component = _.find(components, { id });
  if (component && component.type == "resistor") return true;
  else return false;
}

// Finds junctions where a pair of resistors connect in series.
// Example result: { 0: ["R1 in", "R2 out"], 1: ["R2 in", "R3 out"]}
//  ...means R1 & R2 connect in series at junction 0 and
//           R2 & R3 connect in series at junction 1
function findResistorsInSeries(components) {
  let junctions = extractJunctions(components);
  let result = _.pickBy(junctions, connectors => {
    return connectors.length == 2 &&
           connectors.every(connector => isResistorConnector(components, connector));
  });
  return result;
}

function sameArrayElements(a, b) {
  return _.isEmpty(_.xor(a, b));
}

function extractJunctions(components) {
  let junctions = {};
  _.each(components, component => {
    _.each(component.connectors, (junction, connector) => {
      let connectorLabel = `${component.id}-${connector}`;
      if (junctions[junction]) {
        junctions[junction] = junctions[junction].concat(connectorLabel);
      } else {
        junctions[junction] = [connectorLabel];
      }
    });
  });
  return junctions;
}

function combineResistorsInSeries(components) {

  let seriesJunctions;

  while (!_.isEmpty(seriesJunctions = findResistorsInSeries(components))) {

    let junction = _.keys(seriesJunctions)[0];
    let connectors = seriesJunctions[junction];

    let resistors = connectors.map(connector => connector.split("-")[0])
                              .map(id => _.find(components, { id }));

    let [a, b] = resistors.map(resistor => _.values(resistor.connectors));
    let [input, output] = _.xor(a, b);
    let resistance = _.sum(resistors.map(resistor => resistor.parameter));

    // remove the two resistors from components
    components = _.difference(components, resistors);

    // add a new resistor in place
    components = components.concat({
      id: _.uniqueId("RSERIES"),
      type: "resistor",
      parameter: resistance,
      connectors: { in: input, out: output },
      combines: resistors,
      combination: "series"
    });

  }

  return components;
}

function findResistorsInParallel(components) {
  let resistors = components.filter(component => component.type == "resistor");
  for (let resistorA of resistors) {
    let junctionsA = _.values(resistorA.connectors);
    let parallel = resistors.filter(resistorB => {
      let junctionsB = _.values(resistorB.connectors);
      return sameArrayElements(junctionsA, junctionsB);
    });
    if (parallel.length > 1) return parallel;
  }
  return [];
}

function combineResistorsInParallel(components) {
  let resistors;
  while ((resistors = findResistorsInParallel(components)).length) {

    let first = resistors[0];
    let resistance = 1.0 / _.sum(resistors.map(r => 1.0 / r.parameter));

    components = _.difference(components, resistors);

    // add a new resistor in place
    components = components.concat({
      id: _.uniqueId("RPARALLEL"),
      type: "resistor",
      parameter: resistance,
      connectors: _.clone(first.connectors),
      combines: resistors,
      combination: "series"
    });

  }
  return components;
}

function combineAllResistors(components) {
  let combine = (x) => combineResistorsInParallel(combineResistorsInSeries(x));
  while (!_.isEqual(
    components,
    components = combine(components)
  ));
  return components;
}

function extractNodalParameters(resistor) {

  let {
    connectors,
    combines: resistors,
    voltage,
    current,
    parameter: resistance
  } = resistor;

  let nodes = [{
    between: _.values(connectors),
    voltage,
    current,
    resistance
  }];

  if (resistors) {
    let childrenNodes = _.flatten(resistors.map(extractNodalParameters));
    nodes = nodes.concat(childrenNodes);
  }

  return nodes;
}

function findAllParameters(combinedResistor) {

  let { combination, combines:resistors } = combinedResistor;

  if (combination == "series") {
    _.each(resistors, resistor => {
      resistor.current = combinedResistor.current;
      resistor.voltage = resistor.current * resistor.parameter;
    });
  } else if (combination == "parallel") {
    _.each(resistors, resistor => {
      resistor.voltage = combinedResistor.voltage;
      resistor.current = resistor.voltage / resistor.parameter;
    });
  }

  if (resistors) _.each(resistors, findAllParameters);
}

export default function solve(project) {

  let components = buildGraph(project);
  let justNotMeters = components.filter(({ type }) => type != "voltmeter");
  let combined = combineAllResistors(justNotMeters);

  let resistors  = _.filter(combined, { type: "resistor" });
  let cells      = _.filter(combined, { type: "cell" });
  let voltmeters = _.filter(components, { type: "voltmeter" });

  if (resistors.length != 1 || cells.length != 1) {
    // TODO different errors
    return null;
  }

  let combinedResistor = resistors[0];
  let cell = cells[0];

  let voltage = cell.parameter;
  let resistance = combinedResistor.parameter;
  let current = voltage / resistance;

  combinedResistor.voltage = voltage;
  combinedResistor.current = current;

  findAllParameters(combinedResistor);

  let nodes = extractNodalParameters(combinedResistor);

  // console.log(nodes);

  return voltmeters.map(voltmeter => {

    let {
      voltage,
      current,
      resistance
    } = _.find(nodes, ({ between }) => sameArrayElements(between, _.values(voltmeter.connectors))) || {};

    return {
      id: voltmeter.id,
      voltage,
      current,
      resistance
    };

  });
}
