'use strict';

import React from 'react';
import Piece from './Piece.jsx';
import Paper from 'material-ui/Paper';

let hor = [`h`, `g`, `f`, `e`, `d`, `c`, `b`, `a`],
  ver = [`1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`];

const Board = ({ 
    playing_as, 
    board, 
    possibilities, 
    guards, 
    selectPiece, 
    movePiece, 
    capturePiece, 
    setHoveringPiece
  }) => (
  <Paper style={ {
    width: `calc(100% - 30px)`,
    maxWidth: `calc(100vh - 290px)`,
    display: `inline-block`,
    margin: `15px`,
    position: `relative`,
    border: `10px solid #231F20`
  } }>
    <div style={ {
      display: `block`,
      position: `static`,
      paddingBottom: `100%`
    } } />
    <div style={ { 
      position: `absolute`,
      width: `100%`,
      height: `100%`,
      margin: 0,
      top: 0,
      bottom: 0,
      right: 0,
      transform: `rotate(${ playing_as === `white` ? `180deg` : `0deg` })`
    } }>
      {
        ver.map((v, rowIndex) => {
          let rowStyle = {
            height: `calc(100% / ${ ver.length })`,
            backgroundColor: `#E6E7E8`
          };

          if (rowIndex % 2 == 1) {
            rowStyle = {
              ...rowStyle,
              backgroundColor: `#231F20`
            };
          }

          return (
            <div key={ v } style={ rowStyle } id={ v }>
              {
                hor.map((h, columnIndex) => {
                  let sq = board.space_at(h + v),
                    piece = sq.is_occupied,
                    id = `${ h }${ v }`,
                    props = {
                      key: id,
                      style: {
                        height: `100%`,
                        width: `calc(100% / 8)`,
                        float: `left`,
                        textAlign: `center`,
                        transform: `rotate(${ playing_as === `white` ? `180deg` : `0deg` })`
                      },
                      onMouseEnter: () => setHoveringPiece(id),
                      onMouseLeave: () => setHoveringPiece(``)
                    };

                  if (columnIndex % 2 == 1) {
                    if (rowIndex % 2 == 1) {
                      props.style = {
                        ...props.style,
                        backgroundColor: `#E6E7E8`
                      };
                    } else {
                      props.style = {
                        ...props.style,
                        backgroundColor: `#231F20`
                      };
                    }
                  }

                  if (possibilities[0].indexOf(id) > -1) { // Possible Move
                    props.style = {
                      ...props.style,
                      backgroundColor: `#FEC54C`,
                      cursor: `pointer`
                    };

                    props.onClick = () => movePiece(id);
                  }

                  if (possibilities[1].indexOf(id) > -1) { // Possible Capture
                    props.style = {
                      ...props.style,
                      backgroundColor: `#482C1B`,
                      cursor: `pointer`
                    };

                    props.onClick = () => capturePiece(id);
                  }

                  if (guards.indexOf(id) > -1) { // Guarding
                    props.style = {
                      ...props.style
                      // TODO: add styling for guarding
                    };
                  }

                  if (piece) {
                    if (piece.army == board.turn &&
                        piece.can_move() &&
                        board.turn == playing_as) { // Piece can move
                      props.style = {
                        ...props.style,
                        cursor: `pointer`
                      };

                      props.onClick = () => selectPiece(id);
                    }

                    if (piece.type === `king` && (
                        (
                          piece.army === `white` &&
                          board.kings_in_check()[0]
                        ) ||
                        (
                          piece.army === `black` &&
                          board.kings_in_check()[1]
                        ))) {
                      props.style = {
                        ...props.style
                        // TODO: add styling for in-check pieces
                      };
                    }

                    let color = piece.army;

                    if (board.log.length > 0 &&
                        id == board.log[board.log.length - 1][1].to) {
                      if (color === `black`) {
                        color = `brown`;
                      } else if (color === `white`) {
                        color = `yellow`;
                      }
                    }

                    piece = (
                      <Piece 
                        color={ color }
                        type={ piece.type }
                        style={ {
                          marginTop: 5,
                          maxWidth: `calc(100% - 10px)`,
                          maxHeight: `calc(100% - 10px)`,
                          display: `inline-block`
                        } } />
                    );
                  }

                  if (sq.guarded_by(`white`)) { // Space guarded by white
                    props.style = {
                      ...props.style
                      // TODO: add styling for spaces guarded by white
                    };
                  }

                  if (sq.guarded_by(`black`)) { // Space guarded by black
                    props.style = {
                      ...props.style
                      // TODO: add styling for spaces guarded by black
                    };
                  }

                  return (
                    <div { ...props }>{ piece }</div>
                  );
                })
              }
              <div style={ {
                display: `block`,
                clear: `both`
              } } />
            </div>
          );
        })
      }
    </div>
  </Paper>
);

export default Board;
