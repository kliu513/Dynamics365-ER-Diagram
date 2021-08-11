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

    let numLedgers = {
      "purchase receipt ledger": 0,
      "invoice ledger": 0,
      "payment ledger": 0
    }

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
        case "purchase receipt ledger":
          return 1
        case "invoice ledger":
          return 2
        case "payment ledger":
          return 3
      }
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
    
    vertices.forEach( (vertice, i) => {
      const docType = vertice.keyInfo.Type
      if (docType in numDocs) numDocs[docType] += 1
    })

    const maxNum = Math.max(...Object.values(numDocs))

    Object.keys(numDocs).forEach(key => {
      numDocs[key] = 0
    })

    const svg = d3.select("svg")
    d3.select("body").append("div").classed("bar1", true)
    d3.select("body").append("div").classed("bar2", true)
    const g = svg.append("g")

    const fromAsKey = {}
    const toAsKey = {}
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

      if (Object.keys(numDocs).includes(docType)) {
        //console.log(i)
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
      //console.log(docsAfter)

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
      //console.log(relDocs)

      g.append("rect")
        .datum({"index": i, "isClicked": false, "data": vertice}).classed("data", true)
        .attr("x", 300 + matchTypeToPos(docType) * 300)
        .attr("y", 25 + numDocs[docType] * 100)
        .style("fill", "white")
        .on("mouseover", () => { g.selectAll("rect").each(function(d) {
          if (relDocs.includes(d.index)) {            
            d3.select(this).style("fill", "red")
          }
          d3.selectAll(".ledger").each(function(d) {
            if (d.data.keyInfo.
          })

        })
      })
      .on("mouseout", function(e, d) {
        if (!d.isClicked) g.selectAll("rect").style("fill", "white")
      })
      .on("click", () => {
        g.selectAll("rect").each(function(d) {
          if (relDocs.includes(d.index)) {
            d.isClicked = !d.isClicked          
            d3.select(this).style("fill", "red")
          }})
      })

      const textLayer = g.append("text")
        .style("fill", "#f77")
        .attr("x", 300 + matchTypeToPos(docType) * 300)
        .attr("y", 25 + numDocs[docType] * 100)
        .style("stroke-width", 1)
        .style("text-anchor", "middle")

      Object.keys(keyInfo).forEach(function(key) {
        textLayer.append("tspan")
        .attr("x", 400 + matchTypeToPos(docType) * 300)
        .attr('dy', 15)
        .text(key + ": " + keyInfo[key])
      })
      }
      else{
        numLedgers[docType] += 1
        const from = toAsKey[i]
        console.log(i, from)

        g.append("rect")
          .datum({"index": i, "isClicked": false}).classed("ledger", true)
          .attr("x", 300 + matchTypeToPos(docType) * 300)
          .attr("y", 150 + (numLedgers[docType] + maxNum) * 100)
          .style("fill", "white")
  
        const textLayer = g.append("text")
          .style("fill", "#f77")
          .attr("x", 300 + matchTypeToPos(docType) * 300)
          .attr("y", 150 + (numLedgers[docType] + maxNum) * 100)
          .style("stroke-width", 1)
          .style("text-anchor", "middle")
  
        Object.keys(keyInfo).forEach(function(key) {
          textLayer.append("tspan")
          .attr("x", 400 + matchTypeToPos(docType) * 300)
          .attr('dy', 15)
          .text(key + ": " + keyInfo[key])
        })
      }
    })

    Object.keys(numDocs).forEach((docType) => {
      g.append("text").style("fill", "#f77").attr("x", 300 + matchTypeToPos(docType) * 300)
      .attr("y", 100).text(docType+" ("+numDocs[docType]+")")
    })

    Object.keys(numLedgers).forEach((docType) => {
      g.append("text").style("fill", "#f77").attr("x", 300 + matchTypeToPos(docType) * 300)
      .attr("y", 500).text(docType+" ("+numLedgers[docType]+")")
    })

    svg.attr('height', 1200)
    svg.attr('width', 1500)
    return (<svg>svg</svg>)
}

export default DrawDiagram
