import React, { Component, CSSProperties, ReactNode } from 'react';

export interface DialogProps {
  visible: boolean;
  onClose: ()=>void;
  children?: ReactNode;
}

export default function Dialog(props: DialogProps) {
  if (!props.visible) {
    return null;
  }

  return (
    <div className="modal is-active">
      <div className="modal-background"></div>
      <div className="modal-content" style={{ backgroundColor: 'white' }}>
        <div>
          {props.children}
        </div>
        <footer style={{ textAlign: 'center' }}>
          <button onClick={props.onClose} type="button">Cancel</button>
        </footer>
      </div>
    </div>
  );
}

