var groups = null,
    width = 900,
    height = 500,
    nodewidthPerChar = 6,
    nodeheight = 20;

var selectedGroup = 2;
var selectedGraph = 0;

var svg = d3.select('body')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

function updateWindow() {
    var g = document.getElementsByTagName('body')[0];
    x = window.innerWidth || document.clientWidth || g.clientWidth;
    y = window.innerHeight|| document.clientHeight|| g.clientHeight;
    width = x;
    height = y;
    svg.attr('width', x)
       .attr('height', y);
}
// window.onresize = updateWindow;
updateWindow();

// define arrow markers for graph links
svg.append('svg:defs').append('svg:marker')
    .attr('id', 'end-arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 6)
    .attr('markerWidth', 3)
    .attr('markerHeight', 3)
    .attr('orient', 'auto')
  .append('svg:path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#000');

svg.append('svg:defs').append('svg:marker')
    .attr('id', 'start-arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 4)
    .attr('markerWidth', 3)
    .attr('markerHeight', 3)
    .attr('orient', 'auto')
  .append('svg:path')
    .attr('d', 'M10,-5L0,0L10,5')
    .attr('fill', '#000');

var path = svg.append('svg:g').selectAll('path'),
    rect = svg.append('svg:g').selectAll('g');

function tick() {
    rect.attr('transform', function(d) {
        var x = d.x;
        var y = d.y;
        return 'translate(' + x + ',' + y + ')';
    });

    // draw directed edges with proper padding from node centers
    path.attr('d', function(d) {
        var deltaX = d.target.x - d.source.x,
            deltaY = d.target.y - d.source.y,
            dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
            normX = deltaX / dist,
            normY = deltaY / dist,
            sourcePadding = d.left ? 17 : 12,
            targetPadding = d.right ? 17 : 12,
            sourceX = d.source.x + (sourcePadding * normX),
            sourceY = d.source.y + (sourcePadding * normY),
            targetX = d.target.x - (targetPadding * normX),
            targetY = d.target.y - (targetPadding * normY);
        return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
    });
}

function reload() {
    d3.select("h5").text(groups == null ? "not loaded yet" : groups[selectedGroup].name + "->" + groups[selectedGroup].titles[selectedGraph]);
    if (groups == null) {
        return;
    }
    console.log("d3: " + d3.version);
    for (var i = 0; i < groups.length; i++) {
        console.log("group: " + groups[i].name);
        for (var j = 0; j < groups[i].graphs.length; j++) {
            console.log(" -> title: " + groups[i].titles[j]);
        }
    }
    var graph = groups[selectedGroup].graphs[selectedGraph];

    var nodes = graph.nodes;
    var links = computeLinks(nodes);

    // use schedule to fix cfg nodes in the graph
    function useSchedule(nodes, blocks) {
        var visited = [];
        function processBlock(block, blockX, blockY) {
            console.log("processing block: " + block.id + " with " + blockX + "/" + blockY);
            console.log("node id is: " + block.nodes[0]);
            if (visited.indexOf(block.id) >= 0) {
                return;
            }
            visited.push(block.id);
            var prevNode = nodes[block.nodes[0]],
                lastY = blockY,
                i = 0;
            // watch out for first fixed node
            for (; i < block.nodes.length && !prevNode.fixed; i++) {
                prevNode = nodes[block.nodes[i]];
            }
            prevNode.x = blockX;
            prevNode.y = blockY;
            i++;
            for (; i < block.nodes.length; i++) {
                var node = nodes[block.nodes[i]];
                if (node.fixed) {
                    node.x = prevNode.x;
                    lastY = node.y = prevNode.y + nodeheight * 2;
                    prevNode = node;
                }
            }

            for (i = 0; i < block.successors.length; i++) {
                // TODO: better splitting... and what about merging?  urghs...
                var x = (i + 1) * blockX / block.successors.length;
                processBlock(blocks[block.successors[i]], x, lastY + nodeheight * 2);
            }
        }
        if (blocks.length < 1) {
            throw "no schedule available :(";
        }
        processBlock(blocks[0], width/2, nodeheight * 2);
    }
    var blocks = graph.blocks;
    useSchedule(nodes, blocks);

    // make dense array
    nodes = nodes.filter(function(n) { return n != null; });

    var force = d3.layout.force()
        .nodes(nodes)
        .links(links)
        .size([width, height])
        .linkDistance(nodeheight*4)
        .charge(-400)
        .theta(0)
        .gravity(0.02)
        .on('tick', tick);

    path = path.data(links);

    // add new links
    var p = path.enter().append('svg:path')
        .attr('class', 'link')
        .style('marker-start', function(l) { return l.dataflow ? 'url(#start-arrow)' : ''; })
        .style('marker-end', function(l) { return !l.dataflow ? 'url(#end-arrow)' : ''; })
        .append('title')
        .text(function(l) { return l.edge.name + "(" + l.edge.inputType + ")"; });

    rect = rect.data(nodes, function(n) { return n.id; });

    // add new nodes
    var g = rect.enter().append('svg:g');

    g.append('svg:rect')
        .attr('class', 'node')
        .attr('width', function(n) { return n.getWidth(); })
        .attr('height', nodeheight)
        .style('fill', function(n) { return n.assignColor(); })
        .style('stroke', 'black')
        .style('stroke-width', 1);

    g.append('svg:text')
        .attr('x', function(n) { return n.getWidth()/2; })
        .attr('y', 11*nodeheight/18)
        .attr('class', 'id')
        .text(function(n) { return n.getText(); });

    // set the graph in motion
    force.start();
}
reload();

function computeLinks(nodes) {
    var links = [];
    nodes.map( function(node) {
        // inputs
        for (var j = 0; j < node.nodeclass.inputs.length; j++) {
            if (node.inputs[j] == null) {
                continue;
            }
            var edge = node.nodeclass.inputs[j];
            if (edge.directCount == 0) {
                links.push({
                    source: node,
                    target: nodes[node.inputs[j]],
                    dataflow: true,
                    edge: edge
                });
            } else {
                var targets = node.inputs[j];
                for (var k = 0; k < targets.length; k++) {
                    links.push({
                        source: node,
                        target: nodes[targets[k]],
                        dataflow: true,
                        edge: edge
                    });
                }
            }
        }

        // successors
        for (var j = 0; j < node.nodeclass.successors.length; j++) {
            if (node.successors[j] == null) {
                continue;
            }
            var edge = node.nodeclass.successors[j];
            if (edge.directCount == 0) {
                links.push({
                    source: node,
                    target: nodes[node.successors[j]],
                    dataflow: false,
                    edge: edge
                });
            } else {
                var targets = node.successors[j];
                for (var k = 0; k < targets.length; k++) {
                    links.push({
                        source: node,
                        target: nodes[targets[k]],
                        dataflow: false,
                        edge: edge
                    });
                }
            }
        }
    });
    return links;
}

(function() {
    'use strict';

    var oReq = new XMLHttpRequest();
    oReq.open("GET", "/igv/iadd2-run0-withblocks.igv?timestamp=" + new Date().getTime(), true);
    oReq.responseType = "arraybuffer";

    oReq.onload = function (oEvent) {
        var arrayBuffer = oReq.response; // Note: not oReq.responseText
        if (arrayBuffer) {
            var byteArray = new Uint8Array(arrayBuffer);

            var jdv = new jDataView(byteArray);
            groups = new Reader(new Context(), jdv, byteArray.length).readDump();
            reload();
        }
    };

    oReq.send(null);
})();

function Context() {
}

Context.prototype.getEntry = function(poolid) {
    if (!this[poolid]) {
        throw "no element for poolid=" + poolid;
    }
    return this[poolid];
}
Context.prototype.putEntry = function(poolid, poolObject) {
    if (this[poolid]) {
        throw "already an element for poolid=" + poolid;
    }
    this[poolid] = poolObject;
}

function Klass(name) {
    this.name = name;
}

function Enumklass(name, entries) {
    this.name = name;
    this.entries = entries;

    this.lookupEnum = function(i) {
        return this.name + "->" + this.entries[i];
    }
}

function JavaMethod(declaringClass, name, signature, modifiers, code) {
    this.declaringClass = declaringClass;
    this.name = name;
    this.signature = signature;
    this.modifiers = modifiers;
    this.code = code;
}

function JavaSignature(args, returnType) {
    this.args = args;
    this.returnType = returnType;
}

function Group(name, shortname, method, bci) {
    this.name = name;
    this.shortname = shortname;
    this.method = method;
    this.bci = bci;
    this.titles = [];
    this.graphs = [];

    this.addGraph = function(title, graph) {
        this.titles.push(title);
        this.graphs.push(graph);
    }
}

function Block(id, nodes, successors) {
    this.id = id;
    this.nodes = nodes;
    this.successors = successors;
}

function Graph() {
    this.nodes = [];
}

EdgeType = {
    Inputs : "inputs",
    Successors : "successors"
}

function Edge(directCount, name, inputType) {
    this.directCount = directCount;
    this.name = name;
    this.inputType = inputType;

    this.toString = function() {
        return "[directCount=" + this.directCount + ",name=" + this.name + (inputType == null ? "" : ",inputType=" + this.inputType) + "]";
    }
}

function NodeClass(simplename, template, inputs, successors) {
    this.simplename = simplename;
    this.template = template;
    this.inputs = inputs;
    this.successors = successors;

    this.toString = function() {
        var str = "";
        str += this.simplename;
        str += ",";
        str += this.template;
        str += "\ninputs: {";
        for (var i = 0; i < this.inputs.length; i++) {
            var input = this.inputs[i];
            str += "" + input + ",";
        }
        str += "}\nsuccessors: {";
        for (var i = 0; i < this.successors.length; i++) {
            var sux = this.successors[i];
            str += "" + sux + ",";
        }
        str += "}";
        return str;
    }
}

function Node(id, nodeclass, predecessor, inputs, successors, props, fixed) {
    this.id = id;
    this.nodeclass = nodeclass;
    this.predecessor = predecessor;
    this.inputs = inputs;
    this.successors = successors;
    this.props = props;
    this.fixed = predecessor == 1 || nodeclass.successors.map(
            function(sux) {
                return sux.name;
            }
        ).indexOf('next') >= 0;

    this.getText = function() {
        return this.id + "|" + this.nodeclass.template;
    }

    this.getWidth = function() {
        return (this.getText().length * nodewidthPerChar) + 3;
    }

    this.assignColor = function() {
        // cf. src/share/tools/IdealGraphVisualizer/Graal/src/com/sun/hotspot/igv/graal/filters/color.filter
        var awtOrange = "rgb(255, 200, 0)";
        var awtMagenta = "rgb(255, 0, 255)";
        var awtPink = "rgb(255, 175, 175)";
        var awtCyan = "rgb(0, 255, 255)";
        var awtGreen = "rgb(0, 255, 0)";

        var sn = this.nodeclass.template;
        if (['LoopBegin', 'StartNode', 'Begin', 'EndNode', 'LoopExit', 'LoopEnd', 'Return'].indexOf(sn) >= 0) {
            return awtOrange;
        }
        if (['+', '>>', '>>>', '&', '<<'].indexOf(sn) >= 0) {
            return awtCyan;
        }
        if (sn.indexOf("Param") == 0) {
            return "rgb(191, 191, 191)";
        }
        if (['If', 'Merge'].indexOf(sn) >= 0) {
            return awtPink;
        }
        if (sn.indexOf("FrameState@") == 0) {
            return "rgb(128, 205, 255)";
        }
        if (sn.indexOf("Const(") == 0) {
            return "rgb(178, 178, 178)";
        }
        if (sn.indexOf("ValuePhi") == 0 || sn.indexOf("ValueProxy") == 0) {
            return awtMagenta;
        }
        return 'none';
    }

    this.toString = function() {
        var str = "";
        str += this.id + "|" + this.nodeclass.simplename;
        str += " (inputs: ";
        for (var i = 0; i < this.nodeclass.inputs.length; i++) {
            str += this.nodeclass.inputs[i].name + "=" + this.inputs[i] + ",";
        }
        str += ") (successors: ";
        for (var i = 0; i < this.nodeclass.successors.length; i++) {
            str += this.nodeclass.successors[i].name + "=" + this.successors[i] + ",";
        }
        str += ")";
        return str;
    }
}

function Reader(context, blob, blobLength) {
    this.readDump = function() {
        var groups = []
        var currentGroup = null;
        do {
            switch(blob.getUint8()) {
                case 0x00: // BEGIN_GROUP
                    var longname = this.readPoolObject();
                    var shortname = this.readPoolObject();
                    var method = this.readPoolObject();
                    var bci = blob.getInt32();
                    if (currentGroup != null) {
                        throw "parsing error: current group was never closed";
                    }
                    currentGroup = new Group(longname, shortname, method, bci);
                    groups.push(currentGroup);
                    break;
                case 0x01: // BEGIN_GRAPH
                    var title = this.readPoolObject();
                    var graph = this.readGraph();
                    currentGroup.addGraph(title, graph);
                    break;
                case 0x02: // CLOSE_GROUP
                    currentGroup = null;
                    break;
            }
            console.log("woot: " + blob.tell() + "/" + blobLength);
        } while(blob.tell() < blobLength);
        // if (currentGroup != null) {
        //     throw "parsing error: current group was never closed (teh end)";
        // }
        return groups;
    }

    this.readGraph = function() {
        var nodeslen = blob.getUint32();
        var graph = new Graph();
        for (var i=0; i < nodeslen; i++) {
            var node = this.readNode();
            graph.nodes[node.id] = node;
        }
        // block stuff is more or less untested.  seems to parse at least.
        var blockslen = blob.getUint32();
        var blocks = [];
        for (var i = 0; i < blockslen; i++) {
            var blockid = blob.getInt32();
            var nodessize = blob.getInt32();
            var nodes = new Array(nodessize);
            for (var j = 0; j < nodessize; j++) {
                nodes[j] = blob.getInt32();
            }
            var suxsize = blob.getInt32();
            var successors = new Array(suxsize);
            for (var j = 0; j < suxsize; j++) {
                successors[j] = blob.getInt32();
            }
            blocks[blockid] = new Block(blockid, nodes, successors);
        }
        graph.blocks = blocks;
        return graph;
    }

    this.readNode = function() {
        var id = blob.getInt32();
        var nodeclass = this.readPoolObject();
        var predecessor = blob.getUint8();
        var propsLen = blob.getUint16();
        var props = new Object();
        for (var i = 0; i < propsLen; i++) {
            var key = this.readPoolObject();
            var value = this.readPropertyObject();
            props[key] = value;
        }
        var inputs = this.readEdges(nodeclass, EdgeType.Inputs);
        var successors = this.readEdges(nodeclass, EdgeType.Successors);
        var node = new Node(id, nodeclass, predecessor, inputs, successors, props);
        console.log("node: " + node);
        return node;
    }

    this.readEdges = function(nodeclass, inputtype) {
        var edges = inputtype == EdgeType.Inputs ? nodeclass.inputs : nodeclass.successors;
        var nodes = new Array(edges.length);
        for (var i = 0; i < edges.length; i++) {
            var edge = edges[i];
            if (edge.directCount == 0) {
                nodes[i] = this.readNodeRef();
            } else {
                var len = blob.getUint16();
                if (len == 0) {
                    nodes[i] = null;
                } else {
                    var l = [];
                    for (var j = 0; j < len; j++) {
                        l[j] = this.readNodeRef();
                    }
                    nodes[i] = l;
                }
            }
        }
        return nodes;
    }

    this.readNodeRef = function() {
        var val = blob.getInt32();
        if (val == -1) {
            return null;
        }
        return val;
    }

    this.readString = function() {
        function readUTF16String(bytes, bigEndian) {
            var ix = 0;
            var offset1 = 1, offset2 = 0;

            if (bigEndian) {
                offset1 = 0;
                offset2 = 1;
            }

            var string = "";
            for( ; ix < bytes.length; ix+=2 ) {
                var byte1 = bytes[ix+offset1]; // .charCodeAt(0);
                var byte2 = bytes[ix+offset2]; // .charCodeAt(0);
                var word1 = (byte1<<8)+byte2;
                if( byte1 < 0xD8 || byte1 >= 0xE0 ) {
                    string += String.fromCharCode(word1);
                } else {
                    console.log("fuck, I'm not sure if the callee code is correct then.");
                    ix+=2;
                    var byte3 = bytes[ix+offset1]; // .charCodeAt(0);
                    var byte4 = bytes[ix+offset2]; // .charCodeAt(0);
                    var word2 = (byte3<<8)+byte4;
                    string += String.fromCharCode(word1, word2);
                }
            }

            return string;
        }
        var len = blob.getUint32() * 2;
        // is blob.getBytes() broken?!!?
        // var strarray = blob.getBytes(len, 0, littleEndian = true, toArray = true);
        var strarray = new Uint8Array(len);
        for(var i = 0; i < len; i++) {
            strarray[i] = blob.getUint8();
        }
        var str = readUTF16String(strarray, true);
        // console.log("such wow(" + len + "): " + str);
        return str;
    }

    this.readNodeClassEdges = function(edgetype) {
        var count = blob.getUint16();
        var edges = new Array(count);
        for (var i = 0; i < count; i++) {
            var directCount = blob.getUint8(); // 0 or 1
            var edgeName = this.readPoolObject();
            var inputType = null;
            if (edgetype == EdgeType.Inputs) {
                inputType = this.readPoolObject();
            }
            edges[i] = new Edge(directCount, edgeName, inputType);
        }
        return edges;
    }

    this.readBytes = function() {
        var len = blob.getInt32();
        if (len == -1) {
            return new Uint8Array(0);
        } else {
            var arr = new Uint8Array(len);
            for (var i = 0; i < len; i++) {
                arr[i] = blob.getUint8();
            }
        }
    }

    this.readPropertyObject = function() {
        var b;
        switch(b = blob.getUint8()) {
            case 0x00: //PROPERTY_POOL
                return this.readPoolObject();
            case 0x01: //PROPERTY_INT
                return blob.getInt32();
            case 0x02: //PROPERTY_LONG
                return blob.getInt64();
            case 0x03: //PROPERTY_DOUBLE
                return blob.getFloat64();
            case 0x04: //PROPERTY_FLOAT
                throw "niy: PROPERTY_FLOAT";
            case 0x05: //PROPERTY_TRUE
                return new Boolean(true);
            case 0x06: //PROPERTY_FALSE
                return new Boolean(false);
            case 0x07: //PROPERTY_ARRAY
                throw "niy: PROPERTY_ARRAY";
            case 0x08: //PROPERTY_SUBGRAPH
                throw "niy: PROPERTY_SUBGRAPH";
            default:
                throw "niy for read property object: " + b;
        }
    }

    this.readPoolObject = function() {
        var b;
        switch(b = blob.getUint8()) {
            case 0x00: // POOL_NEW
                var id = blob.getUint16();
                var ret;
                var b;
                switch(b = blob.getUint8()) {
                    case 0x01: // POOL_STRING
                        ret = this.readString();
                        break;
                    case 0x02: // POOL_ENUM
                        var enumklass = this.readPoolObject();
                        var ordinal = blob.getInt32();
                        var ret = enumklass.lookupEnum(ordinal);
                        break;
                    case 0x03: // POOL_CLASS
                        var classname = this.readString();
                        var b = blob.getUint8();
                        switch(b) {
                            case 0x00: // KLASS
                                ret = Klass(classname);
                                break;
                            case 0x01: // ENUM_KLASS
                                var entries = [];
                                var len = blob.getInt32();
                                for (var i = 0; i < len; i++) {
                                    entries[i] = this.readPoolObject();
                                }
                                ret = new Enumklass(classname, entries);
                                break;
                            default:
                                throw "does not exist for POOL_CLASS: " + b;
                        }
                        break;
                    case 0x04: // POOL_METHOD
                        var declaringClass = this.readPoolObject();
                        var name = this.readPoolObject();
                        var signature = this.readPoolObject();
                        var modifiers = blob.getInt32();
                        var code = this.readBytes();
                        ret = new JavaMethod(declaringClass, name, signature, modifiers, code);
                        break;
                    case 0x05: // POOL_NULL
                        throw "should not reach here: POOL_NULL";
                    case 0x06: // POOL_NODE_CLASS
                        var simplename = this.readString();
                        var template = this.readString();
                        var inputs = this.readNodeClassEdges(EdgeType.Inputs);
                        var successors = this.readNodeClassEdges(EdgeType.Successors);
                        ret = new NodeClass(simplename, template, inputs, successors);
                        console.log("nodeclass: " + ret);
                        break;
                    case 0x07: // POOL_FIELD
                        throw "niy: POOL_FIELD";
                    case 0x08: // POOL_SIGNATURE
                        var argslen = blob.getUint16();
                        var args = new Array(argslen);
                        for (var i = 0; i < argslen; i++) {
                            args[i] = this.readPoolObject();
                        }
                        var returnType = this.readPoolObject();
                        ret = new JavaSignature(args, returnType);
                        break;
                    default:
                        throw b + " unknown pool entry (inner)";
                }
                context.putEntry(id, ret);
                return ret;
            case 0x05: // POOL_NULL
                return null;
            case 0x01: // POOL_STRING
            case 0x02: // POOL_ENUM
            case 0x03: // POOL_CLASS
            case 0x04: // POOL_METHOD
            case 0x06: // POOL_NODE_CLASS
            case 0x07: // POOL_FIELD
            case 0x08: // POOL_SIGNATURE
                return context.getEntry(blob.getUint16());
            default:
                throw b + " unknown pool entry";
        }
    }
}
