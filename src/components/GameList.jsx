'use strict';

import React from 'react';
import { Link, browserHistory } from 'react-router';
import { List, ListItem } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import ChessBoard from '../vendor/chess.js';
import db from '../helpers/ApiHelper.js';

let games_unparsed = [];

class GameList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      games: []
    };
  }

  componentDidMount() {
    this.dbListener = db.listenTo(`games`, {
      context: this,
      state: `games`,
      asArray: true,
      then: (games) => {
        games_unparsed = games;

        this.setState({
          games: games.map((game) => {
            let board = new ChessBoard();
            board.restore(JSON.parse(game.board));

            return {
              slug: game.key,
              turn: board.turn,
              me: this.props.loggedIn && this.props.auth && this.props.auth.uid ?
                      this.props.auth.uid === game.white ?
                      `white` :
                      this.props.auth.uid === game.black ?
                      `black` :
                      `` :
                    ``,
              white: game.white,
              black: game.black
            };
          })
        });
      }
    });
  }

  componentDidUpdate(prevProps) {
    if (JSON.stringify(this.props.auth) !== JSON.stringify(prevProps.auth)) {
      this.setState({
        games: games_unparsed.map((game) => {
          let board = new ChessBoard();
          board.restore(JSON.parse(game.board));

          return {
            slug: game.key,
            turn: board.turn,
            me: this.props.loggedIn && this.props.auth && this.props.auth.uid ?
                    this.props.auth.uid === game.white ?
                    `white` :
                    this.props.auth.uid === game.black ?
                    `black` :
                    `` :
                  ``,
            white: game.white,
            black: game.black
          };
        })
      });
    }
  }

  componentWillUnmount() {
    this.props.route.db.removeBinding(this.dbListener);
  }

  createNewGame() {
    db.push(`/games`, {
      data: {
        board: (new ChessBoard()).export(),
        isOpen: true,
        white: this.props.auth.uid,
        white_user: {
          name: this.props.auth.displayName,
          img: this.props.auth.photoURL
        },
        canSwitch: true
      },
      then: (err) => {
        if (err) return false;
      }
    }).then((game) => {
      browserHistory.push(`/${ game.key }`);
    });
  }

  render() {
    return (
      <List>
        <Subheader>
          {
            this.props.mine ?
            `Your Games` :
            `All Games`
          }
        </Subheader>
          {
            this.state.games.filter((game) => {
              if (this.props.mine) return game.me.length > 0;
              return true;
            }).map((game, i) => (
              <ListItem key={ i }
                primaryText={ 
                  game.slug.substring(game.slug.length - 4, game.slug.length).toUpperCase() + (
                    this.props.mine ? game.turn == game.me ? ` (your turn)` : ` (their turn)` : ``
                  )
                }
                secondaryText={ 
                  !this.props.mine ? (
                    (!game.white || !game.white.length > 0) ?
                    `Looking for player to play white` :
                    (!game.black || !game.black.length > 0) ?
                    `Looking for player to play black` :
                    `Game is full`
                  ) : (
                    game.me && game.me.length > 0 ?
                    `\n You're playing as ${ game.me }` :
                    ``
                  )
                }
                containerElement={ <Link to={ `/${ game.slug }` } /> }
              />
            ))
          }
          {
            this.props.loggedIn ? (
              <ListItem
                primaryText="New Game"
                onTouchTap={ () => this.createNewGame() } />
            ) : (
              <ListItem
                primaryText="Login to play"
                onTouchTap={ () => this.props.login() } />
            )
          }

          {
            !this.props.mine ? (
              <div>
                <Subheader>More</Subheader>
                <a 
                  style={ { textDecoration: `none`, color: `black` } } 
                  href="http://github.com/joahg/chs.xyz" 
                  target="_blank">
                  <ListItem primaryText="chs.xyz on GitHub" />
                </a>
                <a 
                  style={ { textDecoration: `none`, color: `black` } } 
                  href="https://twitter.com/chsxyz" 
                  target="_blank">
                  <ListItem primaryText="chs.xyz on Twitter" />
                </a>
                <a 
                  style={ { textDecoration: `none`, color: `black` } } 
                  href="http://www.joahg.com" 
                  target="_blank">
                  <ListItem primaryText="Creator Info" />
                </a>
                <a 
                  style={ { textDecoration: `none`, color: `black` } } 
                  href="https://patreon.com/user?u=4554298" 
                  target="_blank">  
                  <ListItem primaryText="Creator Patreon" />
                </a>
              </div>
            ) : ``
          }
      </List>
    );
  }
}

GameList.defaultProps = {
  mine: false
};

if (process.env.NODE_ENV !== `production`) {
  GameList.propTypes = {
    mine: React.PropTypes.bool.isRequired
  };
}

export default GameList;
