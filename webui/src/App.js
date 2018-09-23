import React, {
  Component
} from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {

  state = {
    info: '',
  }

  exportData = _ => {
    fetch('http://127.0.0.1:4000/client/post', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstParam: 'yourValue',
      }),
    });
  }

  importData = _ => {

    fetch(`http://127.0.0.1:4000/client/get?id=${this.refs.id.value}`)
      .then(response => response.json())
      .then(response => this.setState({
        info: response.data.toString()
      }))
      .catch(err => console.error(err));
    console.log(this.state);

  }

  render() {
    const {
      info
    } = this.state;
    return (

      <div className = "App" >
        <form className = "form-group">
        <pre > { info } </pre>

            <label > ID < /label>
            <input className = "form-control" ref = "id" defaultValue = "1" ></input>

          <br />
          <input className = "btn  btn-primary"  onClick = { this.importData } value = "importData" />
          <br />
          </form>
          <form method = "post" action = "http://127.0.0.1:4000/client/post" className = "form-group">
            <textarea name = "userInfo" > < /textarea>
            <br />
            <input className = "btn  btn-primary" type = "submit"  value = "exportData" / >
          </form>
        </div>
    );
  }

}

export default App;
