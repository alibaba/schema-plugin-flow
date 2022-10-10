// 配置文件内容
export default {
  // 配置项
  favicon: '/sifo.ico',
  logo: '/sifo.png',
  mode: "site",
  resolve: {
    includes:['docs', 'packages']
  },
  menus: {
    '/guide': [
      {
        title: 'Introduction',
        // 对应的 Markdown 文件，路径是相对于 resolve.includes 目录识别的
        //path: '../guide/description',
        children: [
          {
            title: "description",
            path: "../guide/description"
          }
        ]
      },
      {
        title: 'packages',
        children: [
          {
            title: "sifo-model",
            path: '../sifo-model'
          },
          {
            title: "sifo-react",
            path: '../sifo-react'
          },
          {
            title: "sifo-mplg-react-optimize",
            path: '../sifo-mplg-react-optimize'
          },
          {
            title: "sifo-mplg-form-core",
            path: '../sifo-mplg-form-core'
          },
          {
            title: "sifo-mplg-form-antdv",
            path: '../sifo-mplg-form-antdv'
          }, 
          {
            title: "sifo-mplg-form-antd",
            path: '../sifo-mplg-form-antd'
          }, 
          {
            title: "sifo-vue",
            path: '../sifo-vue'
          },
          {
            title: "sifo-singleton",
            path: '../sifo-singleton'
          }
        ]
      },
      {
        title: 'Other',
       
      }
    ],
    'sifo-model': [
      {
        title: "Introduction",
        path: "../sifo-model"
      },
      {
        title: "sifo-react",
        path: "../sifo-react"
      }
    ]
  },
  navs: [
    {
      title: 'Description',
      path: '/guide',
    },
    {
      title: 'sifo-react-demo',
      path: '/sifo-react-doc',
    },
    {
      title: 'sifo-vue-demo',
      path: '//localhost:8080',
    },
    {
      title: 'GitHub',
      path: 'https://github.com/alibaba/schema-plugin-flow',
    }
  ],
};
