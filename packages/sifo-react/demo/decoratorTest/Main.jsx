import React from 'react';
import Target from './Target';

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      render: true
    }
  }
  rerender = () => {
    this.setState({
      test: new Date().getMilliseconds().toString()
    })
  }
  destroy = () => {
    this.setState({
      render: !this.state.render
    });
  }
  render() {
    return <div className="decorator-test">
      <button onClick={this.rerender}>重渲染</button>
      <button onClick={this.destroy}>销毁/渲染</button>
      {
        this.state.render && (
          <div>
            <div>实例一</div>
            <Target id='1' />
            ==================================
            <div>实例二</div>
            {
              <Target id='2' />
            }
          </div>
        )
      }
    </div>
  }
}
export default Main;