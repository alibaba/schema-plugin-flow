import React, { Component } from 'react';
import { Row, Col } from 'antd';
import SettingPanel from './settingPanel';
import './index.less';

const extConfig = JSON.parse(window.extConfig || '{}');
class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      settingType: 'bizPlg',
      useSavedSchema: false,
      sysExts: [],
      sysExtTypes: extConfig.sysExtTypes,
      customer: null,
      customerTyps: extConfig.customerTyps
    };
  }
  onSysExtChange = extIds => {
    this.setState({
      sysExts: extIds
    });
  }
  onCustomExtChange = customerId => {
    this.setState({
      customer: customerId
    });
  }
  onTypeChange = checked => {
    this.setState({
      settingType: checked ? 'bizPlg' : 'dragPlg'
    });
  }
  onSchemaTypeChange = checked => {
    this.setState({
      useSavedSchema: checked
    });
  }
  render() {
    const {
      settingType, useSavedSchema, sysExtTypes, sysExts = [], customer = '', customerTyps
    } = this.state;
    const src = window.location.href;
    let search = `useSavedSchema = ${useSavedSchema}&`;
    if (settingType === 'dragPlg') {
      search += `useDragPlg=${settingType === 'dragPlg'}&`;
    } else {
      search += `customer=${customer || ''}&sysExts=${sysExts.join(',')}&`;
    }
    return (
      <div className="form-demo-space">
        <Row className="form-demo-row">
          <Col span="16" className="form-demo-display">
            <iframe
              title="form"
              className="form-demo-iframe"
              key={customer + sysExts.join(',')}
              src={`${src}form-demo?${search}`}
            />
          </Col>
          <Col span="8" className="form-demo-settings">
            <SettingPanel
              onTypeChange={this.onTypeChange}
              useSavedSchema={useSavedSchema}
              onSchemaTypeChange={this.onSchemaTypeChange}
              settingType={settingType}
              sysExtTypes={sysExtTypes}
              sysExts={sysExts}
              customer={customer}
              customerTyps={customerTyps}
              onCustomExtChange={this.onCustomExtChange}
              onSysExtChange={this.onSysExtChange}
            />
          </Col>
        </Row>
      </div>
    );
  }
}

export default Main;
