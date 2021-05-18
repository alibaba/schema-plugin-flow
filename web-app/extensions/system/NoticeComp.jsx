import React from 'react';
import './notice.less';

window.nnn = React;
class Notice extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      numbers: [
        { id: '1', message: '仓库容量更新>>' },
        { id: '2', message: '张三新入库了一批货物' },
        { id: '3', message: '有新的入库申请，请尽快处理>>' }
      ],
      animate: false
    };
  }

  componentDidMount = () => {
    setInterval(this.Dt, 2000);
  }

  Dt = () => {
    this.setState({ animate: true }); // 进行动画滚动
    setTimeout(() => {
      const [first, ...others] = this.state.numbers;
      const newNumbers = [...others, first];
      // 滚动后将消息向最后移，此时当前位置就是第一个消息位置，不进行动画
      this.setState({
        numbers: newNumbers,
        animate: false
      });
    }, 1000);
  }

  render() {
    return (
      <div className="cosultation-wrap">
        <a href="./">
          <div className="cosulation-news">
            <div className={this.state.animate ? 'anim' : ''}>
              {this.state.numbers.map(item => (
                <div className="consulation-news-item" key={item.id}>
                  {item.message}
                </div>
              ))}
            </div>
          </div>
        </a>
      </div>
    );
  }
}
export default Notice;

