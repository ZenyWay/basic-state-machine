/**
 * @license
 * Copyright 2018 Stephane M. Catala
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * Limitations under the License.
 */
;
import createPropsDispatcher, { ActionCreatorMap } from 'with-event-handlers'
import { ButtonViewProps } from './view'
import {
  Action, AutomataSpec, keep, Reducer, toggle, withDefaults, withFsmReducer
} from '../reducers'
import { omit, shallowEqual } from '../utils'
import log from '../console'
import compose from 'basic-compose'
import { into } from 'basic-cursors'
import { BehaviourSpec, RxOperator } from 'component-from-stream'
import { distinctUntilChanged, map, scan, tap } from 'rxjs/operators'
import copyToClipboard = require('clipboard-copy')

export const DEFAULT_PROPS: CopyButtonProps = {
  value: '',
  timeout: 500, // ms
  icons: {
    disabled: 'fa-check',
    enabled: 'fa-copy'
  }
}

export interface CopyButtonProps {
  value: string
  timeout: number
  icons: ButtonIcons
}

export interface ButtonIcons {
  disabled: string, enabled: string
}

const fsm = {
  enabled: {
    CLICK: [
      'disabled',
      compose(toggle('disabled'), keep(), enableAfterTimeout, doCopyToClipboard)
    ],
    PROPS: ['enabled', withDefaults(DEFAULT_PROPS)]
  },
  disabled: {
    ENABLE: ['enabled', compose(toggle('disabled'), keep())],
    PROPS: ['disabled', compose(withDefaults(DEFAULT_PROPS), keep('disabled'))]
  }
} as AutomataSpec<Reducer<any,any>>

const actions: ActionCreatorMap<Action<any>> = {
  onClick(payload: any) {
    return { type: 'CLICK', payload }
  },
  enable() {
    return { type: 'ENABLE' }
  },
  onProps(payload: CopyButtonProps) {
    return { type: 'PROPS', payload }
  }
}

const dispatcher = createPropsDispatcher(actions)

const operator = compose(
  tap(log('copy-button:view-props:')),
  distinctUntilChanged(shallowEqual),
  map(omit('value', 'icons', 'timeout')), // clean-up
  map(into('icon')(iconFromDisabled)),
  scan(withFsmReducer(fsm, 'enabled'), {})
) as RxOperator<Action<any>,ButtonViewProps>

const behaviour = {
  operator, dispatcher
} as BehaviourSpec<CopyButtonProps,Action<any>,ButtonViewProps>

export default behaviour

function enableAfterTimeout(previous) {
  const { timeout, enable } = previous
  setTimeout(enable, timeout)
}

function doCopyToClipboard({ value }, event) {
  event.preventDefault()
  return copyToClipboard(value) //true on success
}

function iconFromDisabled ({ disabled, icons }: any) {
  return disabled ? icons.disabled : icons.enabled
}
