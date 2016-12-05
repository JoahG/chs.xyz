'use strict';

import React from 'react';

class IndexPage extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <h2>Select a game on the left to get started.</h2>
      </div>
    );
  }
}

if (process.env.NODE_ENV !== `production`) {
  IndexPage.propTypes = {

  };
}

export default IndexPage;
