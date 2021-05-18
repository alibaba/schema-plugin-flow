
module.exports = {
  // 描述扩展件对应的打包路径与资源地址
  sysExtTypes: [
    {
      label: '控制台日志插件',
      value: 'openlogger',
      path: "./extensions/system/openlogger.js",
      url: 'openlogger.js'
    },
    {
      label: '切换英文版插件', value: 'english',
      path: "./extensions/system/english.js",
      url: 'english.js'
    },
    {
      label: '显示系统消息插件', value: 'notice',
      path: "./extensions/system/notice.js",
      url: 'notice.js'
    }
  ],
  customerTyps: [
    {
      label: '客户A插件',
      value: 'customer-a',
      description: "客户A有化学品货物，需要提示入库要求，仍要提交需要验证操作员入库授权码 (演示：6个9)",
      path: "./extensions/customerA/index.js",
      url: "customer-a.js",
    },
    {
      label: '客户B插件',
      value: 'customer-b',
      description: "客户B在选择仓库时，需要能即时查询库存容量状态，以便选择最合适的仓库",
      path: "./extensions/customerB/index.js",
      url: "customer-b.js",
    },
    {
      label: '客户C插件',
      value: 'customer-c',
      description: "客户C需要保存其它信息，以便后续查阅：货物检查说明、货车车牌、司机姓名、联系方式等",
      path: "./extensions/customerC/index.js",
      url: "customer-c.js",
    }
  ]
}