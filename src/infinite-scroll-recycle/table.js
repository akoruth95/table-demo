import React, { Component } from 'react';
import pool from './pool';
import './table.css';

const ROW_HEIGHT = 50;
const HEADER_HEIGHT = 20
const CHUNK_SIZE = Math.ceil((window.innerHeight - HEADER_HEIGHT) / ROW_HEIGHT); // # of rows that fit in viewport
const NUM_CHUNKS = 5; // how many chunks to display in viewport
const DATA_LIMIT = (CHUNK_SIZE * NUM_CHUNKS) * 5 // load 5 times as much data as can fit on screen
const ROW_RECYCLE_SIZE = 1;

export default class Table extends Component {
    constructor(props) {
      super(props);
      this.state = {
        items: [],
        dataPos: 0, // what index of actual data we have currently loaded
        headers: [], 
        topI: 0, // index in items array of top node in viewport
        bottomI: (CHUNK_SIZE * NUM_CHUNKS), // index in items array of bottom node in viewport
        topH: 20, // scroll ofset necessary to recycle to from bottom to top
        bottomH: (ROW_HEIGHT * CHUNK_SIZE * 3) + HEADER_HEIGHT, // scroll ofset necessary to recycle to from top to bottom
        reachedEnd: false
      };
    }
  
    componentDidMount() {
      this.getData();
      window.onscroll = () => {
        if ((this.state.dataPos - this.state.bottomI) < (CHUNK_SIZE * 3) && !this.state.reachedEnd) {
            // load more data if user is nearing last data row
            this.getData();
        }

        if (document.documentElement.scrollTop >= this.state.bottomH) {
            if(this.state.reachedEnd && this.state.bottomI === this.state.items.length) {
                // if viewport has reached last row of all data, do not recycle
                return;
            }
            // recycle from top nodes once user scrolls to bottom of viewport
            this.recycleTop();
        }

        if (document.documentElement.scrollTop <= this.state.topH + ROW_HEIGHT && this.state.topI >= 0) {
            // recycle from bottom nodes once user scrolls to bottom of viewport
            // if scroll has reached top, do not recycle
            this.recycleBottom();
        }
      }
    }

    shouldComponentUpdate(nextProps, nextState) {
        // only rerender when initially creating headers
        return JSON.stringify(this.state.headers)!==JSON.stringify(nextState.headers);
    }

    // recycle rows from bottom to top on scroll up
    recycleBottom() {
        let recycledRows = pool.pop(ROW_RECYCLE_SIZE, false);
        let table = document.getElementById('table');
        recycledRows.forEach((node, index) => {
            let newRowIndex = this.state.topI - index;
            let newPosition = (newRowIndex * ROW_HEIGHT) + 20;
            node.style.top = `${newPosition}px`;
            node.childNodes.forEach((node, cellIndex) => {
                node.textContent = this.state.items[newRowIndex][cellIndex];
            })
            table.appendChild(node);
        })
        pool.push(recycledRows, true);
        this.setState({
            topI: this.state.topI - ROW_RECYCLE_SIZE,
            bottomI: this.state.bottomI - ROW_RECYCLE_SIZE,
            topH: this.state.topH - (ROW_HEIGHT * ROW_RECYCLE_SIZE),
            bottomH: this.state.bottomH - (ROW_HEIGHT * ROW_RECYCLE_SIZE)
        })
    }

    //recycle rows from top to bottom on scroll down
    recycleTop() {
        let recycledRows = pool.pop(ROW_RECYCLE_SIZE, true);
        let table = document.getElementById('table');
        recycledRows.forEach((node, index) => {
            let newRowIndex = this.state.bottomI + index;
            let newPosition = (newRowIndex * ROW_HEIGHT) + 20;
            node.style.top = `${newPosition}px`;
            node.childNodes.forEach((node, cellIndex) => {
                node.textContent = this.state.items[newRowIndex][cellIndex];
            })
            table.appendChild(node);
        })
        pool.push(recycledRows, false);
        this.setState({
            topI: this.state.topI + ROW_RECYCLE_SIZE,
            bottomI: this.state.bottomI + ROW_RECYCLE_SIZE,
            topH: this.state.topH + (ROW_HEIGHT * ROW_RECYCLE_SIZE),
            bottomH: this.state.bottomH + (ROW_HEIGHT * ROW_RECYCLE_SIZE)
        })
    }

    // load more data from server
    getData() {
        fetch(`/sample?start=${this.state.dataPos}&end=${this.state.dataPos + DATA_LIMIT}`)
        .then(res => res.json())
        .then(
          (result) => {
            this.setState({
                headers: result.headers,
                items: this.state.items.concat(result.data),
                reachedEnd: result.end,
                dataPos: this.state.dataPos + DATA_LIMIT
              });
              if (!pool.getPool().length) {
                  this.initPool();
              }
          }
        )
    }

    // initialize pool by preallocating rows that will exist in the viewport
    initPool() {
        let items = [];
        let table = document.getElementById('table');
        for (let dataIndex = this.state.topI; dataIndex < this.state.bottomI; dataIndex++) {
            let tableRow = document.createElement('div');
            tableRow.className += ' table-row'
            let position = (dataIndex * ROW_HEIGHT) + 20; //absolute position of each row, allows to keep rows in position as we scroll
            tableRow.style.top = `${position}px`;
            this.state.headers.forEach((header, headerIndex) => {
                let tableCell = document.createElement('div');
                tableCell.className += ` table-cell ${header}`;
                tableCell.textContent = this.state.items[dataIndex][headerIndex];
                tableRow.appendChild(tableCell);
            });
            items.push(tableRow);
        }
        pool.setPool(items);
        pool.getPool().forEach(node => table.appendChild(node));
    }


    render() {

      const TableHeader = () => {
        return (
            <div className="table-row">
            {this.state.headers.map((header, index) => {
                return (
                  <div className={`table-cell header ${header}`} key={index}>{header}</div>
                )
            })}
          </div>
          )
      }

      const Table = () => {
        return (           
          <div id="table">
              <TableHeader></TableHeader>
          </div>
        )
      }
        return (
            <Table></Table>
        )

    
  }
}