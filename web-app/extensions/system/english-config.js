/* eslint-disable quotes */
/* eslint-disable quote-props */
// 自定义一个多语言转换的描述规则
const configs = [
  {
    "id": "header",
    "attributes": {
      "title": "Goods check-in"
    }
  },
  {
    "id": "goodsType",
    "attributes": {
      "label": "Goods type",
      "placeholder": "please select goods type",
      "rules": [
        {
          "required": true,
          "message": "please select goods type"
        }
      ]
    }
  },
  {
    "id": "goodsId",
    "attributes": {
      "label": "Goods name",
      "placeholder": "please select goods",
      "rules": [
        {
          "required": true,
          "message": "please select goods"
        }
      ]
    }
  },
  {
    "id": "warehouse",
    "attributes": {
      "label": "Warehouse",
      "placeholder": "please select warehouse",
      "rules": [
        {
          "required": true,
          "message": "please select warehouse"
        }
      ]
    }
  },
  {
    "id": "quantity",
    "attributes": {
      "label": "quantity",
      "placeholder": "quantity",
      "rules": [
        {
          "required": true,
          "message": "please input a quantity"
        },
        {
          "type": "integer",
          "message": "need integer"
        }
      ]
    }
  },
  {
    "id": "submitBtn",
    "attributes": {
      "label": "submit and create warehousing entry"
    }
  },
  {
    "id": "notes",
    "attributes": {
      "label": "notes",
      "placeholder": "notes"
    }
  }
];
export default configs;
