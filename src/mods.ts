import { mount } from 'svelte';
import './app.css';
import Mods from './Mods.svelte';

const app = mount(Mods, {
  target: document.getElementById('app')!
});

export default app;
