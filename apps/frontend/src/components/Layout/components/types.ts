import { JSX } from 'preact/jsx-runtime';

export interface INavigationItem {
  label: string;
  icon: JSX.Element;
  to: string;
}
