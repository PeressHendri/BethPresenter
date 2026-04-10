import type { Preview } from "@storybook/react";
import '../src/renderer/styles/design-tokens.css';
import '../src/renderer/index.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    viewport: {
      viewports: {
        desktop_hd: {
          name: 'Desktop 1080p',
          styles: { width: '1920px', height: '1080px' },
        },
        desktop_sd: {
          name: 'Desktop 768p',
          styles: { width: '1366px', height: '768px' },
        },
        tablet: {
          name: 'Tablet',
          styles: { width: '1024px', height: '768px' },
        },
        mobile: {
          name: 'Mobile Remote',
          styles: { width: '375px', height: '667px' },
        },
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#050508' },
        { name: 'light', value: '#f8fafc' },
      ],
    },
  },
};

export default preview;
