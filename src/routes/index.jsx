'use strict';

import React from 'react';

class IndexPage extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        not currently in a game.
      </div>
    );
  }
}

if (process.env.NODE_ENV !== `production`) {
  IndexPage.propTypes = {

  };
}

export default IndexPage;
