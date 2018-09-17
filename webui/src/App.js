import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {

state = {
  info : '',


}

importData = _ => {
  this.setState({info: ''});
  var id = this.refs.id.value;
  fetch(`http://127.0.0.1:4000/client/get?id=${this.refs.id.value}`)
  .then(response => response.json())
  .then(response=> this.setState({info: response.data.toString()}))
  .catch(err => console.error(err));
  console.log(this.state);

}

  render() {
    const {info} = this.state;
    return (

      <div className="App" >

      <plaintext >{info}</plaintext>
 <div className="form-group">
   <label>ID</label>
   <input  className="form-control"  ref="id" defaultValue="1" ></input>
 </div>
 <br />
   <button className="btn  btn-primary" onClick={this.importData}> importData </button>
   <br />
   <br />
   <button className="btn  btn-primary" onClick={this.exportData}> exportData </button>

      </div>
    );
  }

}

export default App;
