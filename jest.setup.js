import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';

// jsdom no expone TextEncoder/TextDecoder y react-router 7 los necesita al importarse.
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}
