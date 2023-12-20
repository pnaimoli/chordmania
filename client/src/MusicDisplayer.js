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
        this.osmd.load(this.props.file).then(() => {this.osmd.render(); });
    }

    componentDidUpdate(prevProps) {
      if (this.props.file !== prevProps.file) {
        this.osmd.load(this.props.file).then(() => {this.osmd.render(); });
      }
    }

    componentWillUnmount() {
    }

    render() {
      return (<div ref={this.divRef} />);
    }
}
