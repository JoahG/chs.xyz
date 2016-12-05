'use strict';

import React from 'react';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import App from './App.jsx';
import IndexPage from '../routes/index.jsx';
import BoardPage from '../routes/board.jsx';

const Root = () => (
  <MuiThemeProvider>
    <Router history={ browserHistory }>
      <Route path="/" component={ App }>
        <IndexRoute component={ IndexPage } />
        <Route path=":slug" component={ BoardPage } />
      </Route>
    </Router>
  </MuiThemeProvider>
);

export default Root;
