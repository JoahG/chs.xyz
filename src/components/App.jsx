'use strict';

import React from 'react';
import GameList from './GameList.jsx';
import db from '../helpers/ApiHelper.js';
import Piece from './Piece.jsx';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import FlatButton from 'material-ui/FlatButton';
import Drawer from 'material-ui/Drawer';

class App extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      loggedIn: false,
      auth: {},

      leftDrawerOpen: true,
      rightDrawerOpen: true
    };
  }

  componentDidMount() {
    let id = localStorage.getItem(`identity`);
    if (id) {
      id = id.split(`,`);

      let cred = db.auth.TwitterAuthProvider.credential(id[0], id[1]);

      db.auth().signInWithCredential(cred).catch((err) => {
        return err;
      }).then((user) => {
        this.setState({
          loggedIn: true,
          auth: user
        });
      });
    }
  }

  login() {
    return db.authWithOAuthPopup(`twitter`, (err, auth) => {
      if (err) return false;

      localStorage.setItem(`identity`, `${ auth.credential.accessToken },${ auth.credential.secret }`);

      this.setState({
        loggedIn: true,
        auth: auth.user
      });
    });
  }

  logout() {
    this.setState({
      loggedIn: false,
      auth: {}
    });

    return db.unauth();
  }

  render() {
    return (
      <div>
        <AppBar
          title="chs.xyz"
          zDepth={ 2 }
          iconStyleLeft={ {
            marginTop: 0
          } }
          iconElementLeft={ 
            <IconButton style={ {
              height: 64
            } }>
              <Piece color="white" type="knight" />
            </IconButton>
          }
          iconElementRight={ 
            !this.state.loggedIn ? (
              <FlatButton onClick={ () => this.login() }>
                Login with Twitter
              </FlatButton>
            ) : (
              <FlatButton onClick={ () => this.logout() }>
                Logged in as { this.state.auth.displayName }, Logout?
              </FlatButton>
            )
          }
        />
        <Drawer 
          open={ this.state.leftDrawerOpen }
          containerStyle={ {
            height: `calc(100% - 64px)`,
            bottom: 0,
            top: `auto`
          } }>
          <GameList
            login={ () => this.login() }
            loggedIn={ this.state.loggedIn }
            auth={ this.state.auth } />
        </Drawer>
        <main style={ {
          maxWidth: `calc(100vw - 512px)`,
          margin: `auto`,
          textAlign: `center`
        } }>
          { 
            React.Children.map(this.props.children, (el) => {
              return React.cloneElement(el, {
                ...el.props,
                loggedIn: this.state.loggedIn,
                auth: this.state.auth,
                login: () => this.login()
              });
            })
          }
        </main>
        <Drawer 
          open={ this.state.rightDrawerOpen }
          openSecondary={ true }
          containerStyle={ {
            height: `calc(100% - 64px)`,
            bottom: 0,
            top: `auto`
          } }>
          <GameList 
            login={ () => this.login() } 
            loggedIn={ this.state.loggedIn } 
            mine={ true } 
            auth={ this.state.auth } />
        </Drawer>
      </div>
    );
  }
}

export default App;
