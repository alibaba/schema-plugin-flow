const changeHandler = (context, value, ...other) => {
  const { key, eventName, getOldAttributes, getUpdatedStates, stop } = context.event;
  const preValue = getOldAttributes(key).value;
  const newValue = context.mApi.getAttributes(key).value;
  console.assert(`${newValue}next值` === value, '这个应该是被next修改后的值');
  console.log('subject self onChange', 'newVal:', newValue, 'value:', value, "preValue:", preValue);
  //stop();// 阻止后面的插件
  console.log('change return value:', context.event.eventReturnValue);
  setTimeout(() => {
    console.log('timeout stop');
    //stop(); 此时应该是调不到的

  }, 10);
  context.mApi.setAttributes(key, {
    value: 'onchange插件赋值'
  }, true).then(e => {
  });
};
const copPlugin = {
  subject: {
    onComponentInitial: (params) => {
      console.log('subject onInitial');
      const { event, mApi } = params;
      mApi.setAttributes(event.key, {
        label: 'test',
        onChange: "this is onChange"
      });
      let testR = '';
      const onTest = (testv) => {
        testR = testv;
        console.log('ttttttttttttttttttttttt:', testv);
      }
      mApi.addEventListener(event.key, 'onTest', (c, v) => onTest('normal'));
      mApi.addEventListener(event.key, 'onTest', (c, v) => onTest('prepose'), true);
      const testFunc = mApi.getAttributes(event.key).onTest;
      testFunc();// prepose应该先打印
      console.assert(testR === 'normal', 'prepose应该先打印');
      mApi.addEventListener(event.key, 'onChange', changeHandler);
      mApi.addEventListener(event.key, 'onChange', changeHandler);
    },
    afterPageRender: (params) => {
      const { event, mApi } = params;
      mApi.setGlobalData('afterrender',true);
      console.log('componentPlugin: after page render');
    }
  }
}
let test = false;
const pagePlugin = {
  onPageInitial: params => {
    console.log('page plugins initial');
    if(test===false){
      test=true;
      // 应该是要可以执行的，不过会影响test，注释
      //params.mApi.reloadPage();
    }
  },
  afterRender: ({ mApi }) => {
    console.log('page plugins after render');
    const watch = (ctx, changes, oldState) => {
      console.log('watch subject-------:', changes, 'oldState: ', oldState.value);
      mApi.setAttributes('test04', {
        test: 41
      });
    }
    const watch1 = (ctx, changes) => {
      console.log('watch1 subject-------:', changes);
      mApi.setAttributes('test04', {
        test: 42
      });
      mApi.setAttributes('test03', {
        test03: 3
      })
    }
    mApi.setAttributes('dddd', {}).then(v => {
      console.log('======== dddd', v);
    })
    mApi.watch('subject', watch);
    mApi.watch('subject', watch1);
    mApi.watch('test03', (c, v) => {
      console.log('watch3 test03-----', v);
      mApi.setAttributes('test05', {
        test05: 53
      })
    })
    mApi.watch('test04', (c, x) => {
      console.log('mApi.watch.event.key', c.event.key);
      console.log('watch4 test04-----', x);
      mApi.setAttributes('test05', {
        test05: 54
      })
    });
    // 由于先set04,再set03,则05最终应该等于53；
    mApi.watch('test05', (c, x) => {
      console.log('watch5', x);
    });
    //mApi.removeWatch('subject', watch);
    mApi.watch('setTestWatch', (c, ...payloads) => {
      console.log('mApi.watch.event.key', c.event.key);
      console.log('自定义watch: ', payloads);
    });
    setTimeout(() => {
      console.log('after render setTimeout');
      mApi.dispatchWatch('setTestWatch', { watchdata: '1111' });
      mApi.dispatchWatch('setTestWatch', [1111],[2222]);
      mApi.setAttributes('test04',{});
    }, 100);
  },
  onDestroy: parmas => {
    console.log('page destroy');
  }
}

export default { pagePlugin, componentPlugin: copPlugin }
