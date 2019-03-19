import React, { Component } from 'react';

export interface PlayFragment {
  // 0 to indicate an out
  bases: number;

  // Text that either goes on the baseline or in the middle (for outs before a
  // runner reaches base)
  label: string;
}

