/**
 * @author FrominXu
 */

const CWrap = props => {
  const { itemChildren = null,style, ...other } = props;
  console.log('CWrap:', other, itemChildren.props)
  return (
    <div style={style}>
      {itemChildren && React.createElement(itemChildren, other)}
    </div>
  )
}
export default CWrap;
