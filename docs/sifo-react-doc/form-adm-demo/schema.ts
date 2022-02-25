export default {
  templateCode: '模板协议编码',
  templateName: '模板协议名称',
  request: '数据共享',
  actionRules: '页面联动规则',
  fieldDependencies: '后端的字段依赖配置',
  plugins: '页面业务插件资源，承载页面定制业务逻辑',
  viewSchemaType: 'list',
  viewSchema: {
    "component": "Form",
    "id": "$form",
    "attributes": {
      "className": "stage-form-mobile-demo"
    },
    "children": [
      {
        component:'None'
      },
      {
        "id": "subject",
        "component": "Input",
        "attributes": {
          "dataType": "text",
          "name": "subject",
          "label": "询价商品",
          "maxLength": 30,
          "placeholder": "请详述您的需求",
          "rules": [{
            "required": true
          }]
        }
      },
      {
        "id": "subject1",
        "component": "Input",
        "attributes": {
          "dataType": "text",
          "name": "subject1",
          "label": "询价商品1",
          "labelAlign": "left",
          "maxLength": 30,
          "placeholder": "左右布局",
          "description": "这是描述",
          "rules": [{
            "required": true
          }]
        }
      },
      {
        "id": "cascadetest",
        "component": "CascaderPicker",
        "attributes": {
          "dataType": "text",
          "name": "cascadetest",
          "label": "异步级联",
          "placeholder": "异步级联",
          "rules": [{
            "required": true
          }]
        }
      },
      {
        "component": "TextArea",
        "id": "productFeature",
        "attributes": {
          "dataType": "text",
          "name": "productFeature",
          "label": "详细要求",
          "maxLength": 30,
          "autoHeight": true,
          "placeholder": "请详述您的需求"
        }
      },
      {
        "component": "SplitPanel",
        "children":[
          {
            "component": "NumberInput",
            "id": "purchaseAmount",
            "attributes": {
              "dataType": "number",
              "name": "purchaseAmount",
              "label": "采购数量",
              "placeholder": "请输入数量",
              "precision": 0,
              "rules": [{
                "required": true
              }, {
                "min":1
              }]
            }
          },
          {
            "component": "Input",
            "attributes": {
              "id": "unit",
              "name": "unit",
              "label": "单位",
              "placeholder": "单位",
              "dataType": "text",
              "dataSource": [],
              "maxLength": 5,
              "rules": [{
                "required": true
              }]
            }
          }
        ]
      },
      {
        "component": "NumberInput",
        "id": "planPurchasePrice",
        "attributes": {
          "dataType": "number",
          "name": "planPurchasePrice",
          "label": "采购预算",
          "placeholder": "请输入采购预算",
          "extra": "元",
          "precision": 2,
          "moneyKeyboardAlign": "left",
          "rules": [{
            "required": true
          }]
        }
      },
      {
        "component": "ImageUploader",
        "attributes": {
          "id": "attachments",
          "name": "attachments",
          "label": "参考图片",
          "hideLabel": false
        }
      },
      {
        "component": "DatePicker",
        "attributes": {
          "dataType": "dateTime",
          "id": "gmtQuotationExpire",
          "name": "gmtQuotationExpire",
          "label": "报价截止时间",
          "rules": [{
            "required": true
          }]
        }
      },
      {
        "component": "DateRangePicker",
        "attributes": {
          "id": "receivedDate",
          "name": "receivedDate",
          "dataType": "date",
          "label": "日期范围",
          "valueFormat": [
            "receivedBeginDate",
            "receivedEndDate"
          ],
          "rules": [{
            "required": true
          }]
        }
      },
      {
        "component": "Picker",
        "attributes": {
          "id": "contactInfomation",
          "name": "contactInfomation",
          "label": "是否允许商家与您联系",
          "dataSource": [
            {
              "label": "公开",
              "value": "openContact2All"
            },
            {
              "label": "报价后可见",
              "value": "openContactAfterQuotation"
            }
          ],
          "rules": [{
            "required": true
          }]
        }
      },
      {
        "component": "Radio",
        "attributes": {
          "id": "invoiceType",
          "name": "invoiceType",
          "label": "发票类型",
          "defaultValue": "no",
          "dataSource": [
            {
              "label": "增值税专票（一般纳税人开具）",
              "value": "vatSelf"
            },
            {
              "label": "增值税专票（不限开具方）",
              "value": "vat"
            },
            {
              "label": "增值税普通发票",
              "value": "common"
            },
            {
              "label": "不需要发票",
              "value": "no"
            }
          ],
          "rules": [{
            "required": true
          }]
        }
      },
      {
        "component": "Checkbox",
        "attributes": {
          "id": "quotationRequirement",
          "name": "quotationRequirement",
          "multiple": true,
          "label": "报价要求",
          "dataSource": [
            {
              "label": "报价含税",
              "value": "includeTax"
            },
            {
              "label": "报价需要包含运费",
              "value": "quoteHasPostFee"
            },
            {
              "label": "允许对询价单部分物料报价",
              "value": "allowPartOffer"
            },
            {
              "label": "供应商报价可改数量",
              "value": "supplierCanModifyQuantity"
            }
          ],
          "rules": [{
            "required": true
          }]
        }
      },
      {
        "component": "Container",
        "children": [{
            "component": "Button",
            "attributes": {
              "id": "submitBtn",
              "block": true,
              "color":"primary",
              "type": "primary",
              "label": "提交"
            }
          },
          {
            "component": "Button",
            "attributes": {
              "id": "resetBtn",
              "block": true,
              "type": "normal",
              "label": "重置"
            }
          }
        ],
        "attributes": {
          "id": "footerBar"
        }
      },
      {
        "component": "Container",
        "children": [{
            "component": "Button",
            "attributes": {
              "id": "testbtn",
              "block": true,
              "className": "pcp-subject1",
              "dataType": "text",
              "label": "设置值与属性"
            }
          },
          {
            "component": "Button",
            "attributes": {
              "id": "btngetvalue",
              "block": true,
              "className": "pcp-subject1",
              "dataType": "text",
              "label": "获取数据"
            }
          }
        ]
      }
    ]
  }
  ,
};
