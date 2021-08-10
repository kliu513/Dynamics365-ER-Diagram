import "./DrawDiagram.css"
import {useState, useEffect} from "react"
import Axios from "axios"
const d3 = require("d3")

function DrawDiagram() {
    const [vertices, setVertices] = useState([])
    const [edges, setEdges] = useState([])
    const [company, setCompany] = useState("")
    let numDocs = {
      "purchase order": 0,
      "purchase receipt": 0,
      "invoice": 0,
      "payment": 0
    }

    useEffect(() => {     
      Axios.get("http://localhost:8060/output/")
        .then(res => {return res.data})
        .then(jsonRes => {
          setVertices(jsonRes.Vertices)
          setEdges(jsonRes.Edges)
          setCompany(jsonRes.Dataareaid)
        })
    }, [])

    // return (<div>{edges.map(item => <div>{item.From}</div>)}</div>)
    // return (<div>{company}</div>)
    
    const svg = d3.select("body").select("svg")
    d3.select("body").append("div").classed("bar", true)
    const g = svg.append("g")

    vertices.forEach(function(vertice, i) {
      const keyInfo = vertice.keyInfo
      const docType = keyInfo.Type
      let textToDisplay = ""
      Object.keys(keyInfo).forEach(function(key) {
        const strToAppend = key + ": " + keyInfo[key] + '\r'
        textToDisplay += strToAppend
      })
      numDocs[docType] += 1
      
      function matchTypeToPos(docType) {
        switch (docType) {
          case "purchase order":
            return 0
          case "purchase receipt":
            return 1
          case "invoice":
            return 2
          case "payment":
            return 3
        }
      }
      
      g.append("rect")
        .classed('data', true)
        .attr("x", 300 + matchTypeToPos(docType) * 300)
        .attr("y", 100+numDocs[docType]*200)
      
        g
          .append("text")
          .attr("fill","#f77")
          .attr("x", 300 + matchTypeToPos(docType) * 300)
          .attr("y", 100+numDocs[docType]*200)
          .style("stroke-width", 1)
          .style("text-anchor", "middle")
          .text(textToDisplay);
    })
/*
    edges.forEach(function(edge) {
      let from = vertices[edge.From]
      let to = vertices[edge.To] 
      g.setEdge(from.Type + from.id, to.Type + to.id, {style: "stroke: #7f7; fill: #fff"})
    });
    */

/*
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
    */
    var initialScale = 0.75;
    svg.attr('height', 1200);
    svg.attr('width', 1500);
    console.log("here")
    return (<svg>svg</svg>)
}

export default DrawDiagram
