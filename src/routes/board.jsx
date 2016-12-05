'use strict';

import React from 'react';
import { browserHistory } from 'react-router';
import ChessBoard from '../vendor/chess.js';
import Board from '../components/Board.jsx';
import db from '../helpers/ApiHelper.js';
import Paper from 'material-ui/Paper';

let game_unparsed, dbListener;

class BoardPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      board: new ChessBoard((o) => { this.move_callback(o); }),
      chatLog: [],
      activePiece: ``,
      hoveringPiece: ``,
      white: ``,
      black: ``,
      spectators: [],
      playing_as: ``,
      canSwitch: false,
      chatOpen: false,
      logOpen: false
    };
  }

  componentDidMount() {
    this.init();
  }

  uninit() {
    //slug = this.props.params.slug
    db.removeBinding(dbListener);

    // db.update(`games/${ slug }`, {
    //   data: {
    //     spectators: this.state.spectators.filter((uid) => !uid == this.props.auth.uid)
    //   }
    // });
  }

  init(slug = this.props.params.slug) {
    dbListener = db.listenTo(`games/${ slug }`, {
      context: this,
      state: `game`,
      asArray: false,
      then: (game) => {
        if (Object.keys(game).length == 0) return browserHistory.push(`/`);

        game_unparsed = game;

        let board = new ChessBoard((o) => { this.move_callback(o); });
        board.restore(JSON.parse(game.board));
        board.update_guards();

        this.setState({
          board,
          chatLog: game.chatLog || [],
          white: game.white || ``,
          white_user: game.white_user || {},
          black: game.black || ``,
          black_user: game.black_user || {},
          spectators: game.spectators || [],
          canSwitch: game.canSwitch,
          activePiece: ``,
          hoveringPiece: ``,
          playing_as: this.props.loggedIn ?
                  this.props.auth.uid === game.white ?
                  `white` :
                  this.props.auth.uid === game.black ?
                  `black` :
                  `` :
                ``
        });
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.slug !== this.props.params.slug) {
      this.uninit(this.props.params.slug);
      this.init(nextProps.params.slug);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.loggedIn !== prevProps.loggedIn && game_unparsed) {
      let board = new ChessBoard((o) => { this.move_callback(o); });
      board.restore(JSON.parse(game_unparsed.board));
      board.update_guards();

      this.setState({
        board,
        chatLog: game_unparsed.chatLog || [],
        white: game_unparsed.white || ``,
        white_user: game_unparsed.white_user || {},
        black: game_unparsed.black || ``,
        black_user: game_unparsed.black_user || {},
        spectators: game_unparsed.spectators || [],
        canSwitch: game_unparsed.canSwitch,
        playing_as: this.props.loggedIn ?
                this.props.auth.uid === game_unparsed.white ?
                `white` :
                this.props.auth.uid === game_unparsed.black ?
                `black` :
                `` :
              ``
      });
    }
  }

  move_callback() {
    db.update(`games/${ this.props.params.slug }`, {
      data: {
        board: this.state.board.export(),
        canSwitch: false
      }
    });
  }

  joinGame() {
    let data = {};

    if (!this.props.loggedIn) { return false; }

    if (this.state.white.length == 0) {
      data.white = this.props.auth.uid;
      data.white_user = {
        name: this.props.auth.displayName,
        img: this.props.auth.photoURL
      };
    } else if (this.state.black.length == 0) {
      data.black = this.props.auth.uid;
      data.black_user = {
        name: this.props.auth.displayName,
        img: this.props.auth.photoURL
      };
    }

    db.update(`games/${ this.props.params.slug }`, {
      data
    });
  }

  switchTo(color) {
    let data = {};

    if (this.state[color].length == 0 && this.state.playing_as.length > 0) {
      data[this.state.playing_as] = ``;
      data[`${ this.state.playing_as }_user`] = {};

      data[color] = this.props.auth.uid;
      data[`${ color }_user`] = {
        name: this.props.auth.displayName,
        img: this.props.auth.photoURL
      };
    }

    db.update(`games/${ this.props.params.slug }`, {
      data
    });
  }

  selectPiece(id) {
    this.setState({
      activePiece: (id === this.state.activePiece ? `` : id)
    });
  }

  movePiece(id) {
    let activePiece = this.state.board.space_at(this.state.activePiece).is_occupied;
    if (activePiece.move_to(id, false, false)) {
      this.setState({
        activePiece: ``
      });
    }
  }

  capturePiece(id) {
    let activePiece = this.state.board.space_at(this.state.activePiece).is_occupied,
      move_is_en_passant = activePiece.move_is_en_passant(id),
      captured_piece = this.state.board.space_at(id).is_occupied,
      is_en_passant = false;

    if (move_is_en_passant) {
      captured_piece = move_is_en_passant;
      is_en_passant = true;
    }

    if (activePiece.takes(id, captured_piece, is_en_passant)) {
      this.setState({
        activePiece: ``
      });
    }
  }

  setHoveringPiece(id) {
    this.setState({
      hoveringPiece: id
    });
  }

  toggleChatOpen() {
    this.setState({
      chatOpen: !this.state.chatOpen
    });
  }

  toggleLogOpen() {
    this.setState({
      logOpen: !this.state.logOpen
    });
  }

  tweet(msg) {
    return `http://twitter.com/intent/tweet?via=chsxyz` + 
           `&hashtags=lookingforchessplayer` + 
           `&text=${ msg.replace(/\s+/gi, ` `).replace(/\n/gi, ``) }`;
  }

  render() {
    let possibilities = [[], []], activePiece, guards = [];

    let playing_as = this.state.playing_as;

    if (this.state.activePiece.length > 0) {
      activePiece = this.state.board.space_at(this.state.activePiece).is_occupied;
      possibilities = activePiece.possible_moves();
    }

    if (this.state.hoveringPiece.length > 0) {
      guards = this.state.board.space_at(this.state.hoveringPiece).is_guarded.map((guard) => {
        return guard.space;
      });
    }

    return (
      <div>
        <section style={ {
          textAlign: `center`
        } }>
          <h1 style={ {
            textAlign: `center`,
            margin: 0,
            marginTop: 15,
            fontSize: `32px`,
            fontWeight: 800
          } }>
            Game #
            { 
              this.props.params.slug.substring(
                this.props.params.slug.length - 4, 
                this.props.params.slug.length
              ).toUpperCase() 
            }
          </h1>
          <div style={ {
            textAlign: `center`,
            margin: `15px 0 0`
          } }>
            <div style={ {
              display: `inline-block`,
              verticalAlign: `middle`
            } }>
              { 
                this.state.white.length > 0 ? (
                  <div>
                    <span style={ {
                      verticalAlign: `middle`,
                      display: `inline-block`
                    } }>
                      <img 
                        src={ this.state.white_user.img } 
                        alt={ this.state.white_user.name }
                        style={ {
                          marginRight: 10
                        } } />
                    </span>
                    <span style={ {
                      verticalAlign: `middle`,
                      display: `inline-block`
                    } }>
                      <strong>{ playing_as == `white` ? `You` : this.state.white_user.name }</strong>
                    </span>
                  </div>
                ) : playing_as.length > 0 ? (
                  <div>
                    {
                      this.state.canSwitch ? (
                        <div onClick={ () => this.switchTo(`white`) } style={ { cursor: `pointer` } }>
                          <span style={ {
                            verticalAlign: `middle`,
                            display: `inline-block`
                          } }>
                            <strong>[ Switch to White? ]</strong>
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span style={ {
                            verticalAlign: `middle`,
                            display: `inline-block`
                          } }>
                            <strong>[ Waiting for player to join ]</strong>
                          </span>
                        </div>
                      )
                    }
                    <a 
                      target="_blank"
                      href={ this.tweet(`I'm looking for a player to 
                                         play white
                                         https://chs.xyz/${ this.props.params.slug }`) } 
                      style={ { cursor: `pointer`, display: `block`, color: `black` } }>
                      <span style={ {
                        verticalAlign: `middle`,
                        display: `inline-block`
                      } }>
                        <strong>[ Invite your followers to join ]</strong>
                      </span>
                    </a>
                  </div>
                ) : (
                  !this.props.loggedIn ? (
                    <div onClick={ () => this.props.login() } style={ { cursor: `pointer` } }>
                      <span style={ {
                        verticalAlign: `middle`,
                        display: `inline-block`
                      } }>
                        <strong>[ Login to join game? ]</strong>
                      </span>
                    </div>
                  ) : (
                    <div onClick={ () => this.joinGame() } style={ { cursor: `pointer` } }>
                      <span style={ {
                        verticalAlign: `middle`,
                        display: `inline-block`
                      } }>
                        <strong>[ Join as White? ]</strong>
                      </span>
                    </div>
                  )
                )
              }
            </div>
            <div style={ {
              display: `inline-block`,
              verticalAlign: `middle`,
              margin: `0 15px`
            } }><strong> vs. </strong></div>
            <div style={ {
              display: `inline-block`,
              verticalAlign: `middle`
            } }>
              { 
                this.state.black.length > 0 ? (
                  <div>
                    <span style={ {
                      verticalAlign: `middle`,
                      display: `inline-block`
                    } }>
                      <img 
                        src={ this.state.black_user.img } 
                        alt={ this.state.black_user.name }
                        style={ {
                          marginRight: 10
                        } } />
                    </span>
                    <span style={ {
                      verticalAlign: `middle`,
                      display: `inline-block`
                    } }>
                      <strong>{ playing_as == `black` ? `You` : this.state.black_user.name }</strong>
                    </span>
                  </div>
                ) : playing_as.length > 0 ? (
                  <div>
                    {
                      this.state.canSwitch ? (
                        <div onClick={ () => this.switchTo(`black`) } style={ { cursor: `pointer` } }>
                          <span style={ {
                            verticalAlign: `middle`,
                            display: `inline-block`
                          } }>
                            <strong>[ Switch to Black? ]</strong>
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span style={ {
                            verticalAlign: `middle`,
                            display: `inline-block`
                          } }>
                            <strong>[ Waiting for player to join ]</strong>
                          </span>
                        </div>
                      )
                    }
                    <a 
                      target="_blank"
                      href={ this.tweet(`I'm looking for a player to 
                                         play black
                                         https://chs.xyz/${ this.props.params.slug }`) } 
                      style={ { cursor: `pointer`, display: `block`, color: `black` } }>
                      <span style={ {
                        verticalAlign: `middle`,
                        display: `inline-block`
                      } }>
                        <strong>[ Invite your followers to join ]</strong>
                      </span>
                    </a>
                  </div>
                ) : (
                  !this.props.loggedIn ? (
                    <div onClick={ () => this.props.login() } style={ { cursor: `pointer` } }>
                      <span style={ {
                        verticalAlign: `middle`,
                        display: `inline-block`
                      } }>
                        <strong>[ Login to join game? ]</strong>
                      </span>
                    </div>
                  ) : (
                    <div onClick={ () => this.joinGame() } style={ { cursor: `pointer` } }>
                      <span style={ {
                        verticalAlign: `middle`,
                        display: `inline-block`
                      } }>
                        <strong>[ Join as Black ]</strong>
                      </span>
                    </div>
                  )
                )
              }
            </div>
          </div>
          <h2 style={ {
            textAlign: `center`,
            margin: 0,
            marginTop: 15,
            fontSize: 24
          } }>
            <span>
              {
                this.state.board.turn == playing_as ?
                `Your move!` :
                `${ this.state.board.turn.charAt(0).toUpperCase() }${ this.state.board.turn.substr(1) } to move`
              }
            </span>
          </h2>
          <h3 style={ {
            textAlign: `center`,
            margin: 0,
            marginTop: 15,
            display: `none` // TODO: add users to spectating when game is loaded
          } }>
            { this.state.spectators.length } users spectating
          </h3>

          <Board
            playing_as={ playing_as }
            board={ this.state.board }
            possibilities={ possibilities }
            guards={ guards }
            selectPiece={ (i) => this.selectPiece(i) }
            movePiece={ (i) => this.movePiece(i) }
            capturePiece={ (i) => this.capturePiece(i) }
            setHoveringPiece={ (i) => this.setHoveringPiece(i) } />
        </section>
        <Paper style={ { 
          textAlign: `left`,
          position: `absolute`,
          width: 300,
          height: 400,
          background: `white`,
          borderBottomWidth: 0,
          bottom: this.state.logOpen ? 0 : -360,
          left: 270
        } }>
          <span style={ {
            height: 40,
            lineHeight: `40px`,
            background: `#e6e6e6`,
            display: `block`,
            padding: `0 15px`,
            cursor: `pointer`
          } } onClick={ () => this.toggleLogOpen() }>Game Log</span>
          <div style={ {
            padding: 15
          } }>
            {
              this.state.board.log.length > 0 ? (
                <ol>
                  {
                    (() => {
                      let ret = [];

                      for (let i = 0; i < this.state.board.log.length; i += 2) {
                        ret.push(
                          <li key={ i }>
                            { this.state.board.log[i][0] }
                            { 
                              this.state.board.log[i + 1] ?
                              ` ${ this.state.board.log[i + 1][0] }` :
                              ``
                            }
                          </li>
                        );
                      }

                      return ret;
                    })()
                  }
                </ol>
              ) : 
              `no moves.`
            }
          </div>
        </Paper>

        <div style={ { 
          textAlign: `left`,
          position: `absolute`,
          width: 300,
          height: 400,
          background: `white`,
          border: `2px solid #0C0000`,
          borderBottomWidth: 0,
          bottom: this.state.chatOpen ? 0 : -360,
          right: 270,
          display: `none` // TODO: add chat functionality
        } } ref="chat">
          <span style={ {
            height: 40,
            lineHeight: `40px`,
            background: `#e6e6e6`,
            display: `block`,
            padding: `0 15px`,
            cursor: `pointer`
          } } onClick={ () => this.toggleChatOpen() }>Game Chat</span>
          <div style={ {
            padding: 15
          } }>
            <ul>
              {
                this.state.chatLog.map((msg, i) => (
                  <li key={ i } className={ `chat-msg ${ msg.player }` }>
                    <span className="time-stamp">[{ (() => {
                      let date = new Date(msg.created_at);
                      return (date.getMonth() + 1).toString() + 
                              `/` + 
                              (date.getDate()).toString() + 
                              `/` + 
                              (date.getFullYear()).toString() + 
                              ` ` + 
                              (date.getHours()).toString() + 
                              `:` + 
                              (date.getMinutes()).toString() + 
                              `:` + 
                              (date.getSeconds()).toString();
                    })() }]</span>
                    <span className="player">{ msg.player }</span>
                    : <span dangerouslySetInnerHTML={ { __html: msg.text } } />
                  </li>
                ))
              }
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

if (process.env.NODE_ENV !== `production`) {
  BoardPage.propTypes = {

  };
}

export default BoardPage;
