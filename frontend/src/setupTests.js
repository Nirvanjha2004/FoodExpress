// This is to handle MUI CSS vars issues
window.CSS = {
  supports: () => false,
  escape: () => '',
};

Object.defineProperty(window, 'CSS', { value: window.CSS });
