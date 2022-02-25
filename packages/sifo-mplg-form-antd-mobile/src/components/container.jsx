import React from 'react';
import cls from 'classnames';

const container = p => (<div {...p} className={cls('sifo-adm-container', p.className)} />);

export default container;
