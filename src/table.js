import React, { Component } from 'react';
import './table.css';

const NUM_CHUNKS = 10; // how many rows should be loaded at once, up to opinion
const ROW_HEIGHT = 50;
const HEADER_HEIGHT = 20
const CHUNK_SIZE = Math.round((window.innerHeight-HEADER_HEIGHT) / ROW_HEIGHT); // # of rows that fit in viewport

export default class TableComponent extends Component {
    constructor(props) {
      super(props);
      this.state = {
        error: null,
        isLoaded: false,
        headers: [],
        items: [],
        startIdx: 0,
        endIdx: 0 + (NUM_CHUNKS * CHUNK_SIZE),
        reachedEnd: false,
        rowsLoading: false
      };
    }
  
    componentDidMount() {
      window.onscroll = () => {
        if (
          window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight
        ) {
          this.setState({
            startIdx: this.state.endIdx,
            endIdx: this.state.endIdx + (NUM_CHUNKS * CHUNK_SIZE)
          })
          if (!this.state.reachedEnd) {
            this.setState({
              rowsLoading: true
            })
            this.getData();
          }
        }
      }
      this.getData();
    }

    getData() {
      fetch(`/sample?start=${this.state.startIdx}&end=${this.state.endIdx}`)
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            headers: result.headers,
            items: this.state.items.concat(result.data),
            reachedEnd: result.end,
            rowsLoading: false
          });
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error,
            rowsLoading: false
          });
        }
      )
    }

    getTitle(item, index) {
      // this is a placeholder for some sort of way to diplay the whole content
      // ideally I would not want multiline content displayed in a table but rather
      // in some sort of modal/side panel/tooltip that shows extra detail
      return index === '1' ? item[index] : null;
    }

    render() {
      const { error, isLoaded, headers, items, rowsLoading } = this.state;

      const TableHeader = () => {
        return (
          <tr>
          {headers.map((header, index) => {
              return (
                <th key={index}>{header}</th>
              )
          })}
        </tr>
        )
      }

      const TableContent = () => {
        return items.map((item, key) => {
          return (
            <tr key = {key}>
              {Object.keys(headers).map((index, count) => {
                return (
                  <td key={count} title={this.getTitle(item, index)}>{item[index]}</td>
                )
              })}
            </tr>
          )
        })
      }

      const RowsLoading = () => {
        if (rowsLoading) {
          return <div class="row-loader"></div>
        } 
        return <div></div>
      }

      const Table = () => {
        return (           
          <table className="table">
            <tbody>
              <TableHeader></TableHeader>
              <TableContent></TableContent>
              <div></div>
            </tbody>
          </table>
        )
      }

      if (error) {
        return <div>Error: {error.message}</div>;
      } else if (!isLoaded) {
        return <div>Loading...</div>;
      } else {
        return (
          <div className="table-container">
            <Table></Table>
            <RowsLoading></RowsLoading>
          </div>
        )
    }
    
  }
}
