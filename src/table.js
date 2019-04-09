import React, { Component } from 'react';
import './table.css';

export default class TableComponent extends Component {
    constructor(props) {
      super(props);
      this.state = {
        error: null,
        isLoaded: false,
        items: []
      };
    }
  
    componentDidMount() {
      fetch('/sample')
        .then(res => res.json())
        .then(
          (result) => {
            this.setState({
              isLoaded: true,
              items: result
            });
          },
          (error) => {
            this.setState({
              isLoaded: true,
              error
            });
          }
        )
    }

    render() {
      const { error, isLoaded, items } = this.state;

      const TableHeader = () => {
        return (
          <tr>
          {items.headers.map((header, index) => {
              return (
                <th key={index}>{header}</th>
              )
          })}
        </tr>
        )
      }

      const TableContent = () => {
        return  items.data.map((item, key) => {
          return (
            <tr key = {key}>
              {Object.keys(items.headers).map((index, count) => {
                return (
                  <td key={count}>{item[index]}</td>
                )
              })}
            </tr>
          )
        })
      }

      const Table = () => {
        return (           
          <table className="table">
            <tbody>
              <TableHeader></TableHeader>
              <TableContent></TableContent>
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
          </div>
        )
    }
    
  }
}
