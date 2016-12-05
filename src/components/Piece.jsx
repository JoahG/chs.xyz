'use strict';

import React from 'react';
import Pieces from './pieces';

const Piece = ({ color, type, style }) => {
  let piece = Pieces[`${ type }`];

  let styles = {
    st0: {
      fill: `none`
    },
    st1: {
      fill: `${ 
                color === `white` ? `#BCBEC0` : 
                color === `black` ? `#231F20` :
                color === `yellow` ? `#7F6226` :
                color === `brown` ? `#3B2417` :
                `black`
              }`
    },
    st2: {
      fill: `${ 
                color === `white` ? `#F1F2F2` : 
                color === `black` ? `#58595B` :
                color === `yellow` ? `#BE9439` :
                color === `brown` ? `#C6784B` :
                `black`
              }`
    },
    st3: {
      fill: `#939598`
    },
    st4: {
      fill: `${ 
                color === `white` ? `#D1D3D4` :
                color === `black` ? `#414042` :
                color === `yellow` ? `#403112` :
                color === `brown` ? `#482C1B` :
                `black`
              }`
    },
    st5: {
      fill: `${ 
                color === `white` ? `#E6E7E8` : 
                color === `black` ? `#6D6E71` :
                color === `yellow` ? `#FEC54C` :
                color === `brown` ? `#875233` :
                `black`
              }`
    }
  };

  let paths = piece.default.replace(/class=\"([^\"]+)\"/gi, (match, p1) => {
    return `style="${ Object.keys(styles[p1]).map((key) => `${ key }:${ styles[p1][key] };`) }"`;
  });

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg"
      viewBox={ `0 0 ${ piece.width } ${ piece.height }` }
      style={ style }>
      <g dangerouslySetInnerHTML={ { __html: paths } } />
    </svg>
  );
};

export default Piece;
