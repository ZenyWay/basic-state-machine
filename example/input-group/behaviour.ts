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
import { InputGroupViewProps, AddonButton } from './view'
import log from '../console'
import compose from 'basic-compose'
import { into } from 'basic-cursors'
import { BehaviourSpec, RxOperator } from 'component-from-stream'
import {
	Action, AutomataSpec, forward, keep, Reducer, withDefaults, withFsmReducer
} from '../reducers'
import { shallowEqual } from '../utils'
import { distinctUntilChanged, scan, tap } from 'rxjs/operators'

export interface InputGroupWithButtonProps {
  type: string,
  onInput: (event: any) => void,
  children: AddonButton,
  placeholder: string,
  disabled: boolean
}

const DEFAULT_PROPS = {
	type: 'text',
	value: '',
	autocorrect: 'off',
	autocomplete: 'off'
}

const actions: ActionCreatorMap<Action<any>> = {
	onInput(payload: any) {
		return { type: 'INPUT', payload }
	},
	onProps(payload: InputGroupWithButtonProps) {
		return { type: 'PROPS', payload }
	}
}

const fsm = {
	pristine: {
		PROPS: ['pristine', withDefaults(DEFAULT_PROPS)],
		INPUT: ['dirty', updateValue]
	},
	dirty: {
		PROPS: ['dirty', compose(withDefaults(DEFAULT_PROPS), keep('value'))],
		INPUT: ['dirty', updateValue],
		BLUR: ['pristine', keep()]
	}
} as AutomataSpec<Reducer<any,any>>

const dispatcher = createPropsDispatcher(actions)

const operator = compose(
  tap(log('input-group-with-button:view-props:')),
	distinctUntilChanged(shallowEqual),
	scan(withFsmReducer(fsm, 'pristine'), {})
) as RxOperator<InputGroupWithButtonProps,InputGroupViewProps>

const behaviour = {
  operator, dispatcher
} as BehaviourSpec<InputGroupWithButtonProps,Action<any>,InputGroupViewProps>

export default behaviour

function updateValue(previous, event) {
	event.preventDefault()
	const { value } = event.target
	return value === previous.value ? previous : { ...previous, value }
}

function valueFromInputEvent({ event }) {
  return event.payload.target.value
}
