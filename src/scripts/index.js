import $ from 'jquery';
import 'bootstrap/scss/bootstrap.scss';

import '../styles/main.sass';

import MirrorsRendering from './modules/index'

let container = document.querySelector('#container');
let app = new MirrorsRendering(container);