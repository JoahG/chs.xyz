'use strict';

import React from 'react';
import GameList from './GameList.jsx';
import db from '../helpers/ApiHelper.js';
import Piece from './Piece.jsx';
import AppBar from 'material-ui/AppBar';
import FlatButton from 'material-ui/FlatButton';
import Drawer from 'material-ui/Drawer';

class App extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      loggedIn: false,
      auth: {},

      leftDrawerOpen: window.innerWidth > 991,
      rightDrawerOpen: window.innerWidth > 991,
      drawersAsOverlays: window.innerWidth < 991,
      width: window.innerWidth,
      height: window.innerHeight
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

    window.onresize = () => {
      this.setState({
        leftDrawerOpen: window.innerWidth > 991,
        rightDrawerOpen: window.innerWidth > 991,
        drawersAsOverlays: window.innerWidth < 991,
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
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

    localStorage.removeItem(`identity`);

    return db.unauth();
  }

  toggleLeftDrawerOpen(open = !this.state.leftDrawerOpen) {
    let state = {
      leftDrawerOpen: open,
    };

    if (this.state.drawersAsOverlays) {
      state.rightDrawerOpen = false;
    }

    this.setState(state);
  }

  toggleRightDrawerOpen() {
    let state = {
      rightDrawerOpen: !this.state.rightDrawerOpen
    };

    if (this.state.drawersAsOverlays) {
      state.leftDrawerOpen = false;
    }

    this.setState(state);
  }

  render() {
    return (
      <div>
        <AppBar
          title="chs.xyz"
          zDepth={ 2 }
          style={ {
            background: `#231F20`,
            padding: 0
          } }
          iconStyleLeft={ {
            marginTop: 0,
            marginLeft: 0
          } }
          iconElementLeft={ 
            <FlatButton style={ {
              height: 64
            } } onTouchTap={ () => this.toggleLeftDrawerOpen() }>
              <Piece color="white" type="knight" style={ { maxHeight: 40, marginTop: 12 } } />
            </FlatButton>
          }
          iconStyleRight={ {
            marginRight: 0,
            marginTop: 0
          } }
          iconElementRight={ 
            <div>
              {
                !this.state.loggedIn ? (
                  <FlatButton onTouchTap={ () => this.login() } style={ {
                    paddingLeft: 15,
                    paddingRight: 15,
                    color: `white`,
                    height: 64,
                    verticalAlign: `middle`
                  } }>
                    Login
                    {
                      this.state.width > 600 ?
                      ` with Twitter` :
                      ``
                    }
                  </FlatButton>
                ) : (
                  <FlatButton onTouchTap={ () => this.logout() } style={ {
                    paddingLeft: 15,
                    paddingRight: 15,
                    color: `white`,
                    height: 64,
                    verticalAlign: `middle`
                  } }>
                    {
                      this.state.width > 600 ? 
                      `Logged in as ${ this.state.auth.displayName }, ` :
                      ``
                    }
                    Logout?
                  </FlatButton>
                )
              }

              <FlatButton style={ {
                height: 64,
                verticalAlign: `middle`
              } } onTouchTap={ () => this.toggleRightDrawerOpen() }>
                <Piece color="white" type="king" style={ { maxHeight: 40, marginTop: 12 } } />
              </FlatButton>
            </div>
          }
        />
        <Drawer 
          open={ this.state.leftDrawerOpen }
          docked={ !this.state.drawersAsOverlays }
          onRequestChange={ (o) => this.toggleLeftDrawerOpen(o) }
          containerStyle={ {
            height: !this.state.drawersAsOverlays ? `calc(100% - 64px)` : `100%`,
            bottom: !this.state.drawersAsOverlays ? 0 : `auto`,
            top: this.state.drawersAsOverlays ? 0 : `auto`
          } }>
          <GameList
            login={ () => this.login() }
            loggedIn={ this.state.loggedIn }
            auth={ this.state.auth }
            closeDrawer={ () => { if (this.state.drawersAsOverlays) this.toggleLeftDrawerOpen(false); } } />
        </Drawer>
        <main style={ {
          maxWidth: `calc(100vw - (${ 
                                      this.state.leftDrawerOpen &&
                                      !this.state.drawersAsOverlays ? 
                                      `256px` : 
                                      `0px`
                                    } + 
                                   ${ 
                                      this.state.rightDrawerOpen &&
                                      !this.state.drawersAsOverlays ? 
                                      `256px` : 
                                      `0px`
                                    }))`,
          marginTop: `auto`,
          marginRight: this.state.rightDrawerOpen && !this.state.drawersAsOverlays ? `256px` : `auto`,
          marginBottom: `auto`,
          marginLeft: this.state.leftDrawerOpen && !this.state.drawersAsOverlays ? `256px` : `auto`,
          transition: `300ms all ease-in-out`,
          textAlign: `center`
        } }>
          { 
            React.Children.map(this.props.children, (el) => {
              return React.cloneElement(el, {
                ...el.props,
                loggedIn: this.state.loggedIn,
                auth: this.state.auth,
                login: () => this.login(),
                appWidth: this.state.width,
                appHeight: this.state.height
              });
            })
          }
        </main>
        <Drawer 
          open={ this.state.rightDrawerOpen }
          docked={ !this.state.drawersAsOverlays }
          onRequestChange={ (o) => this.toggleRightDrawerOpen(o) }
          openSecondary={ true }
          containerStyle={ {
            height: !this.state.drawersAsOverlays ? `calc(100% - 64px)` : `100%`,
            bottom: !this.state.drawersAsOverlays ? 0 : `auto`,
            top: this.state.drawersAsOverlays ? 0 : `auto`
          } }>
          <GameList 
            login={ () => this.login() } 
            loggedIn={ this.state.loggedIn } 
            mine={ true } 
            auth={ this.state.auth }
            closeDrawer={ () => { if (this.state.drawersAsOverlays) this.toggleRightDrawerOpen(false); } } />
        </Drawer>
      </div>
    );
  }
}

export default App;
