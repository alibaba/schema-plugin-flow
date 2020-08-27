---
title: use-mplg-optimize
order: 3
---
`sifo-react` is 'top-down' rendering type, you can use the modelPlugin  `@schema-plugin-flow/sifo-mplg-react-optimize` to optimize the rerendering in complex project.

#### without optimize
```jsx
import React from 'react';
import SifoApp from '@schema-plugin-flow/sifo-react';
const schema = {
  component: "Container",
  children: [
    {
      component: "Input",
      attributes: {
        name: 'input_01'
      }
    },
    {
      component: "Container",
      children: [
        {
          component: "Input",
          attributes: {
            name: 'input_02'
          }
        },
        {
          component: "Container",
          children: [
            {
              component: "Input",
              attributes: {
                name: 'input_03'
              }
            },
            {
              component: "Input",
              attributes: {
                name: 'input_04'
              }
            }
          ]
        },
        {
          component: "Input",
          attributes: {
            name: 'input_05'
          }
        }
      ]
    },
    {
      component: "Input",
      attributes: {
        name: 'input_06'
      }
    }
  ]
};
const components = {
  'Container': (props) => (
    <div style={{ margin: "8px", border: "1px solid #ccc" }} {...props}></div>
  ),
  'Input': (props) => {
    return (
      <div style={{ margin: "8px" }}>&nbsp;&nbsp;
        {props.name}: <input {...props} />&nbsp;&nbsp;
        rerendered: {new Date().getMilliseconds()}
      </div>
    );
  }
};
const pagePlugin = {
  onPageInitial: params => {
    const { event, mApi } = params;
    mApi.queryNodeIds('component==Input').forEach(id => {
      mApi.addEventListener(id, 'onChange', (ctx, e) => {
        mApi.setAttributes(id, {
          value: e.target.value
        })
      })
    })
  },
};
const Demo = props => {
  return (
    <SifoApp
      namespace="use-mplg-optimize"
      schema={schema}
      components={components}
      plugins={[{ pagePlugin }]}
    />
  );
}
export default Demo;
```

#### with optimize
```jsx
import React from 'react';
import SifoApp from '@schema-plugin-flow/sifo-react';
import ReactOptimizeModelPlugin from '@schema-plugin-flow/sifo-mplg-react-optimize';
const schema = {
  component: "Container",
  children: [
    {
      component: "Input",
      attributes: {
        name: 'input_01'
      }
    },
    {
      component: "Container",
      children: [
        {
          component: "Input",
          attributes: {
            name: 'input_02'
          }
        },
        {
          component: "Container",
          children: [
            {
              component: "Input",
              attributes: {
                name: 'input_03'
              }
            },
            {
              component: "Input",
              attributes: {
                name: 'input_04'
              }
            }
          ]
        },
        {
          component: "Input",
          attributes: {
            name: 'input_05'
          }
        }
      ]
    },
    {
      component: "Input",
      attributes: {
        name: 'input_06'
      }
    }
  ]
};
const components = {
  'Container': (props) => (
    <div style={{ margin: "8px", border: "1px solid #ccc" }} {...props}></div>
  ),
  'Input': (props) => {
    return (
      <div style={{ margin: "8px" }}>&nbsp;&nbsp;
        {props.name}: <input {...props} />&nbsp;&nbsp;
        rerendered: {new Date().getMilliseconds()}
      </div>
    );
  }
};
const pagePlugin = {
  onPageInitial: params => {
    const { event, mApi } = params;
    mApi.queryNodeIds('component==Input').forEach(id => {
      mApi.addEventListener(id, 'onChange', (ctx, e) => {
        mApi.setAttributes(id, {
          value: e.target.value
        })
      })
    })
  },
};
const Demo = props => {
  return (
    <SifoApp
      namespace="use-mplg-optimize"
      schema={schema}
      components={components}
      plugins={[{ pagePlugin, modelPlugin: ReactOptimizeModelPlugin }]}
    />
  );
}
export default Demo;
```