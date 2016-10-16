import 'babel-polyfill';
import RedBloom from 'redbloom';

import React from 'react';
import ReactDOM from 'react-dom';

import App from './components/app/index.jsx';

var flux = RedBloom();
var app = <App flux={flux}></App>;

ReactDOM.render(app, document.getElementById('app'));
