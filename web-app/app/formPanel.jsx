import React, { useState, useEffect } from 'react';
import { Spin } from 'antd';
import loadjs from 'load-js';
import FormDemo from './form';

const extConfig = JSON.parse(window.extConfig || '{}');
const Form = () => {
  const { search } = window.location;
  const [loading, setLoading] = useState(true);
  const params = new URLSearchParams(search);
  const useDragPlg = params.get('useDragPlg') === 'true';
  const useSavedSchema = params.get('useSavedSchema') === 'true';
  const customer = params.get('customer') || '';
  const sysExts = params.get('sysExts') || '';
  useEffect(() => {
    const { sysExtTypes, customerTyps } = extConfig;
    new Promise(res => {
      const urls = [];
      // 先加载系统扩展
      if (sysExts) {
        sysExts.split(',').forEach(id => {
          const item = sysExtTypes.find(i => i.value === id);
          if (item) {
            urls.push(item.url);
          }
        });
      }
      const citem = customerTyps.find(i => i.value === customer);
      if (citem) {
        urls.push(citem.url);
      }
      if (urls.length === 0) return res();
      return loadjs(urls).then(() => res());
    }).then(() => {
      setLoading(false);
    });
  }, [search]);
  if (loading) return <Spin className="form-demo-spin" size="large" tip="Loading extensions..." />;
  return (
    <div className="form-demo">
      <FormDemo
        key={customer + sysExts}
        openLogger={false}
        useDragPlg={useDragPlg}
        useSavedSchema={useSavedSchema}
      />
    </div>
  );
};

export default Form;
