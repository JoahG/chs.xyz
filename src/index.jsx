'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';

injectTapEventPlugin();

if (process.env.NODE_ENV === `production`) {
  window.console.debug = window.console.log;
  window.console.log = () => {};
  window.console.warn = () => {};
}

import Root from './components/Root.jsx';

ReactDOM.render(<Root />, document.getElementById(`app`));
