import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import {createBrowserHistory} from "history"

const history = createBrowserHistory();

ReactDOM.render(
  <React.StrictMode>
    <App history={history} location={window.location} />
  </React.StrictMode>,
  document.getElementById('root')
);