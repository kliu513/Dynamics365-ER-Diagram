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

    let fromAsKey = {}
    let toAsKey = {}
    edges.forEach(edge => {
      if (edge.From in fromAsKey) fromAsKey[edge.From].push(edge.To)
      else fromAsKey[edge.From] = [edge.To]
    })
    edges.forEach(edge => {
      if (edge.To in toAsKey) toAsKey[edge.To].push(edge.From)
      else toAsKey[edge.To] = [edge.From]
    })

    vertices.forEach(function(vertice, i) {
      const keyInfo = vertice.keyInfo
      const docType = keyInfo.Type
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

      numDocs[docType] += 1

      let docsAfter = [i]
      let docsBefore = [i]
      let currIdx = 0
        
      while (currIdx < Object.keys(docsAfter).length) {
        if (docsAfter[currIdx] in fromAsKey) {
          fromAsKey[docsAfter[currIdx]].forEach(val => {
            docsAfter.push(val)
          })
        }
        currIdx++
      }

      currIdx = 0
      while (currIdx < Object.keys(docsBefore).length) {
        if (docsBefore[currIdx] in toAsKey) {
          toAsKey[docsBefore[currIdx]].forEach(val => {
            docsBefore.push(val)
          })
        }
        currIdx++
      }

      const relDocs = docsAfter.concat(docsBefore)
      // console.log(relDocs)

      g.append("rect")
        .data([i]).classed("data", true)
        .attr("x", 300 + matchTypeToPos(docType) * 300)
        .attr("y", 100 + numDocs[docType] * 200)
        .style("fill", "white")
        .on("mouseover", () => { g.selectAll("rect").each(function(idx) {
          if (relDocs.includes(idx)) {            
            d3.select(this).style("fill", "red")
          }
        })
  
      })
        
        .on("mousemove", () => { g.selectAll("rect").each(function(idx) {
          if (relDocs.includes(idx)) {            
            d3.select(this).style("fill", "red")
          }
        })
  
      })
      .on("mouseout", () => {
        g.selectAll("rect").style("fill", "white")
      })
        
      
      const textLayer = g.append("text")
        // .classed("label", true)
        .style("fill", "#f77")
        .attr("x", 300 + matchTypeToPos(docType) * 300)
        .attr("y", 100 + numDocs[docType] * 200)
        .style("stroke-width", 1)
        .style("text-anchor", "middle")

      Object.keys(keyInfo).forEach(function(key) {
        textLayer.append("tspan")
        .attr("x", 400 + matchTypeToPos(docType) * 300)
        .attr('dy', 15)
        .text(key + ": " + keyInfo[key])
      })
    })

    /*
    edges.forEach(function(edge) {
      let from = vertices[edge.From]
      let to = vertices[edge.To] 
      g.setEdge(from.Type + from.id, to.Type + to.id, {style: "stroke: #7f7; fill: #fff"})
    });
    */

    svg.attr('height', 1200)
    svg.attr('width', 1500)
    return (<svg>svg</svg>)
}

export default DrawDiagram
