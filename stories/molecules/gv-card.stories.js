/*
 * Copyright (C) 2015 The Gravitee team (http://gravitee.io)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import notes from '../../.docs/gv-card.md';
import '../../src/molecules/gv-card';
import horizontalImage from '../../assets/images/gravitee-logo.png';
import picture from '../../assets/images/logo.png';
import { makeStory, storyWait } from '../lib/make-story';
import logo from '../../assets/icons/gravitee/graviteeio.svg';

export default {
  title: 'Molecules|gv-card',
  component: 'gv-card',
  parameters: {
    notes,
  },
};

const conf = {
  component: 'gv-card',
};

const name = 'Supernova';
const version = 'v.1.1';
const states = [
  { value: 'beta', minor: true },
  { value: 'running', major: true },
];

const item = { name: 'Long Supernova', picture: horizontalImage, version, states };

const items = [
  { item: { name } },
  { item },
  { item: { name: 'Comet Api.', picture, version, states } },
  { item: { name: 'Comet Api.', picture: logo, version, states } },
];

export const basics = makeStory(conf, {
  items,
});

export const empty = makeStory(conf, {
  items: [{}],
});

export const loading = makeStory(conf, {
  items: [{ item: new Promise(() => ({})) }],
  simulations: [
    storyWait(2000, ([component]) => {
      component.item = item;
    }),
  ],
});

export const loadingAndError = makeStory(conf, {
  items: [{ item: new Promise(() => ({})) }],
  simulations: [
    storyWait(2000, ([component]) => {
      component.item = Promise.reject(new Error());
    }),
  ],
});