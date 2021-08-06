import {useState, useEffect} from "react"
import Axios from "axios"
const dagreD3 = require("dagre-d3")
const d3 = require("d3")

function DrawDiagram() {
    const [vertices, setVertices] = useState([])
    const [edges, setEdges] = useState([])
    const [company, setCompany] = useState("")

    useEffect(() => {     
      Axios.get("http://localhost:8060/output/")
        .then(res => {return res.data})
        .then(jsonRes => {
          setVertices(jsonRes.Vertices)
          setEdges(jsonRes.Edges)
          setCompany(jsonRes.Dataareaid)
        })
    }, [])

    // return (<div>{edges.map(item => <div>{item}</div>)}</div>)
    // return (<div>{company}</div>)

    const g = new dagreD3.graphlib.Graph().setGraph({});

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
    
    vertices.forEach(function(vertice) {
      const value = {}
      value.label = ""
      const keyInfo = vertice.keyInfo
      Object.keys(keyInfo).forEach((key) => {
        const newInfo = key + ": " + keyInfo[key] + "\n"
        value.label += newInfo
      })
      value.rx = value.ry = 5;
      value.style = "fill: #f77"
      
      g.setNode(keyInfo.Type, value)
      console.log(keyInfo.Type)
    });
/*
    edges.forEach(function(edge) {
      let from = vertices[edge.From]
      let to = vertices[edge.To] 
      g.setEdge(from.Type + from.id, to.Type + to.id, {style: "stroke: #7f7; fill: #fff"})
    });
    */
    const render = new dagreD3.render()
    const svg = d3.select("svg")
    const inner = svg.append("g")
    render(inner, g);

    const tooltip = d3.select("body")
      .append("div")
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")  
      .style("padding", "5px")
      .style("z-index", "10")
      .style("visibility", "hidden")
      .text("Simple Tooltip...")

    inner.selectAll("g.node").attr("data-hovertext", function(v) {
      return JSON.stringify(g.node(v).header)
    }).on("mouseover", function(){return tooltip.style("visibility", "visible");})
    .on("mousemove", function(event){ 
      tooltip.text( this.dataset.hovertext)   
        .style("top", (event.pageY-10)+"px")
        .style("left",(event.pageX+10)+"px");
    })
    .on("mouseout", function(){return tooltip.style("visibility", "hidden");});
        
    render(inner, g);
    var initialScale = 0.75;
    svg.attr('height', g.graph().height * initialScale + 300);
    svg.attr('width', g.graph().width * initialScale + 150);
    return (<svg>svg</svg>)
}

export default DrawDiagram
