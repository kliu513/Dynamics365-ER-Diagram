import {useState, useEffect} from "react"
const dagreD3 = require("dagre-d3")
const d3 = require("d3")

function DrawDiagram() {
    const [vertices, setVertices] = useState([])
    const [edges, setEdges] = useState([])
    const [company, setCompany] = useState("")

    useEffect(() => {
        fetch("/output/").then(res => {
            if (res.ok) {
                return res.json()
            }
        }).then(jsonRes => {
          setVertices(jsonRes.Vertices)
          setEdges(jsonRes.Edges)
          setCompany(jsonRes.Dataareaid)
        })
    })

    // return (<div>{edges.map(item => <div>{item}</div>)}</div>)
    // return (<div>{company}</div>)

    const g = new dagreD3.graphlib.Graph().setGraph({});
    //data.forEach(doc => doc.id)

    /*
    // States and transitions from RFC 793
    var states = {
      CLOSED: {
        description: "represents no connection state at all.",
        style: "fill: #f77"
      },
    
      LISTEN: {
        description: "represents waiting for a connection request from any " +
                     "remote TCP and port.",
        style: "fill: #f77"
      }
    };

     g.setEdge("CLOSED",     "LISTEN",     { label: "open", style: "stroke: #7f7; fill: #fff"});

    */
    
    // Add states to the graph, set labels, and style
    vertices.forEach(function(vertice) {
      var value = vertice;
      value.label = vertice.Type + ' ' + vertice.id;
      value.rx = value.ry = 5;
      value.style = "fill: #f77"
      g.setNode(vertice.Type + vertice.id, value);
    });

    edges.forEach(function(edge) {
      let from = vertices[edge[0]]
      let to = vertices[edge[1]] 
      g.setEdge(from.Type + from.id, to.Type + to.id, {style: "stroke: #7f7; fill: #fff"})
    });
    
    // Set up the edges
   
    
    // Create the renderer
    var render = new dagreD3.render();
    
    // Set up an SVG group so that we can translate the final graph.
    var svg = d3.select("svg"),
        inner = svg.append("g");
    
        var styleTooltip = function(name, description) {
        return "<p class='name'>" + name + "</p><p class='description'>" + description + "</p>";
        };
        
        // Run the renderer. This is what draws the final graph.
    render(inner, g);

    var tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")  
    .style("padding", "5px")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .text("Simple Tooltip...");

    inner.selectAll("g.node").attr("data-hovertext", function(v) {
      return JSON.stringify(g.node(v).header)
    }).on("mouseover", function(){return tooltip.style("visibility", "visible");})
    .on("mousemove", function(event){ 
      tooltip.text( this.dataset.hovertext)   
        .style("top", (event.pageY-10)+"px")
        .style("left",(event.pageX+10)+"px");
    })
    .on("mouseout", function(){return tooltip.style("visibility", "hidden");});
        
    /*
    inner.selectAll("g.node")
          .on("mouseover", function(v) {
            d3.select(this)
              .transition()
              .duration("50")
              .attr('r', 10)
              .attr("stroke", "white")
              .attr("stroke-width", 4);
            div.transition()        
             .duration(200)      
             .style("opacity", .9);      
            div.text(styleTooltip(v, JSON.stringify(g.node(v).header)))
             .style("left", (d3.event.pageX - 60) + "px")     
             .style("top", (d3.event.pageY + 30) + "px");
          })
          .on("mouseout", function(v) {
            div.transition()        
              .duration(200)      
              .style("opacity", 0);  
            d3.select(this)
              .transition()
              .duration("50")
              .attr('r', 5)
              .attr("stroke", "black")
              .attr("stroke-width", 2);
                })
    */
    // Run the renderer. This is what draws the final graph.
    render(inner, g);
    var initialScale = 0.75;
    svg.attr('height', g.graph().height * initialScale + 300);
    svg.attr('width', g.graph().width * initialScale + 150);
    return (<svg>svg</svg>)
}

export default DrawDiagram
