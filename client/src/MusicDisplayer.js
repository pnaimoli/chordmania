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
          autoResize: this.props.autoResize !== undefined ? this.props.autoResize : true,
          drawTitle: this.props.drawTitle !== undefined ? this.props.drawTitle : true,
        };
        this.osmd = new OSMD(this.divRef.current, options);      }
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
      const note = cursor.iterator.currentNote;
      if (note) {
        cursor.next();
        this.osmd.render();
        return true;
      }
      return false;
    }

    render() {
      return (<div ref={this.divRef} />);
    }
}
