import { mount } from 'svelte';
import './app.css';
import Corrupted from './Corrupted.svelte';

const app = mount(Corrupted, {
  target: document.getElementById('app')!
});

export default app;
