import React, { Component } from 'react';
import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay';

export default class MusicDisplayer extends Component {
    constructor(props) {
      super(props);
      this.osmd = undefined;
      this.divRef = React.createRef();
    }

    componentDidMount() {
      if (!this.osmd) {
        const options = {
          autoResize: true,
          drawTitle: true,
          followCursor: true,
        };
        this.osmd = new OSMD(this.divRef.current, options);
      }
        this.osmd.load(this.props.file).then(() => {
          this.osmd.render();
          this.initializeCursor();
        });
    }

    componentDidUpdate(prevProps) {
      if (this.props.file !== prevProps.file) {
        this.osmd.load(this.props.file).then(() => {
          this.osmd.render();
          this.initializeCursor();
        });
      }
    }

    componentWillUnmount() {
    }

    initializeCursor() {
      if (this.osmd.cursor) {
        this.osmd.cursor.show();
        this.osmd.cursor.reset();
      } else {
        this.osmd.cursor = new OSMD.Cursor(this.osmd); // Create cursor if it doesn't exist
        this.osmd.cursor.show();
      }
    }

    advanceCursor() {
      const cursor = this.osmd.cursor;
      if (cursor.iterator.endReached) {
        return false;
      }

      cursor.next();
      this.osmd.render();
      return true;
    }

    rewind() {
      const cursor = this.osmd.cursor;
      cursor.reset();
      this.osmd.render();
    }

    render() {
      return (<div ref={this.divRef} />);
    }
}