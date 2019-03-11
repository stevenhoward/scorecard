import React, { Component, CSSProperties } from 'react';

interface FielderDiagramProps {
  onFielderSelected: (result: string) => void;

  allowMultiple: boolean;
}

interface FielderDiagramState {
  result: string;
}

export default class SelectFielder extends Component<FielderDiagramProps, FielderDiagramState> {
  constructor(props: FielderDiagramProps) {
    super(props);
    this.state = { result: '' };
  }

  handleClick(position: number) {
    if (!this.props.allowMultiple) {
      this.setState({ result: '' + position });
      this.props.onFielderSelected('' + position);
      return;
    }

    let result = this.state.result;
    if (result.length > 0) {
      result += '-';
    }

    result += position;
    this.setState({ result: result })
  }

  render() {
    const divStyle: CSSProperties = { minHeight: 200, width: 200, margin: '0 auto', textAlign: 'center' };

    return (
      <div style={divStyle}>
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="fielder-selector">
          <path stroke="black" fill="none"
            d="M 50, 100
            L 75, 75
            L 50, 50
            L 25, 75
            Z"/>
          <path stroke="black" fill="none"
            d="M 25, 75
            L 1, 50
            A 1 1 90 0 1 99,50
            L 75, 75" />
          <text x={48} y={75} onClick={() => this.handleClick(1)}>1</text>
          <text x={48} y={96} onClick={() => this.handleClick(2)}>2</text>
          <text x={73} y={68} onClick={() => this.handleClick(3)}>3</text>
          <text x={60} y={54} onClick={() => this.handleClick(4)}>4</text>
          <text x={23} y={68} onClick={() => this.handleClick(5)}>5</text>
          <text x={34} y={54} onClick={() => this.handleClick(6)}>6</text>
          <text x={15} y={35} onClick={() => this.handleClick(7)}>7</text>
          <text x={48} y={15} onClick={() => this.handleClick(8)}>8</text>
          <text x={83} y={35} onClick={() => this.handleClick(9)}>9</text>
        </svg>
        <p>{this.state.result}&nbsp;</p>
        <button onClick={() => this.props.onFielderSelected(this.state.result)}>Done</button>
      </div>
    );
  }
}
