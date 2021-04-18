// 组件插件可以实现与组件相关的功能
const componentPlugin = {
  $mainContainer: {
    onComponentInitial: ({ event, mApi }) => {
      mApi.queryNodeIds('component==a-input').forEach(id => {
        mApi.addEventListener(id, 'change', (c, e) => {
          c.mApi.setAttributes(id, { value: e.target.value })
        });
      });
    }
  },
  tableId: {
    onComponentInitial: ({ event, mApi }) => {
      mApi.setAttributes(event.key, {
        scopedSlots: {
          name: function (text, record, index, column) {
            return mApi.renderSlot('t-name', { text, record, index, column });
          },
          address: (text, record, index, column) => {
            return text + "test";
          },
          notes: (text, record, index, column) => {
            return mApi.renderSlot('t-notes', { text, record, index, column })
          }
        },
        columns: [
          {
            dataIndex: 'name',
            key: 'name',
            slots: { title: 'customTitle' }, // 将title指向叫customTitle的子节点
            scopedSlots: { customRender: 'name' }, // 将customRender指向具名slot叫name的子节点
          },
          {
            title: 'Age',
            dataIndex: 'age',
            key: 'age',
            customRender: function (text, record, index, column) {
              return mApi.createElement('s-textcell', { props: { text, record, index, column } });
            }
            // scopedSlots: { customRender: 'age' }
          },
          {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
            scopedSlots: { customRender: 'address' },
          },
          {
            title: 'notes',
            dataIndex: 'notes',
            key: 'notes',
            scopedSlots: { customRender: 'notes' },
          }
        ],
        'data-source': [
          {
            key: '1',
            name: 'John Brown',
            age: 32,
            address: 'New York No. 1 Lake Park',
            notes: 'n',
          },
          {
            key: '2',
            name: 'Jim Green',
            age: 42,
            address: 'London No. 1 Lake Park',
            notes: 'm',
          },
          {
            key: '3',
            name: 'Joe Black',
            age: 32,
            address: 'Sidney No. 1 Lake Park',
            notes: 'k',
          },
        ]
      })
    }
  },
  't-notes': {
    onComponentInitial: params => {
      const { event, mApi } = params;
      mApi.addEventListener(event.key, 'onCellChange', (c, key, dataIndex, event) => {
        console.log('notes onCellChange', dataIndex);
        const { 'data-source': listData = [] } = mApi.getAttributes('tableId').props;
        const newdata = listData.map(row => {
          if (row.key === key) {
            return {
              ...row,
              [dataIndex]: event.target.value
            }
          }
          return row;
        })
        mApi.setAttributes('tableId', {
          'data-source': newdata
        });
      });
    }

  },
  btn_change_id: {
    onComponentInitial: params => {
      const { event, mApi } = params;
      mApi.addEventListener(event.key, 'click', () => {
        mApi.setAttributes('name', {
          value: new Date().getTime()
        });
      });
    }
  }
};

export default componentPlugin;
