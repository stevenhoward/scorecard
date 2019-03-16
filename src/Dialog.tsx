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

  const backdropStyle: CSSProperties = {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  };

  const foregroundStyle: CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: 3,
    padding: 20,
    width: 300,
    minHeight: 300,
    margin: '0 auto',
  };

  return (
    <div style={backdropStyle}>
      <div style={foregroundStyle}>
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

